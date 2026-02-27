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

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private SchoolClassRepository schoolClassRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private LeaveApplicationRepository leaveApplicationRepository;

    @PostMapping("/mark")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Attendance>> markAttendance(@RequestBody List<Attendance> attendanceList) {
        List<Attendance> saved = attendanceRepository.saveAll(attendanceList);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/date/{date}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Attendance>> getAttendanceByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceRepository.findByDate(date));
    }

    @GetMapping("/class/{classId}/section/{sectionId}/date/{date}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Attendance>> getAttendanceByClassSectionDate(
            @PathVariable Long classId,
            @PathVariable Long sectionId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        SchoolClass schoolClass = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", classId));
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Section", "id", sectionId));

        return ResponseEntity.ok(attendanceRepository.findBySchoolClassAndSectionAndDate(schoolClass, section, date));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    public ResponseEntity<List<Attendance>> getStudentAttendance(@PathVariable Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(1);
        return ResponseEntity.ok(attendanceRepository.findByStudentAndDateBetween(student, startDate, endDate));
    }

    @GetMapping("/statistics/today")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Map<String, Long>> getTodayStatistics() {
        LocalDate today = LocalDate.now();
        Long present = attendanceRepository.countPresentToday(today);
        Long total = attendanceRepository.countTotalToday(today);
        return ResponseEntity.ok(Map.of("present", present, "total", total, "absent", total - present));
    }

    // Leave Applications
    @GetMapping("/leaves")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<LeaveApplication>> getAllLeaves() {
        return ResponseEntity.ok(leaveApplicationRepository.findAll());
    }

    @GetMapping("/leaves/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    public ResponseEntity<List<LeaveApplication>> getStudentLeaves(@PathVariable Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));
        return ResponseEntity.ok(leaveApplicationRepository.findByStudent(student));
    }

    @PostMapping("/leaves")
    @PreAuthorize("hasAnyRole('ADMIN', 'PARENT')")
    public ResponseEntity<LeaveApplication> applyLeave(@RequestBody LeaveApplication leaveApplication) {
        leaveApplication.setStatus("PENDING");
        leaveApplication.setAppliedDate(LocalDate.now());
        return ResponseEntity.ok(leaveApplicationRepository.save(leaveApplication));
    }

    @PutMapping("/leaves/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<LeaveApplication> approveLeave(@PathVariable Long id) {
        LeaveApplication leave = leaveApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave Application", "id", id));
        leave.setStatus("APPROVED");
        leave.setApprovalDate(LocalDate.now());
        return ResponseEntity.ok(leaveApplicationRepository.save(leave));
    }

    @PutMapping("/leaves/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<LeaveApplication> rejectLeave(@PathVariable Long id, @RequestBody Map<String, String> body) {
        LeaveApplication leave = leaveApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave Application", "id", id));
        leave.setStatus("REJECTED");
        leave.setRejectionReason(body.get("reason"));
        leave.setApprovalDate(LocalDate.now());
        return ResponseEntity.ok(leaveApplicationRepository.save(leave));
    }
}
