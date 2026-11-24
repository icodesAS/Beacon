package com.beacon.model;

import java.util.Locale;

/**
 * Lifecycle statuses for an SOS alert with explicit state transition rules.
 * Concept (03-java-concepts-map): Rule-based processing & Enum behavior — centralizes valid status transitions.
 */
public enum AlertStatus {
    CREATED,
    SENT,
    RESOLVED,
    CANCELLED;

    public boolean canChangeTo(AlertStatus next) {
        if (next == null) {
            return false;
        }
        return switch (this) {
            case CREATED -> next == SENT;
            case SENT -> next == RESOLVED || next == CANCELLED;
            case RESOLVED, CANCELLED -> false;
        };
    }

    public static AlertStatus fromString(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Status is required.");
        }
        return AlertStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
    }
}
