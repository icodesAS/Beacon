package com.beacon.controller;

import com.beacon.dto.LoginRequest;
import com.beacon.dto.RegisterRequest;
import com.beacon.dto.UserResponse;
import com.beacon.model.User;
import com.beacon.security.SessionConstants;
import com.beacon.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Thin REST controller for user registration, login, logout, and session check.
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Account registration, login, and session management")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user account")
    public ResponseEntity<UserResponse> register(@RequestBody RegisterRequest request) {
        User created = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(UserResponse.from(created));
    }

    @PostMapping("/login")
    @Operation(summary = "Log in and create an HTTP session")
    public ResponseEntity<UserResponse> login(
            @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        User user = authService.login(request);
        HttpSession existing = httpRequest.getSession(false);
        if (existing != null) {
            existing.invalidate();
        }
        HttpSession session = httpRequest.getSession(true);
        session.setAttribute(SessionConstants.USER_ID_ATTR, user.getId());
        return ResponseEntity.ok(UserResponse.from(user));
    }

    @PostMapping("/logout")
    @Operation(summary = "Log out and invalidate the current session")
    public ResponseEntity<Void> logout(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @Operation(summary = "Get the currently logged-in user")
    public ResponseEntity<UserResponse> me(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        int userId = (int) session.getAttribute(SessionConstants.USER_ID_ATTR);
        User user = authService.getCurrentUser(userId);
        return ResponseEntity.ok(UserResponse.from(user));
    }
}
