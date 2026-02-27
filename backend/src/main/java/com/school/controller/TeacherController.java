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
import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/teachers")
@CrossOrigin(origins = "*")
public class TeacherController {

    @Autowired private TeacherRepository teacherRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private PasswordEncoder passwordEncoder;

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

    private String generateEmployeeId() {
        return "EMP" + System.currentTimeMillis() + new Random().nextInt(1000);
    }
}
