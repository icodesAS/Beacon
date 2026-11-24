package com.beacon.service;

import com.beacon.model.Alert;
import com.beacon.model.AlertRecipient;
import com.beacon.model.EmergencyContact;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

/**
 * Primary alert sender that delegates to SimulatedAlertSender and logs each simulated dispatch.
 */
@Primary
@Component
public class LoggingAlertSender implements AlertSender {

    private static final Logger log = LoggerFactory.getLogger(LoggingAlertSender.class);

    private final AlertSender delegate;

    public LoggingAlertSender(SimulatedAlertSender delegate) {
        this.delegate = delegate;
    }

    @Override
    public List<AlertRecipient> send(Alert alert, List<EmergencyContact> contacts) {
        List<AlertRecipient> recipients = delegate.send(alert, contacts);
        for (AlertRecipient recipient : recipients) {
            log.info(
                    "Simulated SOS [alertId={}, category={}, priority={}] notified {} ({}, {})",
                    alert.getId(),
                    alert.getCategory(),
                    alert.getPriority(),
                    recipient.getContactName(),
                    recipient.getContactPhone(),
                    recipient.getContactRelation());
        }
        return recipients;
    }
}
