package com.beacon.dto;

import com.beacon.model.EmergencyContact;
import java.time.Instant;

/**
 * Public emergency contact payload returned by /api/contacts endpoints.
 */
public record ContactResponse(
        int id,
        String name,
        String phone,
        String relation,
        String relationLabel,
        Instant createdAt) {

    public static ContactResponse from(EmergencyContact contact) {
        return new ContactResponse(
                contact.getId(),
                contact.getName(),
                contact.getPhone(),
                contact.getRelation().name(),
                contact.getRelation().getLabel(),
                contact.getCreatedAt());
    }
}
