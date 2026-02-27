package com.school.repository;

import com.school.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByPublishedTrue();
    List<Event> findByEventDateAfter(LocalDate date);
    List<Event> findByEventType(String eventType);
}
