package com.school.controller;

import com.school.dto.MessageResponse;
import com.school.entity.*;
import com.school.exception.ResourceNotFoundException;
import com.school.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/fees")
@CrossOrigin(origins = "*")
public class FeeController {

    @Autowired
    private FeeStructureRepository feeStructureRepository;

    @Autowired
    private FeePaymentRepository feePaymentRepository;

    @Autowired
    private FeeReceiptRepository feeReceiptRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AcademicYearRepository academicYearRepository;

    // Fee Structure Endpoints
    @GetMapping("/structures")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<FeeStructure>> getAllFeeStructures() {
        return ResponseEntity.ok(feeStructureRepository.findAll());
    }

    @GetMapping("/structures/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<FeeStructure> getFeeStructureById(@PathVariable Long id) {
        FeeStructure structure = feeStructureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee Structure", "id", id));
        return ResponseEntity.ok(structure);
    }

    @PostMapping("/structures")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeeStructure> createFeeStructure(@RequestBody FeeStructure structure) {
        return ResponseEntity.ok(feeStructureRepository.save(structure));
    }

    @PutMapping("/structures/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeeStructure> updateFeeStructure(@PathVariable Long id, @RequestBody FeeStructure structure) {
        FeeStructure existing = feeStructureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee Structure", "id", id));

        existing.setTuitionFee(structure.getTuitionFee());
        existing.setTransportFee(structure.getTransportFee());
        existing.setLibraryFee(structure.getLibraryFee());
        existing.setLabFee(structure.getLabFee());
        existing.setSportsFee(structure.getSportsFee());
        existing.setOtherFee(structure.getOtherFee());
        existing.setTotalFee(structure.getTotalFee());
        existing.setInstallmentType(structure.getInstallmentType());

        return ResponseEntity.ok(feeStructureRepository.save(existing));
    }

    @DeleteMapping("/structures/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteFeeStructure(@PathVariable Long id) {
        FeeStructure structure = feeStructureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee Structure", "id", id));
        feeStructureRepository.delete(structure);
        return ResponseEntity.ok(new MessageResponse("Fee structure deleted successfully"));
    }

    // Fee Payment Endpoints
    @GetMapping("/payments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FeePayment>> getAllPayments() {
        return ResponseEntity.ok(feePaymentRepository.findAll());
    }

    @GetMapping("/payments/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PARENT')")
    public ResponseEntity<List<FeePayment>> getStudentPayments(@PathVariable Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));
        return ResponseEntity.ok(feePaymentRepository.findByStudent(student));
    }

    @GetMapping("/status/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PARENT')")
    public ResponseEntity<Map<String, Object>> getStudentFeeStatus(@PathVariable Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        AcademicYear activeYear = academicYearRepository.findByIsActiveTrue().orElse(null);
        if (activeYear == null) {
            Map<String, Object> emptyStatus = new HashMap<>();
            emptyStatus.put("totalFee", java.math.BigDecimal.ZERO);
            emptyStatus.put("paidAmount", java.math.BigDecimal.ZERO);
            emptyStatus.put("pendingAmount", java.math.BigDecimal.ZERO);
            emptyStatus.put("feeStructure", null);
            emptyStatus.put("payments", List.of());
            emptyStatus.put("note", "No active academic year configured. Please set an active academic year in Configuration.");
            return ResponseEntity.ok(emptyStatus);
        }

        FeeStructure structure = student.getSchoolClass() != null
                ? feeStructureRepository.findBySchoolClassAndAcademicYear(student.getSchoolClass(), activeYear).orElse(null)
                : null;

        BigDecimal totalFee = structure != null && structure.getTotalFee() != null
                ? BigDecimal.valueOf(structure.getTotalFee()) : BigDecimal.ZERO;
        BigDecimal paidAmount = feePaymentRepository.getTotalPaidByStudentAndAcademicYear(student, activeYear);
        if (paidAmount == null) paidAmount = BigDecimal.ZERO;
        BigDecimal pendingAmount = totalFee.subtract(paidAmount);

        Map<String, Object> status = new HashMap<>();
        status.put("totalFee", totalFee);
        status.put("paidAmount", paidAmount);
        status.put("pendingAmount", pendingAmount);
        status.put("feeStructure", structure);
        status.put("payments", feePaymentRepository.findByStudentAndAcademicYear(student, activeYear));

        return ResponseEntity.ok(status);
    }

    @PostMapping("/payments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> createPayment(@RequestBody FeePayment payment) {
        FeePayment savedPayment = feePaymentRepository.save(payment);

        // Generate receipt
        FeeReceipt receipt = new FeeReceipt();
        receipt.setPayment(savedPayment);
        receipt.setReceiptNo("REC" + System.currentTimeMillis());
        FeeReceipt savedReceipt = feeReceiptRepository.save(receipt);

        Map<String, Object> response = new HashMap<>();
        response.put("payment", savedPayment);
        response.put("receipt", savedReceipt);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/payments/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeePayment> updatePayment(@PathVariable Long id, @RequestBody FeePayment payment) {
        FeePayment existing = feePaymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee Payment", "id", id));

        existing.setAmount(payment.getAmount());
        existing.setPaymentMode(payment.getPaymentMode());
        existing.setTransactionId(payment.getTransactionId());
        existing.setRemarks(payment.getRemarks());
        // Note: Payment date should not be changed for audit purposes
        // existing.setPaymentDate(payment.getPaymentDate());

        return ResponseEntity.ok(feePaymentRepository.save(existing));
    }

    @DeleteMapping("/payments/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deletePayment(@PathVariable Long id) {
        FeePayment payment = feePaymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee Payment", "id", id));

        // Delete associated receipt first
        FeeReceipt receipt = feeReceiptRepository.findByPayment(payment).orElse(null);
        if (receipt != null) {
            feeReceiptRepository.delete(receipt);
        }

        feePaymentRepository.delete(payment);
        return ResponseEntity.ok(new MessageResponse("Fee payment deleted successfully"));
    }

    @GetMapping("/reports/daily")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDailyReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<FeePayment> payments = feePaymentRepository.findByPaymentDateBetween(date, date);
        BigDecimal total = feePaymentRepository.getTotalCollectionBetweenDates(date, date);

        Map<String, Object> report = new HashMap<>();
        report.put("date", date);
        report.put("payments", payments);
        report.put("totalCollection", total != null ? total : BigDecimal.ZERO);
        report.put("paymentCount", payments.size());

        return ResponseEntity.ok(report);
    }

    @GetMapping("/reports/monthly")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getMonthlyReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<FeePayment> payments = feePaymentRepository.findByPaymentDateBetween(startDate, endDate);
        BigDecimal total = feePaymentRepository.getTotalCollectionBetweenDates(startDate, endDate);

        Map<String, Object> report = new HashMap<>();
        report.put("startDate", startDate);
        report.put("endDate", endDate);
        report.put("payments", payments);
        report.put("totalCollection", total != null ? total : BigDecimal.ZERO);
        report.put("paymentCount", payments.size());

        return ResponseEntity.ok(report);
    }
}
