package com.school.repository;

import com.school.entity.Examination;
import com.school.entity.AcademicYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExaminationRepository extends JpaRepository<Examination, Long> {
    List<Examination> findByAcademicYear(AcademicYear academicYear);
    List<Examination> findByPublishedTrue();
}
