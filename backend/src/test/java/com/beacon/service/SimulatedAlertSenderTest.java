package com.beacon.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.beacon.model.Alert;
import com.beacon.model.AlertRecipient;
import com.beacon.model.EmergencyCategory;
import com.beacon.model.EmergencyContact;
import com.beacon.model.Relation;
import java.util.List;
import org.junit.jupiter.api.Test;

class SimulatedAlertSenderTest {

    private final SimulatedAlertSender sender = new SimulatedAlertSender();

    @Test
    void buildsOneRecipientPerContactWithCopiedDetails() {
        Alert alert = new Alert();
        alert.setId(42);
        alert.setCategory(EmergencyCategory.MEDICAL);
        alert.setPriority(1);

        EmergencyContact c1 = new EmergencyContact();
        c1.setName("Priya Nair");
        c1.setPhone("9876543210");
        c1.setRelation(Relation.PARENT);

        EmergencyContact c2 = new EmergencyContact();
        c2.setName("Dr. Mehta");
        c2.setPhone("8123456789");
        c2.setRelation(Relation.DOCTOR);

        List<AlertRecipient> recipients = sender.send(alert, List.of(c1, c2));

        assertEquals(2, recipients.size());

        AlertRecipient r1 = recipients.get(0);
        assertEquals(42, r1.getAlertId());
        assertEquals("Priya Nair", r1.getContactName());
        assertEquals("9876543210", r1.getContactPhone());
        assertEquals(Relation.PARENT, r1.getContactRelation());
        assertNotNull(r1.getNotifiedAt());

        AlertRecipient r2 = recipients.get(1);
        assertEquals(42, r2.getAlertId());
        assertEquals("Dr. Mehta", r2.getContactName());
        assertEquals("8123456789", r2.getContactPhone());
        assertEquals(Relation.DOCTOR, r2.getContactRelation());
        assertNotNull(r2.getNotifiedAt());
    }
}
