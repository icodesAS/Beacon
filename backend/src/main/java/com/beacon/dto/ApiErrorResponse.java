package com.beacon.dto;

import java.util.Map;

/**
 * Standard API error response shape shared across all endpoints.
 */
public record ApiErrorResponse(
        int status,
        String code,
        String message,
        Map<String, String> fieldErrors) {
}
