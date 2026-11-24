package com.beacon.util;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.beacon.exception.ValidationException;
import org.junit.jupiter.api.Test;

class InputValidatorTest {

    @Test
    void validateFullNameAcceptsValidLengths() {
        assertEquals("Aarav Sharma", InputValidator.validateFullName("  Aarav Sharma  "));
        assertEquals("Jo", InputValidator.validateFullName("Jo"));
    }

    @Test
    void validateFullNameRejectsTooShortOrTooLong() {
        assertThrows(ValidationException.class, () -> InputValidator.validateFullName("A"));
        assertThrows(ValidationException.class, () -> InputValidator.validateFullName("   "));
        assertThrows(ValidationException.class, () -> InputValidator.validateFullName("A".repeat(51)));
    }

    @Test
    void validateEmailNormalizesToLowercaseAndRejectsInvalid() {
        assertEquals("user@beacon.local", InputValidator.validateEmail("  User@Beacon.Local "));
        assertThrows(ValidationException.class, () -> InputValidator.validateEmail("not-an-email"));
        assertThrows(ValidationException.class, () -> InputValidator.validateEmail(""));
    }

    @Test
    void validatePasswordRequiresMinLengthLetterAndNumber() {
        assertDoesNotThrow(() -> InputValidator.validatePassword("Demo1234"));
        assertThrows(ValidationException.class, () -> InputValidator.validatePassword("Demo123"));
        assertThrows(ValidationException.class, () -> InputValidator.validatePassword("OnlyLetters"));
        assertThrows(ValidationException.class, () -> InputValidator.validatePassword("12345678"));
    }

    @Test
    void validateRegistrationCollectsAllFieldErrors() {
        ValidationException ex = assertThrows(
                ValidationException.class,
                () -> InputValidator.validateRegistration("A", "bad", "weak"));
        assertTrue(ex.getFieldErrors().containsKey("fullName"));
        assertTrue(ex.getFieldErrors().containsKey("email"));
        assertTrue(ex.getFieldErrors().containsKey("password"));
    }

    @Test
    void validatePhoneAcceptsValidIndianMobileAndRejectsInvalid() {
        assertEquals("9876543210", InputValidator.validatePhone("  9876543210 "));
        assertEquals("6123456789", InputValidator.validatePhone("6123456789"));
        assertThrows(ValidationException.class, () -> InputValidator.validatePhone("5876543210"));
        assertThrows(ValidationException.class, () -> InputValidator.validatePhone("987654321"));
        assertThrows(ValidationException.class, () -> InputValidator.validatePhone("98765432101"));
        assertThrows(ValidationException.class, () -> InputValidator.validatePhone("98765abc10"));
        assertThrows(ValidationException.class, () -> InputValidator.validatePhone(null));
    }

    @Test
    void validateContactAcceptsValidInputAndCollectsFieldErrors() {
        assertDoesNotThrow(() -> InputValidator.validateContact("Priya Nair", "9876543210", "PARENT"));
        assertDoesNotThrow(() -> InputValidator.validateContact("Dr. Rao", "8123456789", "doctor"));

        ValidationException ex = assertThrows(
                ValidationException.class,
                () -> InputValidator.validateContact("A", "12345", "UNKNOWN"));
        assertTrue(ex.getFieldErrors().containsKey("name"));
        assertTrue(ex.getFieldErrors().containsKey("phone"));
        assertTrue(ex.getFieldErrors().containsKey("relation"));
    }
}
