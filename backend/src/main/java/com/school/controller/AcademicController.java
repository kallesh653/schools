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
@RequestMapping("/academic")
@CrossOrigin(origins = "*")
public class AcademicController {

    @Autowired
    private AcademicYearRepository academicYearRepository;

    @Autowired
    private SchoolClassRepository schoolClassRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    // Academic Year Endpoints
    @GetMapping("/years")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<AcademicYear>> getAllAcademicYears() {
        return ResponseEntity.ok(academicYearRepository.findAll());
    }

    @GetMapping("/years/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<AcademicYear> getAcademicYearById(@PathVariable Long id) {
        AcademicYear year = academicYearRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Academic Year", "id", id));
        return ResponseEntity.ok(year);
    }

    @PostMapping("/years")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AcademicYear> createAcademicYear(@RequestBody AcademicYear academicYear) {
        if (academicYear.getIsActive()) {
            academicYearRepository.findByIsActiveTrue().ifPresent(year -> {
                year.setIsActive(false);
                academicYearRepository.save(year);
            });
        }
        return ResponseEntity.ok(academicYearRepository.save(academicYear));
    }

    @PutMapping("/years/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AcademicYear> updateAcademicYear(@PathVariable Long id, @RequestBody AcademicYear academicYear) {
        AcademicYear existing = academicYearRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Academic Year", "id", id));

        existing.setName(academicYear.getName());
        existing.setStartDate(academicYear.getStartDate());
        existing.setEndDate(academicYear.getEndDate());
        existing.setDescription(academicYear.getDescription());

        if (academicYear.getIsActive() && !existing.getIsActive()) {
            academicYearRepository.findByIsActiveTrue().ifPresent(year -> {
                year.setIsActive(false);
                academicYearRepository.save(year);
            });
        }
        existing.setIsActive(academicYear.getIsActive());

        return ResponseEntity.ok(academicYearRepository.save(existing));
    }

    @DeleteMapping("/years/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteAcademicYear(@PathVariable Long id) {
        AcademicYear year = academicYearRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Academic Year", "id", id));
        academicYearRepository.delete(year);
        return ResponseEntity.ok(new MessageResponse("Academic year deleted successfully"));
    }

    // Class Endpoints
    @GetMapping("/classes")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<SchoolClass>> getAllClasses() {
        return ResponseEntity.ok(schoolClassRepository.findAll());
    }

    @GetMapping("/classes/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<SchoolClass> getClassById(@PathVariable Long id) {
        SchoolClass schoolClass = schoolClassRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", id));
        return ResponseEntity.ok(schoolClass);
    }

    @PostMapping("/classes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SchoolClass> createClass(@RequestBody SchoolClass schoolClass) {
        return ResponseEntity.ok(schoolClassRepository.save(schoolClass));
    }

    @PutMapping("/classes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SchoolClass> updateClass(@PathVariable Long id, @RequestBody SchoolClass schoolClass) {
        SchoolClass existing = schoolClassRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", id));

        existing.setName(schoolClass.getName());
        existing.setCode(schoolClass.getCode());
        existing.setCapacity(schoolClass.getCapacity());
        existing.setDescription(schoolClass.getDescription());

        return ResponseEntity.ok(schoolClassRepository.save(existing));
    }

    @DeleteMapping("/classes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteClass(@PathVariable Long id) {
        SchoolClass schoolClass = schoolClassRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", id));
        schoolClassRepository.delete(schoolClass);
        return ResponseEntity.ok(new MessageResponse("Class deleted successfully"));
    }

    // Section Endpoints
    @GetMapping("/sections")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Section>> getAllSections() {
        return ResponseEntity.ok(sectionRepository.findAll());
    }

    @GetMapping("/sections/class/{classId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Section>> getSectionsByClass(@PathVariable Long classId) {
        return ResponseEntity.ok(sectionRepository.findBySchoolClassId(classId));
    }

    @PostMapping("/sections")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Section> createSection(@RequestBody Section section) {
        return ResponseEntity.ok(sectionRepository.save(section));
    }

    @PutMapping("/sections/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Section> updateSection(@PathVariable Long id, @RequestBody Section section) {
        Section existing = sectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Section", "id", id));

        existing.setName(section.getName());
        existing.setCapacity(section.getCapacity());
        existing.setDescription(section.getDescription());
        if (section.getSchoolClass() != null) {
            existing.setSchoolClass(section.getSchoolClass());
        }

        return ResponseEntity.ok(sectionRepository.save(existing));
    }

    @DeleteMapping("/sections/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteSection(@PathVariable Long id) {
        Section section = sectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Section", "id", id));
        sectionRepository.delete(section);
        return ResponseEntity.ok(new MessageResponse("Section deleted successfully"));
    }

    // Subject Endpoints
    @GetMapping("/subjects")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Subject>> getAllSubjects() {
        return ResponseEntity.ok(subjectRepository.findAll());
    }

    @GetMapping("/subjects/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Subject> getSubjectById(@PathVariable Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", id));
        return ResponseEntity.ok(subject);
    }

    @PostMapping("/subjects")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Subject> createSubject(@RequestBody Subject subject) {
        return ResponseEntity.ok(subjectRepository.save(subject));
    }

    @PutMapping("/subjects/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Subject> updateSubject(@PathVariable Long id, @RequestBody Subject subject) {
        Subject existing = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", id));

        existing.setName(subject.getName());
        existing.setCode(subject.getCode());
        existing.setSubjectType(subject.getSubjectType());
        existing.setMaxMarks(subject.getMaxMarks());
        existing.setPassMarks(subject.getPassMarks());
        existing.setDescription(subject.getDescription());

        return ResponseEntity.ok(subjectRepository.save(existing));
    }

    @DeleteMapping("/subjects/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteSubject(@PathVariable Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", id));
        subjectRepository.delete(subject);
        return ResponseEntity.ok(new MessageResponse("Subject deleted successfully"));
    }
}
