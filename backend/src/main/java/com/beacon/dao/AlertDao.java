package com.beacon.dao;

import com.beacon.model.Alert;
import com.beacon.model.AlertRecipient;
import com.beacon.model.AlertStatus;
import com.beacon.model.EmergencyCategory;
import java.sql.Connection;
import java.util.List;
import java.util.Optional;

/**
 * Data access contract for SOS alerts and their recipient snapshots. Every alert query is scoped to userId.
 */
public interface AlertDao {

    Alert insert(Connection conn, Alert alert);

    void insertRecipients(Connection conn, int alertId, List<AlertRecipient> recipients);

    void updateStatus(Connection conn, int alertId, int userId, AlertStatus status);

    Optional<Alert> findLatestByUserIdAndCategory(int userId, EmergencyCategory category);

    Optional<Alert> findByIdAndUserId(int id, int userId);

    List<Alert> findAllByUserId(int userId);

    boolean updateStatusByIdAndUserId(int id, int userId, AlertStatus status);
}
