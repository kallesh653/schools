package com.school.repository;

import com.school.entity.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {
    List<Notice> findByPublishedTrue();
    List<Notice> findByNoticeType(String noticeType);
    List<Notice> findByTargetAudience(String targetAudience);
}
