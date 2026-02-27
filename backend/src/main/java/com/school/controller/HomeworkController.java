package com.school.controller;

import com.school.dto.MessageResponse;
import com.school.entity.*;
import com.school.exception.ResourceNotFoundException;
import com.school.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/homework")
@CrossOrigin(origins = "*")
public class HomeworkController {

    @Autowired
    private HomeworkRepository homeworkRepository;

    @Autowired
    private SchoolClassRepository schoolClassRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    public ResponseEntity<List<Homework>> getAllHomework() {
        return ResponseEntity.ok(homeworkRepository.findAll());
    }

    @GetMapping("/class/{classId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    public ResponseEntity<List<Homework>> getHomeworkByClass(@PathVariable Long classId) {
        SchoolClass schoolClass = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", classId));
        return ResponseEntity.ok(homeworkRepository.findBySchoolClass(schoolClass));
    }

    @GetMapping("/class/{classId}/section/{sectionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    public ResponseEntity<List<Homework>> getHomeworkByClassAndSection(
            @PathVariable Long classId, @PathVariable Long sectionId) {
        SchoolClass schoolClass = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", classId));
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Section", "id", sectionId));
        return ResponseEntity.ok(homeworkRepository.findBySchoolClassAndSection(schoolClass, section));
    }

    @GetMapping("/upcoming")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    public ResponseEntity<List<Homework>> getUpcomingHomework() {
        return ResponseEntity.ok(homeworkRepository.findByDueDateAfter(LocalDate.now()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Homework> createHomework(@RequestBody Homework homework) {
        return ResponseEntity.ok(homeworkRepository.save(homework));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Homework> updateHomework(@PathVariable Long id, @RequestBody Homework homework) {
        Homework existing = homeworkRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Homework", "id", id));

        existing.setTitle(homework.getTitle());
        existing.setDescription(homework.getDescription());
        existing.setDueDate(homework.getDueDate());
        existing.setPriority(homework.getPriority());
        if (homework.getSubject() != null) existing.setSubject(homework.getSubject());
        if (homework.getSchoolClass() != null) existing.setSchoolClass(homework.getSchoolClass());
        if (homework.getSection() != null) existing.setSection(homework.getSection());
        if (homework.getAttachments() != null) existing.setAttachments(homework.getAttachments());

        return ResponseEntity.ok(homeworkRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<MessageResponse> deleteHomework(@PathVariable Long id) {
        Homework homework = homeworkRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Homework", "id", id));
        homeworkRepository.delete(homework);
        return ResponseEntity.ok(new MessageResponse("Homework deleted successfully"));
    }
}
