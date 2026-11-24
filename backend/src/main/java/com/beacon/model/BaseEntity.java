package com.beacon.model;

import java.time.Instant;

/**
 * Abstract base class holding shared identity and creation timestamp fields.
 * Concept (03-java-concepts-map): Inheritance & Encapsulation — child models share
 * private id and createdAt fields accessed through getters and setters.
 */
public abstract class BaseEntity {

    private Integer id;
    private Instant createdAt;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
