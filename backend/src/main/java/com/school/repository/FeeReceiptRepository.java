package com.school.repository;

import com.school.entity.FeeReceipt;
import com.school.entity.FeePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FeeReceiptRepository extends JpaRepository<FeeReceipt, Long> {
    Optional<FeeReceipt> findByPayment(FeePayment payment);
    Optional<FeeReceipt> findByReceiptNo(String receiptNo);
}
