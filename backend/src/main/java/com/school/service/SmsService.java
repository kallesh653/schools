package com.school.service;

import com.school.entity.SmsLog;
import com.school.repository.SmsLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SmsService {

    @Value("${sms.fast2sms.apikey:}")
    private String apiKey;

    @Value("${school.name:School}")
    private String schoolName;

    @Autowired
    private SmsLogRepository smsLogRepository;

    public String getSchoolName() { return schoolName; }
    public boolean isConfigured() { return apiKey != null && !apiKey.isEmpty() && !apiKey.equals("YOUR_API_KEY_HERE"); }

    public Map<String, Object> sendBulkSms(List<String> phoneNumbers, List<String> recipientNames,
                                            String message, String messageType, String sentBy, String referenceInfo) {
        if (phoneNumbers == null || phoneNumbers.isEmpty()) {
            return Map.of("success", false, "error", "No phone numbers provided", "sentCount", 0, "failedCount", 0);
        }

        // Clean numbers - keep only 10-digit Indian numbers
        List<String> cleanNumbers = phoneNumbers.stream()
            .filter(n -> n != null && !n.trim().isEmpty())
            .map(n -> n.replaceAll("[^0-9]", ""))
            .map(n -> n.length() > 10 ? n.substring(n.length() - 10) : n)
            .filter(n -> n.length() == 10)
            .distinct()
            .collect(Collectors.toList());

        if (cleanNumbers.isEmpty()) {
            return Map.of("success", false, "error", "No valid 10-digit phone numbers", "sentCount", 0, "failedCount", 0);
        }

        int sentCount = 0;
        int failedCount = 0;
        String apiResponse = "";
        boolean success = false;

        if (isConfigured()) {
            try {
                String numbersStr = String.join(",", cleanNumbers);
                String encodedMsg = URLEncoder.encode(message, StandardCharsets.UTF_8);
                String urlStr = "https://www.fast2sms.com/dev/bulkV2?authorization=" + apiKey
                    + "&route=q&message=" + encodedMsg + "&language=english&flash=0&numbers=" + numbersStr;

                URL url = new URL(urlStr);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setConnectTimeout(15000);
                conn.setReadTimeout(15000);
                conn.setRequestProperty("cache-control", "no-cache");

                int responseCode = conn.getResponseCode();
                BufferedReader reader = new BufferedReader(new InputStreamReader(
                    responseCode == 200 ? conn.getInputStream() : conn.getErrorStream(), StandardCharsets.UTF_8));
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) sb.append(line);
                reader.close();
                conn.disconnect();

                apiResponse = sb.toString();
                success = responseCode == 200 && apiResponse.contains("\"return\":true");
            } catch (Exception e) {
                apiResponse = "Error: " + e.getMessage();
                success = false;
            }
        } else {
            // Demo mode - log without sending
            apiResponse = "DEMO_MODE: API key not configured";
            success = true; // In demo mode, show as "sent" for testing UI
        }

        // Save SMS logs
        for (int i = 0; i < cleanNumbers.size(); i++) {
            String phone = cleanNumbers.get(i);
            String name = (recipientNames != null && i < recipientNames.size()) ? recipientNames.get(i) : "";
            SmsLog log = new SmsLog();
            log.setPhoneNumber(phone);
            log.setRecipientName(name);
            log.setMessage(message);
            log.setMessageType(messageType);
            log.setStatus(success ? "SENT" : "FAILED");
            log.setApiResponse(apiResponse.substring(0, Math.min(apiResponse.length(), 490)));
            log.setSentBy(sentBy);
            log.setReferenceInfo(referenceInfo);
            smsLogRepository.save(log);
            if (success) sentCount++; else failedCount++;
        }

        Map<String, Object> result = new HashMap<>();
        result.put("success", success);
        result.put("sentCount", sentCount);
        result.put("failedCount", failedCount);
        result.put("totalNumbers", cleanNumbers.size());
        result.put("apiResponse", apiResponse);
        if (!isConfigured()) result.put("demoMode", true);
        return result;
    }

    public Map<String, Object> checkBalance() {
        if (!isConfigured()) return Map.of("success", false, "error", "API key not configured");
        try {
            URL url = new URL("https://www.fast2sms.com/dev/wallet?authorization=" + apiKey);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(10000);
            BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) sb.append(line);
            reader.close();
            conn.disconnect();
            return Map.of("success", true, "data", sb.toString());
        } catch (Exception e) {
            return Map.of("success", false, "error", e.getMessage());
        }
    }
}
