package com.beacon.dto;

import com.beacon.model.Alert;
import com.beacon.model.AlertRecipient;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Public SOS alert payload returned by /api/alerts endpoints.
 */
public record AlertResponse(
        int id,
        String category,
        String categoryLabel,
        int priority,
        String message,
        String locationText,
        String status,
        Instant createdAt,
        Instant updatedAt,
        List<AlertRecipientResponse> recipients) {

    public static AlertResponse from(Alert alert) {
        List<AlertRecipient> sourceRecipients = alert.getRecipients();
        List<AlertRecipientResponse> recipientResponses = new ArrayList<>(sourceRecipients.size());
        for (AlertRecipient recipient : sourceRecipients) {
            recipientResponses.add(AlertRecipientResponse.from(recipient));
        }
        return new AlertResponse(
                alert.getId() != null ? alert.getId() : 0,
                alert.getCategory().name(),
                alert.getCategory().getLabel(),
                alert.getPriority(),
                alert.getMessage(),
                alert.getLocationText(),
                alert.getStatus().name(),
                alert.getCreatedAt(),
                alert.getUpdatedAt(),
                recipientResponses);
    }
}
