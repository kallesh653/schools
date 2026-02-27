package com.school.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class User extends BaseEntity {

    @Column(nullable = false, unique = true, length = 100)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, length = 100)
    private String email;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "full_name", length = 150)
    private String fullName;

    @Column(length = 20)
    private String contact;

    // Reference to actual entity (Teacher, Parent, Admin)
    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "entity_type", length = 50)
    private String entityType; // TEACHER, PARENT, ADMIN
}
