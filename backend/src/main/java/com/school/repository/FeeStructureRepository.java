package com.school.repository;

import com.school.entity.FeeStructure;
import com.school.entity.SchoolClass;
import com.school.entity.AcademicYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeeStructureRepository extends JpaRepository<FeeStructure, Long> {
    Optional<FeeStructure> findBySchoolClassAndAcademicYear(SchoolClass schoolClass, AcademicYear academicYear);
    List<FeeStructure> findByAcademicYear(AcademicYear academicYear);
    List<FeeStructure> findBySchoolClass(SchoolClass schoolClass);
}
