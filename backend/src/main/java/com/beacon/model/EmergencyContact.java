package com.beacon.model;

/**
 * Represents a saved emergency contact belonging to a specific user.
 * Concept (03-java-concepts-map): Encapsulation & Inheritance.
 */
public class EmergencyContact extends BaseEntity {

    private int userId;
    private String name;
    private String phone;
    private Relation relation;

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Relation getRelation() {
        return relation;
    }

    public void setRelation(Relation relation) {
        this.relation = relation;
    }
}
