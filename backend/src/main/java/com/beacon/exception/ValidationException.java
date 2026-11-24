package com.beacon.exception;

import java.util.Map;
import org.springframework.http.HttpStatus;

/**
 * Thrown when request input fails domain validation rules (HTTP 400).
 */
public class ValidationException extends ApiException {

    public ValidationException(String message, Map<String, String> fieldErrors) {
        super(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", message, fieldErrors);
    }
}
