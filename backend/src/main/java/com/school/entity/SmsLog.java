package com.school.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "sms_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class SmsLog extends BaseEntity {

    @Column(name = "recipient_name", length = 200)
    private String recipientName;

    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;

    @Column(name = "message", nullable = false, length = 2000)
    private String message;

    @Column(name = "message_type", length = 50)
    private String messageType; // CUSTOM, ATTENDANCE_ALERT, NOTICE_ALERT, FEE_REMINDER, VOICE

    @Column(name = "status", length = 20)
    private String status; // SENT, FAILED

    @Column(name = "api_response", length = 500)
    private String apiResponse;

    @Column(name = "sent_by", length = 100)
    private String sentBy;

    @Column(name = "reference_info", length = 200)
    private String referenceInfo;
}
