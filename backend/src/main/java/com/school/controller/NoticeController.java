package com.school.controller;

import com.school.dto.MessageResponse;
import com.school.entity.Notice;
import com.school.exception.ResourceNotFoundException;
import com.school.repository.NoticeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notices")
@CrossOrigin(origins = "*")
public class NoticeController {

    @Autowired
    private NoticeRepository noticeRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    public ResponseEntity<List<Notice>> getAllNotices() {
        return ResponseEntity.ok(noticeRepository.findAll());
    }

    @GetMapping("/published")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    public ResponseEntity<List<Notice>> getPublishedNotices() {
        return ResponseEntity.ok(noticeRepository.findByPublishedTrue());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    public ResponseEntity<Notice> getNoticeById(@PathVariable Long id) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notice", "id", id));
        return ResponseEntity.ok(notice);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Notice> createNotice(@RequestBody Notice notice) {
        return ResponseEntity.ok(noticeRepository.save(notice));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Notice> updateNotice(@PathVariable Long id, @RequestBody Notice notice) {
        Notice existing = noticeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notice", "id", id));

        existing.setTitle(notice.getTitle());
        existing.setContent(notice.getContent());
        existing.setNoticeType(notice.getNoticeType());
        existing.setTargetAudience(notice.getTargetAudience());
        existing.setPublished(notice.getPublished());
        existing.setPublishDate(notice.getPublishDate());
        existing.setExpiryDate(notice.getExpiryDate());
        existing.setPriority(notice.getPriority());

        return ResponseEntity.ok(noticeRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteNotice(@PathVariable Long id) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notice", "id", id));
        noticeRepository.delete(notice);
        return ResponseEntity.ok(new MessageResponse("Notice deleted successfully"));
    }
}
