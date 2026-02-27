package com.school.repository;

import com.school.entity.Homework;
import com.school.entity.Teacher;
import com.school.entity.SchoolClass;
import com.school.entity.Section;
import com.school.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface HomeworkRepository extends JpaRepository<Homework, Long> {
    List<Homework> findByTeacher(Teacher teacher);
    List<Homework> findBySchoolClassAndSection(SchoolClass schoolClass, Section section);
    List<Homework> findBySchoolClass(SchoolClass schoolClass);
    List<Homework> findBySubject(Subject subject);
    List<Homework> findByDueDateAfter(LocalDate date);
}
