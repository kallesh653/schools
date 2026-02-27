package com.school.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "examinations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Examination extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name; // e.g., "Mid-term", "Final"

    @Column(name = "exam_type", length = 50)
    private String examType; // UNIT_TEST, MID_TERM, FINAL

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id", nullable = false)
    private AcademicYear academicYear;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private Boolean published = false;
}
