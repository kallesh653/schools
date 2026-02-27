package com.school.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "parents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Parent extends BaseEntity {

    @Column(name = "father_name", length = 100)
    private String fatherName;

    @Column(name = "father_occupation", length = 100)
    private String fatherOccupation;

    @Column(name = "father_phone", length = 20)
    private String fatherPhone;

    @Column(name = "father_email", length = 100)
    private String fatherEmail;

    @Column(name = "mother_name", length = 100)
    private String motherName;

    @Column(name = "mother_occupation", length = 100)
    private String motherOccupation;

    @Column(name = "mother_phone", length = 20)
    private String motherPhone;

    @Column(name = "mother_email", length = 100)
    private String motherEmail;

    @Column(name = "guardian_name", length = 100)
    private String guardianName;

    @Column(name = "guardian_phone", length = 20)
    private String guardianPhone;

    @Column(name = "guardian_email", length = 100)
    private String guardianEmail;

    @Column(name = "guardian_relation", length = 50)
    private String guardianRelation;

    @Column(length = 1000)
    private String address;

    @Column(name = "emergency_contact", length = 20)
    private String emergencyContact;
}
