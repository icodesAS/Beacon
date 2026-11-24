package com.beacon.dto;

import com.beacon.model.User;
import java.time.Instant;

/**
 * Public user representation returned by auth endpoints (never includes passwordHash).
 */
public record UserResponse(
        int id,
        String fullName,
        String email,
        Instant createdAt) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getCreatedAt());
    }
}
