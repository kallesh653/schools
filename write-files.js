const fs = require('fs');
const path = require('path');

const base = 'C:\\Users\\LEN0VO\\Desktop\\schoolmk1.0\\backend\\src\\main\\java\\com\\school';

// ============ StudentController.java ============
const studentController = `package com.school.controller;

import com.school.dto.CreateStudentRequest;
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
@RequestMapping("/students")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired private StudentRepository studentRepository;
    @Autowired private ParentRepository parentRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentRepository.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
        return ResponseEntity.ok(student);
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Student>> searchStudents(@RequestParam String query) {
        return ResponseEntity.ok(studentRepository.searchStudents(query));
    }

    @GetMapping("/parent/{parentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    public ResponseEntity<List<Student>> getStudentsByParent(@PathVariable Long parentId) {
        return ResponseEntity.ok(studentRepository.findByParentId(parentId));
    }

    @GetMapping("/class/{classId}/section/{sectionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Student>> getStudentsByClassAndSection(
            @PathVariable Long classId, @PathVariable Long sectionId) {
        SchoolClass schoolClass = new SchoolClass();
        schoolClass.setId(classId);
        Section section = new Section();
        section.setId(sectionId);
        return ResponseEntity.ok(studentRepository.findBySchoolClassAndSection(schoolClass, section));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> createStudent(@RequestBody CreateStudentRequest request) {
        try {
            // 1. Create Parent entity
            Parent parent = new Parent();
            parent.setFatherName(request.getFatherName());
            parent.setFatherPhone(request.getFatherPhone());
            parent.setFatherEmail(request.getFatherEmail());
            parent.setFatherOccupation(request.getFatherOccupation());
            parent.setMotherName(request.getMotherName());
            parent.setMotherPhone(request.getMotherPhone());
            parent.setMotherEmail(request.getMotherEmail());
            parent.setMotherOccupation(request.getMotherOccupation());
            if (request.getAddress2() != null) parent.setAddress(request.getAddress2());
            if (request.getEmergencyContact() != null) parent.setEmergencyContact(request.getEmergencyContact());
            Parent savedParent = parentRepository.save(parent);

            // 2. Create Parent User login account
            if (request.getParentUsername() != null && !request.getParentUsername().trim().isEmpty()
                    && request.getParentPassword() != null && !request.getParentPassword().trim().isEmpty()) {
                boolean exists = userRepository.findByUsername(request.getParentUsername().trim()).isPresent();
                if (!exists) {
                    Role parentRole = roleRepository.findByName("PARENT")
                            .orElseThrow(() -> new RuntimeException("PARENT role not found"));
                    User parentUser = new User();
                    parentUser.setUsername(request.getParentUsername().trim());
                    parentUser.setPassword(passwordEncoder.encode(request.getParentPassword()));
                    parentUser.setEmail(request.getParentEmail() != null ? request.getParentEmail() : request.getFatherEmail());
                    parentUser.setFullName(request.getParentFullName() != null ? request.getParentFullName() : request.getFatherName());
                    parentUser.setContact(request.getParentPhone() != null ? request.getParentPhone() : request.getFatherPhone());
                    parentUser.setRole(parentRole);
                    parentUser.setActive(true);
                    parentUser.setEntityId(savedParent.getId());
                    parentUser.setEntityType("PARENT");
                    userRepository.save(parentUser);
                }
            }

            // 3. Create Student
            Student student = new Student();
            student.setFirstName(request.getFirstName());
            student.setLastName(request.getLastName());
            if (request.getDateOfBirth() != null && !request.getDateOfBirth().isEmpty())
                student.setDateOfBirth(LocalDate.parse(request.getDateOfBirth()));
            student.setGender(request.getGender());
            student.setBloodGroup(request.getBloodGroup());
            student.setAddress(request.getAddress());
            student.setPhone(request.getPhone());
            student.setEmail(request.getEmail());
            student.setRollNo(request.getRollNo());
            student.setAdmissionDate(request.getAdmissionDate() != null && !request.getAdmissionDate().isEmpty()
                    ? LocalDate.parse(request.getAdmissionDate()) : LocalDate.now());
            student.setAdmissionNo(generateAdmissionNumber());
            student.setActive(true);
            student.setParent(savedParent);
            if (request.getClassId() != null) { SchoolClass cls = new SchoolClass(); cls.setId(request.getClassId()); student.setSchoolClass(cls); }
            if (request.getSectionId() != null) { Section sec = new Section(); sec.setId(request.getSectionId()); student.setSection(sec); }
            AcademicYear year = new AcademicYear();
            year.setId(request.getAcademicYearId() != null ? request.getAcademicYearId() : 1L);
            student.setAcademicYear(year);
            return ResponseEntity.ok(studentRepository.save(student));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id, @RequestBody Student student) {
        Student existing = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
        existing.setFirstName(student.getFirstName());
        existing.setLastName(student.getLastName());
        existing.setDateOfBirth(student.getDateOfBirth());
        existing.setGender(student.getGender());
        existing.setBloodGroup(student.getBloodGroup());
        existing.setAddress(student.getAddress());
        existing.setPhone(student.getPhone());
        existing.setEmail(student.getEmail());
        existing.setRollNo(student.getRollNo());
        if (student.getSchoolClass() != null) existing.setSchoolClass(student.getSchoolClass());
        if (student.getSection() != null) existing.setSection(student.getSection());
        return ResponseEntity.ok(studentRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteStudent(@PathVariable Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
        studentRepository.delete(student);
        return ResponseEntity.ok(new MessageResponse("Student deleted successfully"));
    }

    @GetMapping("/{id}/parent")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    public ResponseEntity<Parent> getStudentParent(@PathVariable Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
        if (student.getParent() == null) throw new ResourceNotFoundException("Parent", "student_id", id);
        return ResponseEntity.ok(student.getParent());
    }

    @PostMapping("/{id}/parent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Parent> createOrUpdateParent(@PathVariable Long id, @RequestBody Parent parent) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
        Parent ep = student.getParent();
        if (ep == null) ep = new Parent();
        ep.setFatherName(parent.getFatherName()); ep.setFatherOccupation(parent.getFatherOccupation());
        ep.setFatherPhone(parent.getFatherPhone()); ep.setFatherEmail(parent.getFatherEmail());
        ep.setMotherName(parent.getMotherName()); ep.setMotherOccupation(parent.getMotherOccupation());
        ep.setMotherPhone(parent.getMotherPhone()); ep.setMotherEmail(parent.getMotherEmail());
        ep.setGuardianName(parent.getGuardianName()); ep.setGuardianPhone(parent.getGuardianPhone());
        ep.setGuardianEmail(parent.getGuardianEmail()); ep.setGuardianRelation(parent.getGuardianRelation());
        ep.setAddress(parent.getAddress()); ep.setEmergencyContact(parent.getEmergencyContact());
        Parent sp = parentRepository.save(ep);
        student.setParent(sp); studentRepository.save(student);
        return ResponseEntity.ok(sp);
    }

    private String generateAdmissionNumber() {
        return "STU" + System.currentTimeMillis() + new Random().nextInt(1000);
    }
}
`;

// ============ TeacherController.java ============
const teacherController = `package com.school.controller;

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
                    Role teacherRole = roleRepository.findByName("TEACHER")
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
`;

fs.writeFileSync(path.join(base, 'controller', 'StudentController.java'), studentController);
fs.writeFileSync(path.join(base, 'controller', 'TeacherController.java'), teacherController);
console.log('Backend controllers written successfully');
