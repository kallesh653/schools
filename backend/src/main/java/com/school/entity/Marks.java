package com.school.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "marks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Marks extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    private Examination examination;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(name = "theory_marks")
    private Integer theoryMarks;

    @Column(name = "practical_marks")
    private Integer practicalMarks;

    @Column(name = "total_marks")
    private Integer totalMarks;

    @Column(length = 5)
    private String grade; // A+, A, B+, B, C, D, F

    @Column(length = 20)
    private String result; // PASS, FAIL

    @Column(length = 500)
    private String remarks;

    @Column(name = "entered_by", length = 100)
    private String enteredBy;

    @Column(name = "is_absent")
    private Boolean isAbsent;
}
