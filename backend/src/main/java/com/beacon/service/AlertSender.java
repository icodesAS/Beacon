package com.beacon.service;

import com.beacon.model.Alert;
import com.beacon.model.AlertRecipient;
import com.beacon.model.EmergencyContact;
import java.util.List;

/**
 * Abstraction for dispatching an SOS alert to emergency contacts.
 */
public interface AlertSender {

    List<AlertRecipient> send(Alert alert, List<EmergencyContact> contacts);
}
