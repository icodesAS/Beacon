package com.beacon.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents an SOS alert created by a user and its simulated recipients.
 */
public class Alert extends BaseEntity {

    private int userId;
    private EmergencyCategory category;
    private int priority;
    private String message;
    private String locationText;
    private AlertStatus status;
    private Instant updatedAt;
    private List<AlertRecipient> recipients = new ArrayList<>();

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public EmergencyCategory getCategory() {
        return category;
    }

    public void setCategory(EmergencyCategory category) {
        this.category = category;
    }

    public int getPriority() {
        return priority;
    }

    public void setPriority(int priority) {
        this.priority = priority;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getLocationText() {
        return locationText;
    }

    public void setLocationText(String locationText) {
        this.locationText = locationText;
    }

    public AlertStatus getStatus() {
        return status;
    }

    public void setStatus(AlertStatus status) {
        this.status = status;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<AlertRecipient> getRecipients() {
        return recipients;
    }

    public void setRecipients(List<AlertRecipient> recipients) {
        this.recipients = recipients != null ? recipients : new ArrayList<>();
    }
}
