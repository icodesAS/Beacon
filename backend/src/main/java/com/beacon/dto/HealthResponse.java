package com.beacon.dto;

/**
 * Health check response returned by GET /api/health.
 */
public record HealthResponse(
        String status,
        String database) {
}
