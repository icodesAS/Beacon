package com.beacon.model;

import java.time.Instant;

/**
 * Snapshot of an emergency contact notified as part of an SOS alert.
 */
public class AlertRecipient {

    private Integer id;
    private int alertId;
    private String contactName;
    private String contactPhone;
    private Relation contactRelation;
    private Instant notifiedAt;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public int getAlertId() {
        return alertId;
    }

    public void setAlertId(int alertId) {
        this.alertId = alertId;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public Relation getContactRelation() {
        return contactRelation;
    }

    public void setContactRelation(Relation contactRelation) {
        this.contactRelation = contactRelation;
    }

    public Instant getNotifiedAt() {
        return notifiedAt;
    }

    public void setNotifiedAt(Instant notifiedAt) {
        this.notifiedAt = notifiedAt;
    }
}
