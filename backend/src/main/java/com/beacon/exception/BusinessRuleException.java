package com.beacon.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when a domain business rule prevents an operation (e.g., contact limit or no contacts).
 */
public class BusinessRuleException extends ApiException {

    public BusinessRuleException(HttpStatus status, String code, String message) {
        super(status, code, message);
    }
}
