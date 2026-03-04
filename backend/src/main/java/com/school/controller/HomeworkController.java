package com.school.controller;

import com.school.dto.MessageResponse;
import com.school.entity.*;
import com.school.exception.ResourceNotFoundException;
import com.school.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

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

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getAllHomework() {
        List<Homework> homeworks = homeworkRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Homework hw : homeworks) result.add(buildHomeworkMap(hw));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/class/{classId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getHomeworkByClass(@PathVariable Long classId) {
        SchoolClass schoolClass = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", classId));
        List<Homework> homeworks = homeworkRepository.findBySchoolClass(schoolClass);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Homework hw : homeworks) result.add(buildHomeworkMap(hw));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/class/{classId}/section/{sectionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getHomeworkByClassAndSection(
            @PathVariable Long classId, @PathVariable Long sectionId) {
        SchoolClass schoolClass = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", classId));
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Section", "id", sectionId));
        List<Homework> homeworks = homeworkRepository.findBySchoolClassAndSection(schoolClass, section);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Homework hw : homeworks) result.add(buildHomeworkMap(hw));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/upcoming")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getUpcomingHomework() {
        List<Homework> homeworks = homeworkRepository.findByDueDateAfter(LocalDate.now());
        List<Map<String, Object>> result = new ArrayList<>();
        for (Homework hw : homeworks) result.add(buildHomeworkMap(hw));
        return ResponseEntity.ok(result);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Transactional
    public ResponseEntity<?> createHomework(@RequestBody Map<String, Object> req) {
        try {
            Homework homework = new Homework();
            homework.setTitle(req.get("title") != null ? req.get("title").toString() : null);
            homework.setDescription(req.get("description") != null ? req.get("description").toString() : null);
            homework.setPriority(req.get("priority") != null ? req.get("priority").toString() : "MEDIUM");

            if (req.get("dueDate") != null && !req.get("dueDate").toString().isEmpty()) {
                homework.setDueDate(LocalDate.parse(req.get("dueDate").toString()));
            }

            // Set SchoolClass (required)
            if (req.get("schoolClass") != null) {
                Object classObj = req.get("schoolClass");
                Long classId = extractId(classObj);
                if (classId != null) {
                    SchoolClass sc = schoolClassRepository.findById(classId)
                            .orElseThrow(() -> new ResourceNotFoundException("Class", "id", classId));
                    homework.setSchoolClass(sc);
                }
            }

            // Set Section (optional)
            if (req.get("section") != null) {
                Object secObj = req.get("section");
                Long secId = extractId(secObj);
                if (secId != null) {
                    sectionRepository.findById(secId).ifPresent(homework::setSection);
                }
            }

            // Set Subject (optional)
            if (req.get("subject") != null) {
                Object subObj = req.get("subject");
                Long subId = extractId(subObj);
                if (subId != null) {
                    subjectRepository.findById(subId).ifPresent(homework::setSubject);
                }
            }

            // Set Teacher (optional)
            if (req.get("teacher") != null) {
                Object tObj = req.get("teacher");
                Long tId = extractId(tObj);
                if (tId != null) {
                    teacherRepository.findById(tId).ifPresent(homework::setTeacher);
                }
            }

            Homework saved = homeworkRepository.save(homework);
            return ResponseEntity.ok(buildHomeworkMap(saved));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error creating homework: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Transactional
    public ResponseEntity<?> updateHomework(@PathVariable Long id, @RequestBody Map<String, Object> req) {
        try {
            Homework existing = homeworkRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Homework", "id", id));

            if (req.get("title") != null) existing.setTitle(req.get("title").toString());
            if (req.get("description") != null) existing.setDescription(req.get("description").toString());
            if (req.get("priority") != null) existing.setPriority(req.get("priority").toString());
            if (req.get("dueDate") != null && !req.get("dueDate").toString().isEmpty()) {
                existing.setDueDate(LocalDate.parse(req.get("dueDate").toString()));
            }

            return ResponseEntity.ok(buildHomeworkMap(homeworkRepository.save(existing)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<MessageResponse> deleteHomework(@PathVariable Long id) {
        Homework homework = homeworkRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Homework", "id", id));
        homeworkRepository.delete(homework);
        return ResponseEntity.ok(new MessageResponse("Homework deleted successfully"));
    }

    /** Extract ID from nested object like { "id": 5 } */
    @SuppressWarnings("unchecked")
    private Long extractId(Object obj) {
        if (obj == null) return null;
        if (obj instanceof Map) {
            Object idVal = ((Map<String, Object>) obj).get("id");
            if (idVal == null) return null;
            try { return Long.valueOf(idVal.toString()); } catch (NumberFormatException e) { return null; }
        }
        try { return Long.valueOf(obj.toString()); } catch (NumberFormatException e) { return null; }
    }

    /** Build a serialization-safe DTO map for a Homework entity */
    private Map<String, Object> buildHomeworkMap(Homework hw) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", hw.getId());
        m.put("title", hw.getTitle());
        m.put("description", hw.getDescription());
        m.put("dueDate", hw.getDueDate() != null ? hw.getDueDate().toString() : null);
        m.put("priority", hw.getPriority());
        m.put("attachments", hw.getAttachments());

        // Teacher (safe)
        Teacher t = hw.getTeacher();
        if (t != null) {
            Map<String, Object> tm = new LinkedHashMap<>();
            tm.put("id", t.getId());
            tm.put("firstName", t.getFirstName());
            tm.put("lastName", t.getLastName());
            tm.put("designation", t.getDesignation());
            m.put("teacher", tm);
        } else {
            m.put("teacher", null);
        }

        // Subject
        Subject s = hw.getSubject();
        if (s != null) {
            Map<String, Object> sm = new LinkedHashMap<>();
            sm.put("id", s.getId());
            sm.put("name", s.getName());
            sm.put("code", s.getCode());
            m.put("subject", sm);
        } else {
            m.put("subject", null);
        }

        // Class
        SchoolClass sc = hw.getSchoolClass();
        if (sc != null) {
            Map<String, Object> scm = new LinkedHashMap<>();
            scm.put("id", sc.getId());
            scm.put("name", sc.getName());
            m.put("schoolClass", scm);
        } else {
            m.put("schoolClass", null);
        }

        // Section
        Section sec = hw.getSection();
        if (sec != null) {
            Map<String, Object> secm = new LinkedHashMap<>();
            secm.put("id", sec.getId());
            secm.put("name", sec.getName());
            m.put("section", secm);
        } else {
            m.put("section", null);
        }

        return m;
    }
}
