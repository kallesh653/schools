package com.school.repository;

import com.school.entity.Timetable;
import com.school.entity.SchoolClass;
import com.school.entity.Section;
import com.school.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<Timetable, Long> {
    List<Timetable> findBySchoolClassAndSection(SchoolClass schoolClass, Section section);
    List<Timetable> findByTeacher(Teacher teacher);
    List<Timetable> findBySchoolClassAndSectionAndDay(SchoolClass schoolClass, Section section, String day);
}
