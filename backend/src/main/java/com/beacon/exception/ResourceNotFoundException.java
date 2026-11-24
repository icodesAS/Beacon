package com.beacon.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when a requested entity does not exist or belongs to another user (HTTP 404).
 */
public class ResourceNotFoundException extends ApiException {

    public ResourceNotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, "NOT_FOUND", message);
    }
}
