package com.beacon.dto;

/**
 * Request body for creating and sending a simulated SOS alert.
 */
public record CreateAlertRequest(
        String category,
        String message,
        String locationText,
        boolean force) {
}
