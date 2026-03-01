package com.school.controller;

import com.school.dto.CreateTeacherRequest;
import com.school.dto.MessageResponse;
import com.school.entity.*;
import com.school.exception.ResourceNotFoundException;
import com.school.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/teachers")
@CrossOrigin(origins = "*")
public class TeacherController {

    @Autowired private TeacherRepository teacherRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private TeacherSubjectAssignmentRepository assignmentRepository;
    @Autowired private SchoolClassRepository classRepository;
    @Autowired private com.school.repository.SubjectRepository subjectRepository;
    @Autowired private com.school.repository.SectionRepository sectionRepository;
    @Autowired private com.school.repository.AcademicYearRepository academicYearRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Teacher>> getAllTeachers() {
        return ResponseEntity.ok(teacherRepository.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Teacher> getTeacherById(@PathVariable Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", id));
        return ResponseEntity.ok(teacher);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> createTeacher(@RequestBody CreateTeacherRequest request) {
        try {
            // 1. Create Teacher entity
            Teacher teacher = new Teacher();
            teacher.setFirstName(request.getFirstName());
            teacher.setLastName(request.getLastName());
            if (request.getDateOfBirth() != null && !request.getDateOfBirth().isEmpty())
                teacher.setDateOfBirth(LocalDate.parse(request.getDateOfBirth()));
            teacher.setGender(request.getGender());
            teacher.setPhone(request.getPhone());
            teacher.setEmail(request.getEmail());
            teacher.setQualification(request.getQualification());
            teacher.setExperience(request.getExperience());
            teacher.setDesignation(request.getDesignation());
            teacher.setSpecialization(request.getSpecialization());
            teacher.setAddress(request.getAddress());
            if (request.getJoiningDate() != null && !request.getJoiningDate().isEmpty())
                teacher.setJoiningDate(LocalDate.parse(request.getJoiningDate()));
            teacher.setEmployeeId(generateEmployeeId());
            teacher.setActive(true);
            Teacher savedTeacher = teacherRepository.save(teacher);

            // 2. Create Teacher User login account
            if (request.getLoginUsername() != null && !request.getLoginUsername().trim().isEmpty()
                    && request.getLoginPassword() != null && !request.getLoginPassword().trim().isEmpty()) {
                boolean exists = userRepository.findByUsername(request.getLoginUsername().trim()).isPresent();
                if (!exists) {
                    Role teacherRole = roleRepository.findByName(Role.TEACHER)
                            .orElseThrow(() -> new RuntimeException("TEACHER role not found"));
                    User teacherUser = new User();
                    teacherUser.setUsername(request.getLoginUsername().trim());
                    teacherUser.setPassword(passwordEncoder.encode(request.getLoginPassword()));
                    teacherUser.setEmail(request.getEmail());
                    teacherUser.setFullName(request.getFirstName() + " " + request.getLastName());
                    teacherUser.setContact(request.getPhone());
                    teacherUser.setRole(teacherRole);
                    teacherUser.setActive(true);
                    teacherUser.setEntityId(savedTeacher.getId());
                    teacherUser.setEntityType("TEACHER");
                    userRepository.save(teacherUser);
                }
            }
            return ResponseEntity.ok(savedTeacher);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Teacher> updateTeacher(@PathVariable Long id, @RequestBody Teacher teacher) {
        Teacher existing = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", id));
        existing.setFirstName(teacher.getFirstName());
        existing.setLastName(teacher.getLastName());
        existing.setDateOfBirth(teacher.getDateOfBirth());
        existing.setGender(teacher.getGender());
        existing.setPhone(teacher.getPhone());
        existing.setEmail(teacher.getEmail());
        existing.setQualification(teacher.getQualification());
        existing.setExperience(teacher.getExperience());
        existing.setDesignation(teacher.getDesignation());
        existing.setSpecialization(teacher.getSpecialization());
        existing.setAddress(teacher.getAddress());
        return ResponseEntity.ok(teacherRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteTeacher(@PathVariable Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", id));
        teacherRepository.delete(teacher);
        return ResponseEntity.ok(new MessageResponse("Teacher deleted successfully"));
    }

    /**
     * Parent-accessible endpoint: get all teachers for a class with their subjects.
     * Returns list of {teacher, subjects[]} objects grouped by teacher.
     */
    @GetMapping("/class/{classId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    public ResponseEntity<?> getTeachersByClass(@PathVariable Long classId) {
        SchoolClass schoolClass = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", classId));
        List<TeacherSubjectAssignment> assignments = assignmentRepository.findBySchoolClass(schoolClass);

        // Group by teacher and collect subjects
        Map<Long, Map<String, Object>> teacherMap = new LinkedHashMap<>();
        for (TeacherSubjectAssignment a : assignments) {
            Teacher t = a.getTeacher();
            if (t == null || !Boolean.TRUE.equals(t.getActive())) continue;
            teacherMap.computeIfAbsent(t.getId(), id -> {
                Map<String, Object> info = new LinkedHashMap<>();
                info.put("id", t.getId());
                info.put("employeeId", t.getEmployeeId());
                info.put("firstName", t.getFirstName());
                info.put("lastName", t.getLastName());
                info.put("email", t.getEmail());
                info.put("phone", t.getPhone());
                info.put("designation", t.getDesignation());
                info.put("qualification", t.getQualification());
                info.put("specialization", t.getSpecialization());
                info.put("subjects", new ArrayList<>());
                return info;
            });
            if (a.getSubject() != null) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> subjects = (List<Map<String, Object>>) teacherMap.get(t.getId()).get("subjects");
                Map<String, Object> subj = new LinkedHashMap<>();
                subj.put("id", a.getSubject().getId());
                subj.put("name", a.getSubject().getName());
                subj.put("code", a.getSubject().getCode());
                subj.put("subjectType", a.getSubject().getSubjectType());
                subjects.add(subj);
            }
        }
        return ResponseEntity.ok(new ArrayList<>(teacherMap.values()));
    }

    /**
     * Admin: get all teacher-subject-class assignments — returns safe DTOs (no lazy entities)
     */
    @GetMapping("/assignments")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getAllAssignments() {
        List<TeacherSubjectAssignment> all = assignmentRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (TeacherSubjectAssignment a : all) {
            result.add(buildAssignmentMap(a));
        }
        return ResponseEntity.ok(result);
    }

    /**
     * Admin: create a new teacher-subject-class assignment
     */
    @PostMapping("/assignments")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> createAssignment(@RequestBody Map<String, Object> req) {
        try {
            Long teacherId = Long.valueOf(req.get("teacherId").toString());
            Long subjectId = Long.valueOf(req.get("subjectId").toString());
            Long classId = Long.valueOf(req.get("classId").toString());
            Long yearId = Long.valueOf(req.get("academicYearId").toString());

            Teacher teacher = teacherRepository.findById(teacherId)
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", teacherId));
            com.school.entity.Subject subject = subjectRepository.findById(subjectId)
                    .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", subjectId));
            SchoolClass schoolClass = classRepository.findById(classId)
                    .orElseThrow(() -> new ResourceNotFoundException("Class", "id", classId));
            com.school.entity.AcademicYear academicYear = academicYearRepository.findById(yearId)
                    .orElseThrow(() -> new ResourceNotFoundException("AcademicYear", "id", yearId));

            if (assignmentRepository.existsByTeacherAndSubjectAndSchoolClass(teacher, subject, schoolClass)) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("This teacher is already assigned to this subject in this class"));
            }

            TeacherSubjectAssignment assignment = new TeacherSubjectAssignment();
            assignment.setTeacher(teacher);
            assignment.setSubject(subject);
            assignment.setSchoolClass(schoolClass);
            assignment.setAcademicYear(academicYear);

            if (req.get("sectionId") != null && !req.get("sectionId").toString().isEmpty()) {
                Long sectionId = Long.valueOf(req.get("sectionId").toString());
                com.school.entity.Section section = sectionRepository.findById(sectionId).orElse(null);
                assignment.setSection(section);
            }

            TeacherSubjectAssignment saved = assignmentRepository.save(assignment);
            return ResponseEntity.ok(buildAssignmentMap(saved));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error creating assignment: " + e.getMessage()));
        }
    }

    /** Build a clean, serializable map from a TeacherSubjectAssignment (avoids lazy/circular issues) */
    private Map<String, Object> buildAssignmentMap(TeacherSubjectAssignment a) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", a.getId());

        // Teacher (safe subset — no User/password)
        Teacher t = a.getTeacher();
        if (t != null) {
            Map<String, Object> tm = new LinkedHashMap<>();
            tm.put("id", t.getId());
            tm.put("employeeId", t.getEmployeeId());
            tm.put("firstName", t.getFirstName());
            tm.put("lastName", t.getLastName());
            tm.put("designation", t.getDesignation());
            tm.put("specialization", t.getSpecialization());
            tm.put("email", t.getEmail());
            tm.put("phone", t.getPhone());
            m.put("teacher", tm);
        }

        // Subject
        com.school.entity.Subject s = a.getSubject();
        if (s != null) {
            Map<String, Object> sm = new LinkedHashMap<>();
            sm.put("id", s.getId());
            sm.put("name", s.getName());
            sm.put("code", s.getCode());
            sm.put("subjectType", s.getSubjectType());
            m.put("subject", sm);
        }

        // Class
        SchoolClass sc = a.getSchoolClass();
        if (sc != null) {
            Map<String, Object> cm = new LinkedHashMap<>();
            cm.put("id", sc.getId());
            cm.put("name", sc.getName());
            cm.put("code", sc.getCode());
            m.put("schoolClass", cm);
        }

        // Section (optional)
        com.school.entity.Section sec = a.getSection();
        if (sec != null) {
            Map<String, Object> secm = new LinkedHashMap<>();
            secm.put("id", sec.getId());
            secm.put("name", sec.getName());
            m.put("section", secm);
        } else {
            m.put("section", null);
        }

        // Academic Year
        com.school.entity.AcademicYear ay = a.getAcademicYear();
        if (ay != null) {
            Map<String, Object> aym = new LinkedHashMap<>();
            aym.put("id", ay.getId());
            aym.put("name", ay.getName());
            aym.put("isActive", ay.getIsActive());
            m.put("academicYear", aym);
        }

        return m;
    }

    /**
     * Admin: delete a teacher-subject-class assignment
     */
    @DeleteMapping("/assignments/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteAssignment(@PathVariable Long id) {
        assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment", "id", id));
        assignmentRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Assignment removed successfully"));
    }

    private String generateEmployeeId() {
        return "EMP" + System.currentTimeMillis() + new Random().nextInt(1000);
    }
}
