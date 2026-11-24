package com.beacon.service;

import com.beacon.dao.AlertDao;
import com.beacon.dao.ContactDao;
import com.beacon.dto.CreateAlertRequest;
import com.beacon.exception.BusinessRuleException;
import com.beacon.exception.InvalidStatusChangeException;
import com.beacon.exception.ResourceNotFoundException;
import com.beacon.model.Alert;
import com.beacon.model.AlertRecipient;
import com.beacon.model.AlertStatus;
import com.beacon.model.EmergencyCategory;
import com.beacon.model.EmergencyContact;
import com.beacon.util.DatabaseConnection;
import com.beacon.util.InputValidator;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

/**
 * Business logic for creating, reading, and updating SOS alerts.
 */
@Service
public class AlertService {

    private static final Duration DUPLICATE_WINDOW = Duration.ofMinutes(2);

    private final AlertDao alertDao;
    private final ContactDao contactDao;
    private final AlertSender alertSender;
    private final DatabaseConnection databaseConnection;

    public AlertService(
            AlertDao alertDao,
            ContactDao contactDao,
            AlertSender alertSender,
            DatabaseConnection databaseConnection) {
        this.alertDao = alertDao;
        this.contactDao = contactDao;
        this.alertSender = alertSender;
        this.databaseConnection = databaseConnection;
    }

    public Alert createAlert(int userId, CreateAlertRequest request) {
        InputValidator.validateAlertCreate(request.category(), request.message(), request.locationText());

        EmergencyCategory category = EmergencyCategory.fromString(request.category());
        String trimmedMessage = request.message().trim();
        String normalizedLocation =
                (request.locationText() == null || request.locationText().isBlank())
                        ? null
                        : request.locationText().trim();

        List<EmergencyContact> contacts = contactDao.findAllByUserId(userId);
        if (contacts.isEmpty()) {
            throw new BusinessRuleException(
                    HttpStatus.BAD_REQUEST,
                    "NO_CONTACTS",
                    "Add at least one emergency contact before sending an SOS.");
        }

        if (!request.force() && isRecentDuplicate(userId, category, Instant.now())) {
            throw new BusinessRuleException(
                    HttpStatus.CONFLICT,
                    "DUPLICATE_RECENT_ALERT",
                    "You sent a similar alert recently. Send again?");
        }

        Alert alert = new Alert();
        alert.setUserId(userId);
        alert.setCategory(category);
        alert.setPriority(category.getPriority());
        alert.setMessage(trimmedMessage);
        alert.setLocationText(normalizedLocation);
        alert.setStatus(AlertStatus.CREATED);

        try (Connection conn = databaseConnection.getConnection()) {
            conn.setAutoCommit(false);
            try {
                alertDao.insert(conn, alert);
                List<AlertRecipient> recipients = alertSender.send(alert, contacts);
                alertDao.insertRecipients(conn, alert.getId(), recipients);
                alertDao.updateStatus(conn, alert.getId(), userId, AlertStatus.SENT);
                conn.commit();

                alert.setStatus(AlertStatus.SENT);
                alert.setRecipients(recipients);
            } catch (Exception ex) {
                try {
                    conn.rollback();
                } catch (SQLException rollbackEx) {
                    ex.addSuppressed(rollbackEx);
                }
                if (ex instanceof RuntimeException runtimeEx) {
                    throw runtimeEx;
                }
                throw new IllegalStateException("Failed to create alert", ex);
            } finally {
                try {
                    conn.setAutoCommit(true);
                } catch (SQLException ignored) {
                    // Connection is closing
                }
            }
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to create alert", ex);
        }

        return alertDao.findByIdAndUserId(alert.getId(), userId).orElse(alert);
    }

    public Alert getAlert(int userId, int alertId) {
        return alertDao.findByIdAndUserId(alertId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found."));
    }

    public Alert updateAlertStatus(int userId, int alertId, String nextStatusStr) {
        AlertStatus nextStatus;
        try {
            nextStatus = AlertStatus.fromString(nextStatusStr);
        } catch (IllegalArgumentException ex) {
            throw new InvalidStatusChangeException("Status must be RESOLVED or CANCELLED.");
        }

        if (nextStatus != AlertStatus.RESOLVED && nextStatus != AlertStatus.CANCELLED) {
            throw new InvalidStatusChangeException("Status must be RESOLVED or CANCELLED.");
        }

        Alert existing = getAlert(userId, alertId);
        if (!existing.getStatus().canChangeTo(nextStatus)) {
            throw new InvalidStatusChangeException(
                    "Cannot change alert status from " + existing.getStatus() + " to " + nextStatus + ".");
        }

        boolean updated = alertDao.updateStatusByIdAndUserId(alertId, userId, nextStatus);
        if (!updated) {
            throw new ResourceNotFoundException("Alert not found.");
        }

        return getAlert(userId, alertId);
    }

    boolean isRecentDuplicate(int userId, EmergencyCategory category, Instant now) {
        Optional<Alert> latestOpt = alertDao.findLatestByUserIdAndCategory(userId, category);
        if (latestOpt.isEmpty()) {
            return false;
        }
        Instant createdAt = latestOpt.get().getCreatedAt();
        if (createdAt == null) {
            return false;
        }
        Duration elapsed = Duration.between(createdAt, now);
        return elapsed.compareTo(DUPLICATE_WINDOW) < 0;
    }
}
