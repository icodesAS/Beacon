package com.beacon.dto;

/**
 * Request body for POST /api/auth/register.
 */
public record RegisterRequest(
        String fullName,
        String email,
        String password) {
}
