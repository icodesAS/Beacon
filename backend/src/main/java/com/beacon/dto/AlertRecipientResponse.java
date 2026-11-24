package com.beacon.dto;

import com.beacon.model.AlertRecipient;
import java.time.Instant;

/**
 * Public recipient snapshot returned inside AlertResponse.
 */
public record AlertRecipientResponse(
        int id,
        String contactName,
        String contactPhone,
        String contactRelation,
        String contactRelationLabel,
        Instant notifiedAt) {

    public static AlertRecipientResponse from(AlertRecipient recipient) {
        return new AlertRecipientResponse(
                recipient.getId() != null ? recipient.getId() : 0,
                recipient.getContactName(),
                recipient.getContactPhone(),
                recipient.getContactRelation().name(),
                recipient.getContactRelation().getLabel(),
                recipient.getNotifiedAt());
    }
}
