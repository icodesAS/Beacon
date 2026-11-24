package com.beacon.model;

import java.util.Locale;

/**
 * Supported emergency categories with assigned severity priority (1 = highest, 4 = lowest).
 */
public enum EmergencyCategory {
    MEDICAL(1, "Medical"),
    FIRE(1, "Fire"),
    ACCIDENT(2, "Accident"),
    HARASSMENT(2, "Harassment or Threat"),
    NATURAL_DISASTER(2, "Natural Disaster"),
    THEFT(3, "Theft or Robbery"),
    OTHER(4, "Other");

    private final int priority;
    private final String label;

    EmergencyCategory(int priority, String label) {
        this.priority = priority;
        this.label = label;
    }

    public int getPriority() {
        return priority;
    }

    public String getLabel() {
        return label;
    }

    public static EmergencyCategory fromString(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Category is required.");
        }
        return EmergencyCategory.valueOf(value.trim().toUpperCase(Locale.ROOT));
    }
}
