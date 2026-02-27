package com.school.repository;

import com.school.entity.Message;
import com.school.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findBySenderOrReceiver(User sender, User receiver);
    List<Message> findByReceiver(User receiver);
    List<Message> findByReceiverAndIsReadFalse(User receiver);
}
