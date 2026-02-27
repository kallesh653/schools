package com.school.repository;

import com.school.entity.Section;
import com.school.entity.SchoolClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {
    List<Section> findBySchoolClass(SchoolClass schoolClass);
    List<Section> findBySchoolClassId(Long classId);
}
