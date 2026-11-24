package com.beacon.util;

import com.beacon.exception.ValidationException;
import com.beacon.model.EmergencyCategory;
import com.beacon.model.Relation;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Centralizes backend input validation rules so frontend checks are always enforced on the server.
 */
public final class InputValidator {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private static final Pattern LETTER_PATTERN = Pattern.compile(".*[A-Za-z].*");
    private static final Pattern DIGIT_PATTERN = Pattern.compile(".*[0-9].*");
    private static final Pattern INDIAN_MOBILE_PATTERN = Pattern.compile("^[6-9][0-9]{9}$");

    private InputValidator() {
    }

    public static String validateFullName(String rawName) {
        String trimmed = rawName == null ? "" : rawName.trim();
        if (trimmed.length() < 2 || trimmed.length() > 50) {
            throw new ValidationException(
                    "Full name must be between 2 and 50 characters.",
                    Map.of("fullName", "Full name must be between 2 and 50 characters."));
        }
        return trimmed;
    }

    public static String validateEmail(String rawEmail) {
        String normalized = rawEmail == null ? "" : rawEmail.trim().toLowerCase(Locale.ROOT);
        if (normalized.isEmpty() || normalized.length() > 100 || !EMAIL_PATTERN.matcher(normalized).matches()) {
            throw new ValidationException(
                    "Please enter a valid email address.",
                    Map.of("email", "Please enter a valid email address."));
        }
        return normalized;
    }

    public static void validatePassword(String password) {
        if (password == null
                || password.length() < 8
                || !LETTER_PATTERN.matcher(password).matches()
                || !DIGIT_PATTERN.matcher(password).matches()) {
            throw new ValidationException(
                    "Password must be at least 8 characters and include a letter and a number.",
                    Map.of("password", "Password must be at least 8 characters and include a letter and a number."));
        }
    }

    public static void validateRegistration(String fullName, String email, String password) {
        Map<String, String> errors = new LinkedHashMap<>();

        String trimmedName = fullName == null ? "" : fullName.trim();
        if (trimmedName.length() < 2 || trimmedName.length() > 50) {
            errors.put("fullName", "Full name must be between 2 and 50 characters.");
        }

        String normalizedEmail = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
        if (normalizedEmail.isEmpty()
                || normalizedEmail.length() > 100
                || !EMAIL_PATTERN.matcher(normalizedEmail).matches()) {
            errors.put("email", "Please enter a valid email address.");
        }

        if (password == null
                || password.length() < 8
                || !LETTER_PATTERN.matcher(password).matches()
                || !DIGIT_PATTERN.matcher(password).matches()) {
            errors.put("password", "Password must be at least 8 characters and include a letter and a number.");
        }

        if (!errors.isEmpty()) {
            throw new ValidationException("Please check the highlighted fields.", errors);
        }
    }

    public static void validateLogin(String email, String password) {
        Map<String, String> errors = new LinkedHashMap<>();
        if (email == null || email.trim().isEmpty()) {
            errors.put("email", "Email is required.");
        }
        if (password == null || password.isEmpty()) {
            errors.put("password", "Password is required.");
        }
        if (!errors.isEmpty()) {
            throw new ValidationException("Please check the highlighted fields.", errors);
        }
    }

    public static String validatePhone(String rawPhone) {
        String digits = rawPhone == null ? "" : rawPhone.trim();
        if (!INDIAN_MOBILE_PATTERN.matcher(digits).matches()) {
            throw new ValidationException(
                    "Phone must be 10 digits starting with 6, 7, 8, or 9.",
                    Map.of("phone", "Phone must be 10 digits starting with 6, 7, 8, or 9."));
        }
        return digits;
    }

    public static void validateContact(String name, String phone, String relation) {
        Map<String, String> errors = new LinkedHashMap<>();

        String trimmedName = name == null ? "" : name.trim();
        if (trimmedName.length() < 2 || trimmedName.length() > 50) {
            errors.put("name", "Contact name must be between 2 and 50 characters.");
        }

        String trimmedPhone = phone == null ? "" : phone.trim();
        if (!INDIAN_MOBILE_PATTERN.matcher(trimmedPhone).matches()) {
            errors.put("phone", "Phone must be 10 digits starting with 6, 7, 8, or 9.");
        }

        try {
            Relation.fromString(relation);
        } catch (IllegalArgumentException ex) {
            errors.put("relation", "Please select a valid relation.");
        }

        if (!errors.isEmpty()) {
            throw new ValidationException("Please check the highlighted fields.", errors);
        }
    }

    public static void validateAlertCreate(String category, String message, String locationText) {
        Map<String, String> errors = new LinkedHashMap<>();

        try {
            EmergencyCategory.fromString(category);
        } catch (IllegalArgumentException ex) {
            errors.put("category", "Please select a valid emergency category.");
        }

        String trimmedMessage = message == null ? "" : message.trim();
        if (trimmedMessage.length() < 5 || trimmedMessage.length() > 300) {
            errors.put("message", "Message must be between 5 and 300 characters.");
        }

        if (locationText != null && !locationText.isBlank()) {
            String trimmedLocation = locationText.trim();
            if (trimmedLocation.length() > 100) {
                errors.put("locationText", "Location must be at most 100 characters.");
            }
        }

        if (!errors.isEmpty()) {
            throw new ValidationException("Please check the highlighted fields.", errors);
        }
    }
}
