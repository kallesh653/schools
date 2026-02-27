package com.school.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "school_profile")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class SchoolProfile extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 500)
    private String logo;

    @Column(length = 500)
    private String address;

    @Column(length = 20)
    private String contact;

    @Column(length = 100)
    private String email;

    @Column(length = 50)
    private String code;

    @Column(length = 200)
    private String affiliation;

    @Column(length = 100)
    private String principalName;

    @Column(length = 500)
    private String website;

    @Column(length = 1000)
    private String description;
}
