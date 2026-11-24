package com.beacon.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when authentication fails or a protected route is accessed without a session (HTTP 401).
 */
public class AuthenticationException extends ApiException {

    public AuthenticationException(String message) {
        super(HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED", message);
    }
}
