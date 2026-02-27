package com.school.repository;

import com.school.entity.LeaveApplication;
import com.school.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveApplicationRepository extends JpaRepository<LeaveApplication, Long> {
    List<LeaveApplication> findByStudent(Student student);
    List<LeaveApplication> findByStatus(String status);
    List<LeaveApplication> findByStudentAndStatus(Student student, String status);
}
