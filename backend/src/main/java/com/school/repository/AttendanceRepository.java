package com.school.repository;

import com.school.entity.Attendance;
import com.school.entity.Student;
import com.school.entity.SchoolClass;
import com.school.entity.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByStudentAndDate(Student student, LocalDate date);
    List<Attendance> findByDate(LocalDate date);
    List<Attendance> findBySchoolClassAndSectionAndDate(SchoolClass schoolClass, Section section, LocalDate date);
    List<Attendance> findByStudentAndDateBetween(Student student, LocalDate startDate, LocalDate endDate);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student = :student AND a.status = 'PRESENT' AND a.date BETWEEN :startDate AND :endDate")
    Long countPresentDays(@Param("student") Student student, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.date = :date AND a.status = 'PRESENT'")
    Long countPresentToday(@Param("date") LocalDate date);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.date = :date")
    Long countTotalToday(@Param("date") LocalDate date);
}
