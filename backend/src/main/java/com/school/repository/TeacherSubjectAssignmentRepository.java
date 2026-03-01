package com.school.repository;

import com.school.entity.TeacherSubjectAssignment;
import com.school.entity.Teacher;
import com.school.entity.SchoolClass;
import com.school.entity.Subject;
import com.school.entity.AcademicYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherSubjectAssignmentRepository extends JpaRepository<TeacherSubjectAssignment, Long> {
    List<TeacherSubjectAssignment> findByTeacher(Teacher teacher);
    List<TeacherSubjectAssignment> findBySchoolClass(SchoolClass schoolClass);
    List<TeacherSubjectAssignment> findByAcademicYear(AcademicYear academicYear);
    List<TeacherSubjectAssignment> findByTeacherAndAcademicYear(Teacher teacher, AcademicYear academicYear);
    boolean existsByTeacherAndSubjectAndSchoolClass(Teacher teacher, Subject subject, SchoolClass schoolClass);
}
