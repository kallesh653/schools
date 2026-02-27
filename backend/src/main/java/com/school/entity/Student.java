package com.school.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Student extends BaseEntity {

    @Column(name = "admission_no", nullable = false, unique = true, length = 50)
    private String admissionNo;

    @Column(name = "roll_no", length = 20)
    private String rollNo;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(length = 10)
    private String gender; // MALE, FEMALE, OTHER

    @Column(name = "blood_group", length = 10)
    private String bloodGroup;

    @Column(length = 500)
    private String photo;

    @Column(length = 1000)
    private String address;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String email;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id")
    private SchoolClass schoolClass;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id")
    private Section section;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id")
    private AcademicYear academicYear;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Parent parent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transport_route_id")
    private TransportRoute transportRoute;

    @Column(name = "admission_date")
    private LocalDate admissionDate;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "previous_school", length = 200)
    private String previousSchool;
}
