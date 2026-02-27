package com.school.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "subjects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Subject extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name; // e.g., "Mathematics", "English"

    @Column(nullable = false, unique = true, length = 20)
    private String code; // e.g., "MATH", "ENG"

    @Column(name = "subject_type", length = 20)
    private String subjectType; // THEORY, PRACTICAL

    @Column(name = "max_marks")
    private Integer maxMarks;

    @Column(name = "theory_max_marks")
    private Integer theoryMaxMarks;

    @Column(name = "practical_max_marks")
    private Integer practicalMaxMarks;

    @Column(name = "pass_marks")
    private Integer passMarks;

    @Column(length = 500)
    private String description;
}
