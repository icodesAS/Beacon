package com.beacon.dto;

/**
 * Request body for POST /api/auth/login.
 */
public record LoginRequest(
        String email,
        String password) {
}
