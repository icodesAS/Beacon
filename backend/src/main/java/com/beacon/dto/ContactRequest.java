package com.beacon.dto;

/**
 * Request body for creating or updating an emergency contact.
 */
public record ContactRequest(
        String name,
        String phone,
        String relation) {
}
