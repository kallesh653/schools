package com.school.repository;

import com.school.entity.Marks;
import com.school.entity.Student;
import com.school.entity.Examination;
import com.school.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarksRepository extends JpaRepository<Marks, Long> {
    List<Marks> findByStudent(Student student);
    List<Marks> findByExamination(Examination examination);
    List<Marks> findByStudentAndExamination(Student student, Examination examination);
    Optional<Marks> findByStudentAndExaminationAndSubject(Student student, Examination examination, Subject subject);
}
