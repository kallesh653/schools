package com.school.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "classes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class SchoolClass extends BaseEntity {

    @Column(nullable = false, length = 50)
    private String name; // e.g., "Class 1", "Class 10"

    @Column(unique = true, length = 20)
    private String code; // e.g., "CLASS_1", "CLASS_10"

    @Column
    private Integer grade; // 1-12

    @Column
    private Integer capacity;

    @Column(length = 500)
    private String description;
}
