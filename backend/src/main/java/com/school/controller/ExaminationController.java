package com.school.controller;

import com.school.dto.MessageResponse;
import com.school.entity.*;
import com.school.exception.ResourceNotFoundException;
import com.school.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/examinations")
@CrossOrigin(origins = "*")
public class ExaminationController {

    @Autowired
    private ExaminationRepository examinationRepository;

    @Autowired
    private ExamScheduleRepository examScheduleRepository;

    @Autowired
    private MarksRepository marksRepository;

    @Autowired
    private StudentRepository studentRepository;

    // Examination Endpoints
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    public ResponseEntity<List<Examination>> getAllExaminations() {
        return ResponseEntity.ok(examinationRepository.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    public ResponseEntity<Examination> getExaminationById(@PathVariable Long id) {
        Examination exam = examinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Examination", "id", id));
        return ResponseEntity.ok(exam);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Examination> createExamination(@RequestBody Examination examination) {
        return ResponseEntity.ok(examinationRepository.save(examination));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Examination> updateExamination(@PathVariable Long id, @RequestBody Examination examination) {
        Examination existing = examinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Examination", "id", id));

        existing.setName(examination.getName());
        existing.setExamType(examination.getExamType());
        existing.setStartDate(examination.getStartDate());
        existing.setEndDate(examination.getEndDate());
        existing.setDescription(examination.getDescription());
        existing.setPublished(examination.getPublished());

        return ResponseEntity.ok(examinationRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteExamination(@PathVariable Long id) {
        Examination exam = examinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Examination", "id", id));
        examinationRepository.delete(exam);
        return ResponseEntity.ok(new MessageResponse("Examination deleted successfully"));
    }

    // Exam Schedule Endpoints
    @GetMapping("/schedules")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<ExamSchedule>> getAllSchedules() {
        return ResponseEntity.ok(examScheduleRepository.findAll());
    }

    @GetMapping("/{examId}/schedules")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    public ResponseEntity<List<ExamSchedule>> getExamSchedules(@PathVariable Long examId) {
        Examination exam = examinationRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Examination", "id", examId));
        return ResponseEntity.ok(examScheduleRepository.findByExamination(exam));
    }

    @PostMapping("/schedules")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExamSchedule> createExamSchedule(@RequestBody ExamSchedule schedule) {
        return ResponseEntity.ok(examScheduleRepository.save(schedule));
    }

    @PutMapping("/schedules/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExamSchedule> updateExamSchedule(@PathVariable Long id, @RequestBody ExamSchedule schedule) {
        ExamSchedule existing = examScheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ExamSchedule", "id", id));

        existing.setExamination(schedule.getExamination());
        existing.setSubject(schedule.getSubject());
        existing.setSchoolClass(schedule.getSchoolClass());
        existing.setExamDate(schedule.getExamDate());
        existing.setStartTime(schedule.getStartTime());
        existing.setEndTime(schedule.getEndTime());
        existing.setRoomNumber(schedule.getRoomNumber());
        existing.setMaxMarks(schedule.getMaxMarks());
        existing.setPassMarks(schedule.getPassMarks());

        return ResponseEntity.ok(examScheduleRepository.save(existing));
    }

    @DeleteMapping("/schedules/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteExamSchedule(@PathVariable Long id) {
        ExamSchedule schedule = examScheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ExamSchedule", "id", id));
        examScheduleRepository.delete(schedule);
        return ResponseEntity.ok(new MessageResponse("Exam schedule deleted successfully"));
    }

    // Marks Endpoints
    @GetMapping("/{examId}/marks")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Marks>> getExamMarks(@PathVariable Long examId) {
        Examination exam = examinationRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Examination", "id", examId));
        return ResponseEntity.ok(marksRepository.findByExamination(exam));
    }

    @GetMapping("/{examId}/student/{studentId}/marks")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    public ResponseEntity<List<Marks>> getStudentExamMarks(@PathVariable Long examId, @PathVariable Long studentId) {
        Examination exam = examinationRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Examination", "id", examId));
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));
        return ResponseEntity.ok(marksRepository.findByStudentAndExamination(student, exam));
    }

    @PostMapping("/marks")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Marks> createOrUpdateMarks(@RequestBody Marks marks) {
        if (marks.getTheoryMarks() != null && marks.getPracticalMarks() != null) {
            marks.setTotalMarks(marks.getTheoryMarks() + marks.getPracticalMarks());
        } else if (marks.getTheoryMarks() != null) {
            marks.setTotalMarks(marks.getTheoryMarks());
        }
        return ResponseEntity.ok(marksRepository.save(marks));
    }

    @PostMapping("/marks/bulk")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Marks>> createBulkMarks(@RequestBody List<Marks> marksList) {
        marksList.forEach(marks -> {
            if (marks.getTheoryMarks() != null && marks.getPracticalMarks() != null) {
                marks.setTotalMarks(marks.getTheoryMarks() + marks.getPracticalMarks());
            } else if (marks.getTheoryMarks() != null) {
                marks.setTotalMarks(marks.getTheoryMarks());
            }
        });
        return ResponseEntity.ok(marksRepository.saveAll(marksList));
    }

    @PutMapping("/marks/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Marks> updateMarks(@PathVariable Long id, @RequestBody Marks marks) {
        Marks existing = marksRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Marks", "id", id));

        existing.setTheoryMarks(marks.getTheoryMarks());
        existing.setPracticalMarks(marks.getPracticalMarks());
        existing.setGrade(marks.getGrade());
        existing.setRemarks(marks.getRemarks());
        existing.setIsAbsent(marks.getIsAbsent());

        if (marks.getTheoryMarks() != null && marks.getPracticalMarks() != null) {
            existing.setTotalMarks(marks.getTheoryMarks() + marks.getPracticalMarks());
        } else if (marks.getTheoryMarks() != null) {
            existing.setTotalMarks(marks.getTheoryMarks());
        }

        return ResponseEntity.ok(marksRepository.save(existing));
    }

    @DeleteMapping("/marks/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteMarks(@PathVariable Long id) {
        Marks marks = marksRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Marks", "id", id));
        marksRepository.delete(marks);
        return ResponseEntity.ok(new MessageResponse("Marks deleted successfully"));
    }
}
