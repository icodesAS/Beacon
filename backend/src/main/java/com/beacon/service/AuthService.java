package com.beacon.service;

import com.beacon.dao.UserDao;
import com.beacon.dto.LoginRequest;
import com.beacon.dto.RegisterRequest;
import com.beacon.exception.AuthenticationException;
import com.beacon.exception.DuplicateResourceException;
import com.beacon.model.User;
import com.beacon.security.PasswordHasher;
import com.beacon.util.InputValidator;
import java.util.Locale;
import org.springframework.stereotype.Service;

/**
 * Handles user registration, credential verification, and account lookup.
 */
@Service
public class AuthService {

    private static final String INVALID_LOGIN_MESSAGE = "Email or password is incorrect.";

    private final UserDao userDao;
    private final PasswordHasher passwordHasher;

    public AuthService(UserDao userDao, PasswordHasher passwordHasher) {
        this.userDao = userDao;
        this.passwordHasher = passwordHasher;
    }

    public User register(RegisterRequest request) {
        InputValidator.validateRegistration(
                request.fullName(),
                request.email(),
                request.password());

        String normalizedEmail = request.email().trim().toLowerCase(Locale.ROOT);
        if (userDao.findByEmail(normalizedEmail).isPresent()) {
            throw new DuplicateResourceException(
                    "EMAIL_TAKEN",
                    "An account with this email already exists.");
        }

        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordHasher.hash(request.password()));
        return userDao.create(user);
    }

    public User login(LoginRequest request) {
        InputValidator.validateLogin(request.email(), request.password());

        String normalizedEmail = request.email().trim().toLowerCase(Locale.ROOT);
        User user = userDao.findByEmail(normalizedEmail)
                .orElseThrow(() -> new AuthenticationException(INVALID_LOGIN_MESSAGE));

        if (!passwordHasher.matches(request.password(), user.getPasswordHash())) {
            throw new AuthenticationException(INVALID_LOGIN_MESSAGE);
        }
        return user;
    }

    public User getCurrentUser(int userId) {
        return userDao.findById(userId)
                .orElseThrow(() -> new AuthenticationException("Please log in to continue."));
    }
}
