package com.school.dto;

import lombok.Data;

@Data
public class CreateTeacherRequest {
    // Teacher fields
    private String firstName;
    private String lastName;
    private String dateOfBirth;
    private String gender;
    private String phone;
    private String email;
    private String qualification;
    private String experience;
    private String designation;
    private String specialization;
    private String address;
    private String joiningDate;

    // Login credentials (set by admin when adding teacher)
    private String loginUsername;
    private String loginPassword;
}
