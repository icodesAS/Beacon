package com.beacon.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when creating a resource that conflicts with an existing record (HTTP 409).
 */
public class DuplicateResourceException extends ApiException {

    public DuplicateResourceException(String code, String message) {
        super(HttpStatus.CONFLICT, code, message);
    }
}
