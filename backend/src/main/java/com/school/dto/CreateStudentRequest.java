package com.school.dto;

import lombok.Data;

@Data
public class CreateStudentRequest {
    // Student fields
    private String firstName;
    private String lastName;
    private String dateOfBirth;
    private String gender;
    private String bloodGroup;
    private String address;
    private String phone;
    private String email;
    private String rollNo;
    private String admissionDate;
    private Long classId;
    private Long sectionId;
    private Long academicYearId;

    // Parent login credentials (set by admin when adding student)
    private String parentUsername;
    private String parentPassword;
    private String parentFullName;
    private String parentPhone;
    private String parentEmail;

    // Parent information
    private String fatherName;
    private String fatherPhone;
    private String fatherEmail;
    private String fatherOccupation;
    private String motherName;
    private String motherPhone;
    private String motherEmail;
    private String motherOccupation;
    private String address2; // parent address
    private String emergencyContact;
}
