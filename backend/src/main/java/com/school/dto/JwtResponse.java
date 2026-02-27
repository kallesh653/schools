package com.school.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private String role;
    private String fullName;
    private Long entityId;
    private String entityType;

    public JwtResponse(String token, Long id, String username, String email, String role, String fullName, Long entityId, String entityType) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.fullName = fullName;
        this.entityId = entityId;
        this.entityType = entityType;
    }
}
