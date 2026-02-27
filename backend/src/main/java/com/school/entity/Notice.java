package com.school.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "notices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Notice extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 3000)
    private String content;

    @Column(name = "notice_type", length = 50)
    private String noticeType; // GENERAL, URGENT, EXAM, HOLIDAY, FEE, EVENT

    @Column(name = "target_audience", length = 50)
    private String targetAudience; // ALL, STUDENTS, PARENTS, TEACHERS, CLASS_SPECIFIC

    @Column(name = "target_class_id")
    private Long targetClassId;

    @Column(name = "target_section_id")
    private Long targetSectionId;

    @Column(name = "publish_date")
    private java.time.LocalDate publishDate;

    @Column(name = "expiry_date")
    private java.time.LocalDate expiryDate;

    @Column(length = 20)
    private String priority; // LOW, NORMAL, HIGH, URGENT

    @Column(name = "attachment_url", length = 500)
    private String attachmentUrl;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(nullable = false)
    private Boolean published = false;

    @Column(nullable = false)
    private Boolean sendSms = false;

    @Column(nullable = false)
    private Boolean sendEmail = false;
}
