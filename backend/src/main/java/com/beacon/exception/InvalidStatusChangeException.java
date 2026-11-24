package com.beacon.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when an alert status transition violates the allowed state rules (HTTP 409).
 */
public class InvalidStatusChangeException extends ApiException {

    public InvalidStatusChangeException(String message) {
        super(HttpStatus.CONFLICT, "INVALID_STATUS_CHANGE", message);
    }
}
