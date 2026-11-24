package com.beacon.model;

/**
 * Represents a registered Beacon user account.
 * Concept (03-java-concepts-map): Encapsulation & Inheritance — extends BaseEntity and
 * stores only the BCrypt password hash, never the plain-text password.
 */
public class User extends BaseEntity {

    private String fullName;
    private String email;
    private String passwordHash;

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }
}
