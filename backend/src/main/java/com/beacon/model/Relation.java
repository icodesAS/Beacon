package com.beacon.model;

import java.util.Locale;

/**
 * Allowed relationship types for emergency contacts.
 * Concept (03-java-concepts-map): Enum with display behavior.
 */
public enum Relation {
    PARENT("Parent"),
    SIBLING("Sibling"),
    FRIEND("Friend"),
    NEIGHBOR("Neighbor"),
    DOCTOR("Doctor"),
    OTHER("Other");

    private final String label;

    Relation(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static Relation fromString(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Relation is required.");
        }
        return Relation.valueOf(value.trim().toUpperCase(Locale.ROOT));
    }
}
