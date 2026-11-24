package com.beacon.service;

import com.beacon.model.Alert;
import com.beacon.model.AlertRecipient;
import com.beacon.model.EmergencyContact;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * Simulated alert dispatcher that creates recipient snapshots without sending real messages.
 */
@Component
public class SimulatedAlertSender implements AlertSender {

    @Override
    public List<AlertRecipient> send(Alert alert, List<EmergencyContact> contacts) {
        Instant notifiedAt = Instant.now();
        List<AlertRecipient> recipients = new ArrayList<>(contacts.size());
        for (EmergencyContact contact : contacts) {
            AlertRecipient recipient = new AlertRecipient();
            if (alert.getId() != null) {
                recipient.setAlertId(alert.getId());
            }
            recipient.setContactName(contact.getName());
            recipient.setContactPhone(contact.getPhone());
            recipient.setContactRelation(contact.getRelation());
            recipient.setNotifiedAt(notifiedAt);
            recipients.add(recipient);
        }
        return recipients;
    }
}
