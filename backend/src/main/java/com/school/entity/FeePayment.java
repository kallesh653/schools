package com.school.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "fee_payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class FeePayment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id", nullable = false)
    private AcademicYear academicYear;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Column(name = "payment_mode", length = 50)
    private String paymentMode; // CASH, CARD, UPI, NET_BANKING, CHEQUE

    @Column(name = "transaction_id", length = 100)
    private String transactionId;

    @Column(name = "cheque_no", length = 50)
    private String chequeNo;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(length = 500)
    private String remarks;

    @Column(name = "collected_by", length = 100)
    private String collectedBy;
}
