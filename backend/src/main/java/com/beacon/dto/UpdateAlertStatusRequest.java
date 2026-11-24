package com.beacon.dto;

/**
 * Request body for updating an SOS alert status (RESOLVED or CANCELLED).
 */
public record UpdateAlertStatusRequest(String status) {
}
