package com.school.repository;

import com.school.entity.Student;
import com.school.entity.SchoolClass;
import com.school.entity.Section;
import com.school.entity.TransportRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByAdmissionNo(String admissionNo);
    List<Student> findBySchoolClassAndSection(SchoolClass schoolClass, Section section);
    List<Student> findBySchoolClass(SchoolClass schoolClass);
    List<Student> findByActiveTrue();
    List<Student> findByParentId(Long parentId);
    List<Student> findByTransportRoute(TransportRoute transportRoute);

    @Query("SELECT s FROM Student s WHERE " +
           "LOWER(s.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.admissionNo) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Student> searchStudents(@Param("search") String search);
}
