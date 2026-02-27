package com.school.repository;

import com.school.entity.ExamSchedule;
import com.school.entity.Examination;
import com.school.entity.SchoolClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamScheduleRepository extends JpaRepository<ExamSchedule, Long> {
    List<ExamSchedule> findByExamination(Examination examination);
    List<ExamSchedule> findByExaminationAndSchoolClass(Examination examination, SchoolClass schoolClass);
}
