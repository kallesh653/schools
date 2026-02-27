package com.school.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "fee_structures")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class FeeStructure extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private SchoolClass schoolClass;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id", nullable = false)
    private AcademicYear academicYear;

    @Column(name = "tuition_fee")
    private Double tuitionFee;

    @Column(name = "admission_fee")
    private Double admissionFee;

    @Column(name = "exam_fee")
    private Double examFee;

    @Column(name = "transport_fee")
    private Double transportFee;

    @Column(name = "library_fee")
    private Double libraryFee;

    @Column(name = "lab_fee")
    private Double labFee;

    @Column(name = "sports_fee")
    private Double sportsFee;

    @Column(name = "other_fee")
    private Double otherFee;

    @Column(name = "total_fee", nullable = false)
    private Double totalFee;

    @Column(name = "installment_type", length = 20)
    private String installmentType; // MONTHLY, QUARTERLY, ANNUALLY

    @Column(length = 500)
    private String description;
}
