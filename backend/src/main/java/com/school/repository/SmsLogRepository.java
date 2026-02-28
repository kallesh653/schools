package com.school.repository;

import com.school.entity.SmsLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SmsLogRepository extends JpaRepository<SmsLog, Long> {
    List<SmsLog> findAllByOrderByCreatedAtDesc();
    List<SmsLog> findByMessageTypeOrderByCreatedAtDesc(String messageType);
    List<SmsLog> findByStatusOrderByCreatedAtDesc(String status);
}
