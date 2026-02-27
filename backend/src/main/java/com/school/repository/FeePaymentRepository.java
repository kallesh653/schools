package com.school.repository;

import com.school.entity.FeePayment;
import com.school.entity.Student;
import com.school.entity.AcademicYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface FeePaymentRepository extends JpaRepository<FeePayment, Long> {
    List<FeePayment> findByStudent(Student student);
    List<FeePayment> findByStudentAndAcademicYear(Student student, AcademicYear academicYear);
    List<FeePayment> findByPaymentDateBetween(LocalDate startDate, LocalDate endDate);

    @Query("SELECT SUM(f.amount) FROM FeePayment f WHERE f.student = :student AND f.academicYear = :academicYear")
    BigDecimal getTotalPaidByStudentAndAcademicYear(@Param("student") Student student, @Param("academicYear") AcademicYear academicYear);

    @Query("SELECT SUM(f.amount) FROM FeePayment f WHERE f.paymentDate BETWEEN :startDate AND :endDate")
    BigDecimal getTotalCollectionBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
