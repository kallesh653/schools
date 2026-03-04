package com.school.repository;

import com.school.entity.SchoolClass;
import com.school.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SchoolClassRepository extends JpaRepository<SchoolClass, Long> {
    Optional<SchoolClass> findByCode(String code);
    Optional<SchoolClass> findByName(String name);
    List<SchoolClass> findByClassTeacher(Teacher classTeacher);
}
