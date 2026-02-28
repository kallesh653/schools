package com.school.controller;

import com.school.entity.*;
import com.school.repository.*;
import com.school.service.SmsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/sms")
@CrossOrigin(origins = "*")
public class SmsController {

    @Autowired private SmsService smsService;
    @Autowired private SmsLogRepository smsLogRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private SchoolClassRepository schoolClassRepository;
    @Autowired private SectionRepository sectionRepository;
    @Autowired private AttendanceRepository attendanceRepository;
    @Autowired private NoticeRepository noticeRepository;
    @Autowired private FeePaymentRepository feePaymentRepository;
    @Autowired private AcademicYearRepository academicYearRepository;
    @Autowired private FeeStructureRepository feeStructureRepository;

    private String getCurrentUser() {
        try { return SecurityContextHolder.getContext().getAuthentication().getName(); }
        catch (Exception e) { return "admin"; }
    }

    private String getParentPhone(Student student) {
        if (student.getParent() == null) return null;
        Parent p = student.getParent();
        if (p.getFatherPhone() != null && !p.getFatherPhone().trim().isEmpty()) return p.getFatherPhone().trim();
        if (p.getMotherPhone() != null && !p.getMotherPhone().trim().isEmpty()) return p.getMotherPhone().trim();
        if (p.getGuardianPhone() != null && !p.getGuardianPhone().trim().isEmpty()) return p.getGuardianPhone().trim();
        return null;
    }

    private String getParentName(Student student) {
        if (student.getParent() == null) return "Parent";
        Parent p = student.getParent();
        if (p.getFatherName() != null && !p.getFatherName().trim().isEmpty()) return p.getFatherName().trim();
        if (p.getMotherName() != null && !p.getMotherName().trim().isEmpty()) return p.getMotherName().trim();
        return "Parent";
    }

    // GET /sms/status - check if SMS is configured
    @GetMapping("/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("configured", smsService.isConfigured());
        status.put("schoolName", smsService.getSchoolName());
        return ResponseEntity.ok(status);
    }

    // GET /sms/balance - check Fast2SMS balance
    @GetMapping("/balance")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getBalance() {
        return ResponseEntity.ok(smsService.checkBalance());
    }

    // GET /sms/logs - get all SMS logs
    @GetMapping("/logs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SmsLog>> getLogs() {
        return ResponseEntity.ok(smsLogRepository.findAllByOrderByCreatedAtDesc());
    }

    // POST /sms/send - custom message to specific numbers
    @PostMapping("/send")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> sendCustom(@RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<String> numbers = (List<String>) body.get("numbers");
        String message = (String) body.get("message");
        if (message == null || message.trim().isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error", "Message is required"));
        return ResponseEntity.ok(smsService.sendBulkSms(numbers, null, message, "CUSTOM", getCurrentUser(), "Custom"));
    }

    // POST /sms/send-to-class - send to all parents of a class/section
    @PostMapping("/send-to-class")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> sendToClass(@RequestBody Map<String, Object> body) {
        Long classId = body.get("classId") != null ? Long.valueOf(body.get("classId").toString()) : null;
        Long sectionId = body.get("sectionId") != null ? Long.valueOf(body.get("sectionId").toString()) : null;
        String message = (String) body.get("message");
        if (message == null || message.trim().isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error", "Message is required"));

        List<Student> students;
        String ref = "All Parents";
        if (classId != null) {
            SchoolClass cls = new SchoolClass(); cls.setId(classId);
            if (sectionId != null) {
                Section sec = new Section(); sec.setId(sectionId);
                students = studentRepository.findBySchoolClassAndSection(cls, sec);
                ref = "Class " + classId + " Sec " + sectionId;
            } else {
                students = studentRepository.findAll().stream()
                    .filter(s -> s.getSchoolClass() != null && s.getSchoolClass().getId().equals(classId))
                    .collect(Collectors.toList());
                ref = "Class " + classId;
            }
        } else {
            students = studentRepository.findAll();
        }

        List<String> phones = new ArrayList<>();
        List<String> names = new ArrayList<>();
        for (Student s : students) {
            String phone = getParentPhone(s);
            if (phone != null && !phone.isEmpty()) {
                phones.add(phone);
                names.add(getParentName(s));
            }
        }
        return ResponseEntity.ok(smsService.sendBulkSms(phones, names, message, "CUSTOM", getCurrentUser(), ref));
    }

    // POST /sms/absent-alert - send absent alerts for a date
    @PostMapping("/absent-alert")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> sendAbsentAlert(@RequestBody Map<String, Object> body) {
        String dateStr = (String) body.get("date");
        Long classId = body.get("classId") != null ? Long.valueOf(body.get("classId").toString()) : null;
        Long sectionId = body.get("sectionId") != null ? Long.valueOf(body.get("sectionId").toString()) : null;
        String customMsg = (String) body.get("message");

        LocalDate date = dateStr != null ? LocalDate.parse(dateStr) : LocalDate.now();
        String dateFormatted = date.format(DateTimeFormatter.ofPattern("dd-MM-yyyy"));
        String school = smsService.getSchoolName();

        List<Attendance> attendances;
        if (classId != null && sectionId != null) {
            SchoolClass cls = new SchoolClass(); cls.setId(classId);
            Section sec = new Section(); sec.setId(sectionId);
            attendances = attendanceRepository.findBySchoolClassAndSectionAndDate(cls, sec, date);
        } else if (classId != null) {
            attendances = attendanceRepository.findByDate(date).stream()
                .filter(a -> a.getSchoolClass() != null && a.getSchoolClass().getId().equals(classId))
                .collect(Collectors.toList());
        } else {
            attendances = attendanceRepository.findByDate(date);
        }

        List<Attendance> absents = attendances.stream()
            .filter(a -> "ABSENT".equals(a.getStatus())).collect(Collectors.toList());

        if (absents.isEmpty()) {
            return ResponseEntity.ok(Map.of("success", true, "sentCount", 0, "message", "No absent students found for " + dateFormatted));
        }

        int totalSent = 0;
        for (Attendance att : absents) {
            Student student = att.getStudent();
            String phone = getParentPhone(student);
            if (phone == null || phone.isEmpty()) continue;
            String studentName = student.getFirstName() + " " + student.getLastName();
            String msg = customMsg != null && !customMsg.isEmpty() ? customMsg
                : "Dear Parent, " + studentName + " was marked ABSENT on " + dateFormatted +
                  ". Please ensure regular attendance. - " + school;
            Map<String, Object> res = smsService.sendBulkSms(
                List.of(phone), List.of(getParentName(student)), msg, "ATTENDANCE_ALERT", getCurrentUser(),
                "Absent:" + studentName + ":" + dateFormatted);
            if (Boolean.TRUE.equals(res.get("success"))) totalSent++;
        }

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("sentCount", totalSent);
        result.put("absentCount", absents.size());
        result.put("date", dateFormatted);
        return ResponseEntity.ok(result);
    }

    // POST /sms/notice/{noticeId} - send notice notification to parents
    @PostMapping("/notice/{noticeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> sendNoticeAlert(
            @PathVariable Long noticeId, @RequestBody(required = false) Map<String, Object> body) {
        Notice notice = noticeRepository.findById(noticeId)
            .orElseThrow(() -> new RuntimeException("Notice not found"));
        String school = smsService.getSchoolName();
        String content = notice.getContent() != null && notice.getContent().length() > 100
            ? notice.getContent().substring(0, 97) + "..." : notice.getContent();
        String message = (body != null && body.get("message") != null) ? (String) body.get("message")
            : "Dear Parent, Notice: " + notice.getTitle() + ". " + content + " - " + school;

        // Get all students to find parent phones based on target audience
        List<Student> students = studentRepository.findAll();
        List<String> phones = new ArrayList<>();
        List<String> names = new ArrayList<>();
        for (Student s : students) {
            String phone = getParentPhone(s);
            if (phone != null && !phone.isEmpty()) {
                phones.add(phone);
                names.add(getParentName(s));
            }
        }
        return ResponseEntity.ok(smsService.sendBulkSms(phones, names, message, "NOTICE_ALERT",
            getCurrentUser(), "Notice:" + notice.getTitle()));
    }

    // POST /sms/fee-reminder - send fee reminder
    @PostMapping("/fee-reminder")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> sendFeeReminder(@RequestBody Map<String, Object> body) {
        Long classId = body.get("classId") != null ? Long.valueOf(body.get("classId").toString()) : null;
        String customMsg = (String) body.get("message");
        String school = smsService.getSchoolName();

        AcademicYear activeYear = academicYearRepository.findByIsActiveTrue().orElse(null);
        List<Student> students = classId != null
            ? studentRepository.findAll().stream()
                .filter(s -> s.getSchoolClass() != null && s.getSchoolClass().getId().equals(classId))
                .collect(Collectors.toList())
            : studentRepository.findAll();

        int totalSent = 0;
        for (Student student : students) {
            if (student.getSchoolClass() == null) continue;
            FeeStructure structure = activeYear != null
                ? feeStructureRepository.findBySchoolClassAndAcademicYear(student.getSchoolClass(), activeYear).orElse(null)
                : null;
            if (structure == null || structure.getTotalFee() == null) continue;

            java.math.BigDecimal total = java.math.BigDecimal.valueOf(structure.getTotalFee());
            java.math.BigDecimal paid = activeYear != null
                ? feePaymentRepository.getTotalPaidByStudentAndAcademicYear(student, activeYear) : java.math.BigDecimal.ZERO;
            if (paid == null) paid = java.math.BigDecimal.ZERO;
            java.math.BigDecimal pending = total.subtract(paid);

            if (pending.compareTo(java.math.BigDecimal.ZERO) <= 0) continue;

            String phone = getParentPhone(student);
            if (phone == null || phone.isEmpty()) continue;
            String studentName = student.getFirstName() + " " + student.getLastName();
            String msg = customMsg != null && !customMsg.isEmpty() ? customMsg
                : "Dear Parent, Fee of Rs." + pending.intValue() + " is pending for " + studentName +
                  ". Please pay at the earliest to avoid late fees. - " + school;

            Map<String, Object> res = smsService.sendBulkSms(
                List.of(phone), List.of(getParentName(student)), msg, "FEE_REMINDER", getCurrentUser(),
                "FeeReminder:" + studentName + ":Rs." + pending.intValue());
            if (Boolean.TRUE.equals(res.get("success"))) totalSent++;
        }

        return ResponseEntity.ok(Map.of("success", true, "sentCount", totalSent));
    }

    // GET /sms/preview/absent - preview absent students for a date/class
    @GetMapping("/preview/absent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> previewAbsent(
            @RequestParam String date,
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) Long sectionId) {
        LocalDate localDate = LocalDate.parse(date);
        List<Attendance> attendances;
        if (classId != null && sectionId != null) {
            SchoolClass cls = new SchoolClass(); cls.setId(classId);
            Section sec = new Section(); sec.setId(sectionId);
            attendances = attendanceRepository.findBySchoolClassAndSectionAndDate(cls, sec, localDate);
        } else if (classId != null) {
            attendances = attendanceRepository.findByDate(localDate).stream()
                .filter(a -> a.getSchoolClass() != null && a.getSchoolClass().getId().equals(classId))
                .collect(Collectors.toList());
        } else {
            attendances = attendanceRepository.findByDate(localDate);
        }

        List<Map<String, Object>> result = attendances.stream()
            .filter(a -> "ABSENT".equals(a.getStatus()))
            .map(a -> {
                Student s = a.getStudent();
                Map<String, Object> m = new HashMap<>();
                m.put("studentId", s.getId());
                m.put("studentName", s.getFirstName() + " " + s.getLastName());
                m.put("class", s.getSchoolClass() != null ? s.getSchoolClass().getName() : "");
                m.put("section", s.getSection() != null ? s.getSection().getName() : "");
                m.put("parentName", getParentName(s));
                m.put("phone", getParentPhone(s) != null ? getParentPhone(s) : "No phone");
                m.put("hasPhone", getParentPhone(s) != null);
                return m;
            }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    // GET /sms/preview/fee-pending - preview pending fee students
    @GetMapping("/preview/fee-pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> previewFeePending(
            @RequestParam(required = false) Long classId) {
        AcademicYear activeYear = academicYearRepository.findByIsActiveTrue().orElse(null);
        List<Student> students = classId != null
            ? studentRepository.findAll().stream()
                .filter(s -> s.getSchoolClass() != null && s.getSchoolClass().getId().equals(classId))
                .collect(Collectors.toList())
            : studentRepository.findAll();

        List<Map<String, Object>> result = new ArrayList<>();
        for (Student student : students) {
            if (student.getSchoolClass() == null) continue;
            FeeStructure structure = activeYear != null
                ? feeStructureRepository.findBySchoolClassAndAcademicYear(student.getSchoolClass(), activeYear).orElse(null)
                : null;
            if (structure == null || structure.getTotalFee() == null) continue;
            java.math.BigDecimal total = java.math.BigDecimal.valueOf(structure.getTotalFee());
            java.math.BigDecimal paid = activeYear != null
                ? feePaymentRepository.getTotalPaidByStudentAndAcademicYear(student, activeYear) : java.math.BigDecimal.ZERO;
            if (paid == null) paid = java.math.BigDecimal.ZERO;
            java.math.BigDecimal pending = total.subtract(paid);
            if (pending.compareTo(java.math.BigDecimal.ZERO) <= 0) continue;

            Map<String, Object> m = new HashMap<>();
            m.put("studentId", student.getId());
            m.put("studentName", student.getFirstName() + " " + student.getLastName());
            m.put("class", student.getSchoolClass().getName());
            m.put("section", student.getSection() != null ? student.getSection().getName() : "");
            m.put("parentName", getParentName(student));
            m.put("phone", getParentPhone(student) != null ? getParentPhone(student) : "No phone");
            m.put("hasPhone", getParentPhone(student) != null);
            m.put("pendingAmount", pending.intValue());
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }
}
