package com.school.repository;

import com.school.entity.SchoolProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SchoolProfileRepository extends JpaRepository<SchoolProfile, Long> {
}
