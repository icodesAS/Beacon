package com.beacon.dao;

import com.beacon.model.Alert;
import com.beacon.model.AlertRecipient;
import com.beacon.model.AlertStatus;
import com.beacon.model.EmergencyCategory;
import com.beacon.model.Relation;
import com.beacon.util.DatabaseConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.sql.Types;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;

/**
 * Plain JDBC implementation of AlertDao with PreparedStatement, try-with-resources, and user_id isolation.
 */
@Repository
public class JdbcAlertDao implements AlertDao {

    private static final String SQL_INSERT_ALERT =
            "INSERT INTO alerts (user_id, category, priority, message, location_text, status) "
                    + "VALUES (?, ?, ?, ?, ?, ?)";
    private static final String SQL_INSERT_RECIPIENT =
            "INSERT INTO alert_recipients (alert_id, contact_name, contact_phone, contact_relation, notified_at) "
                    + "VALUES (?, ?, ?, ?, ?)";
    private static final String SQL_UPDATE_STATUS =
            "UPDATE alerts SET status = ? WHERE id = ? AND user_id = ?";
    private static final String SQL_FIND_LATEST_BY_USER_AND_CATEGORY =
            "SELECT id, user_id, category, priority, message, location_text, status, created_at, updated_at "
                    + "FROM alerts WHERE user_id = ? AND category = ? ORDER BY created_at DESC, id DESC LIMIT 1";
    private static final String SQL_FIND_BY_ID_AND_USER =
            "SELECT id, user_id, category, priority, message, location_text, status, created_at, updated_at "
                    + "FROM alerts WHERE id = ? AND user_id = ?";
    private static final String SQL_FIND_ALL_BY_USER =
            "SELECT id, user_id, category, priority, message, location_text, status, created_at, updated_at "
                    + "FROM alerts WHERE user_id = ? ORDER BY created_at DESC, id DESC";
    private static final String SQL_FIND_RECIPIENTS_BY_ALERT =
            "SELECT id, alert_id, contact_name, contact_phone, contact_relation, notified_at "
                    + "FROM alert_recipients WHERE alert_id = ? ORDER BY id ASC";

    private final DatabaseConnection databaseConnection;

    public JdbcAlertDao(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
    }

    @Override
    public Alert insert(Connection conn, Alert alert) {
        try (PreparedStatement stmt = conn.prepareStatement(SQL_INSERT_ALERT, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, alert.getUserId());
            stmt.setString(2, alert.getCategory().name());
            stmt.setInt(3, alert.getPriority());
            stmt.setString(4, alert.getMessage());
            if (alert.getLocationText() == null) {
                stmt.setNull(5, Types.VARCHAR);
            } else {
                stmt.setString(5, alert.getLocationText());
            }
            stmt.setString(6, alert.getStatus().name());
            stmt.executeUpdate();

            try (ResultSet keys = stmt.getGeneratedKeys()) {
                if (!keys.next()) {
                    throw new IllegalStateException("No generated key returned for alert");
                }
                alert.setId(keys.getInt(1));
                return alert;
            }
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to insert alert", ex);
        }
    }

    @Override
    public void insertRecipients(Connection conn, int alertId, List<AlertRecipient> recipients) {
        if (recipients == null || recipients.isEmpty()) {
            return;
        }
        try (PreparedStatement stmt = conn.prepareStatement(SQL_INSERT_RECIPIENT)) {
            for (AlertRecipient recipient : recipients) {
                Instant notifiedAt = recipient.getNotifiedAt() != null
                        ? recipient.getNotifiedAt()
                        : Instant.now();
                stmt.setInt(1, alertId);
                stmt.setString(2, recipient.getContactName());
                stmt.setString(3, recipient.getContactPhone());
                stmt.setString(4, recipient.getContactRelation().name());
                stmt.setTimestamp(5, Timestamp.from(notifiedAt));
                stmt.addBatch();
            }
            stmt.executeBatch();
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to insert alert recipients", ex);
        }
    }

    @Override
    public void updateStatus(Connection conn, int alertId, int userId, AlertStatus status) {
        try (PreparedStatement stmt = conn.prepareStatement(SQL_UPDATE_STATUS)) {
            stmt.setString(1, status.name());
            stmt.setInt(2, alertId);
            stmt.setInt(3, userId);
            int rows = stmt.executeUpdate();
            if (rows == 0) {
                throw new IllegalStateException("Alert status update affected 0 rows");
            }
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to update alert status", ex);
        }
    }

    @Override
    public Optional<Alert> findLatestByUserIdAndCategory(int userId, EmergencyCategory category) {
        try (Connection conn = databaseConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(SQL_FIND_LATEST_BY_USER_AND_CATEGORY)) {
            stmt.setInt(1, userId);
            stmt.setString(2, category.name());
            try (ResultSet rs = stmt.executeQuery()) {
                return rs.next() ? Optional.of(mapRow(rs)) : Optional.empty();
            }
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to find latest alert", ex);
        }
    }

    @Override
    public Optional<Alert> findByIdAndUserId(int id, int userId) {
        try (Connection conn = databaseConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(SQL_FIND_BY_ID_AND_USER)) {
            stmt.setInt(1, id);
            stmt.setInt(2, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (!rs.next()) {
                    return Optional.empty();
                }
                Alert alert = mapRow(rs);
                alert.setRecipients(loadRecipients(conn, alert.getId()));
                return Optional.of(alert);
            }
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to load alert", ex);
        }
    }

    @Override
    public List<Alert> findAllByUserId(int userId) {
        List<Alert> alerts = new ArrayList<>();
        try (Connection conn = databaseConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(SQL_FIND_ALL_BY_USER)) {
            stmt.setInt(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    alerts.add(mapRow(rs));
                }
            }
            return alerts;
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to load alerts for user", ex);
        }
    }

    @Override
    public boolean updateStatusByIdAndUserId(int id, int userId, AlertStatus status) {
        try (Connection conn = databaseConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(SQL_UPDATE_STATUS)) {
            stmt.setString(1, status.name());
            stmt.setInt(2, id);
            stmt.setInt(3, userId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to update alert status", ex);
        }
    }

    private List<AlertRecipient> loadRecipients(Connection conn, int alertId) throws SQLException {
        List<AlertRecipient> recipients = new ArrayList<>();
        try (PreparedStatement stmt = conn.prepareStatement(SQL_FIND_RECIPIENTS_BY_ALERT)) {
            stmt.setInt(1, alertId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    recipients.add(mapRecipientRow(rs));
                }
            }
        }
        return recipients;
    }

    private Alert mapRow(ResultSet rs) throws SQLException {
        Alert alert = new Alert();
        alert.setId(rs.getInt("id"));
        alert.setUserId(rs.getInt("user_id"));
        alert.setCategory(EmergencyCategory.fromString(rs.getString("category")));
        alert.setPriority(rs.getInt("priority"));
        alert.setMessage(rs.getString("message"));
        alert.setLocationText(rs.getString("location_text"));
        alert.setStatus(AlertStatus.fromString(rs.getString("status")));
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            alert.setCreatedAt(createdAt.toInstant());
        }
        Timestamp updatedAt = rs.getTimestamp("updated_at");
        if (updatedAt != null) {
            alert.setUpdatedAt(updatedAt.toInstant());
        }
        return alert;
    }

    private AlertRecipient mapRecipientRow(ResultSet rs) throws SQLException {
        AlertRecipient recipient = new AlertRecipient();
        recipient.setId(rs.getInt("id"));
        recipient.setAlertId(rs.getInt("alert_id"));
        recipient.setContactName(rs.getString("contact_name"));
        recipient.setContactPhone(rs.getString("contact_phone"));
        recipient.setContactRelation(Relation.fromString(rs.getString("contact_relation")));
        Timestamp notifiedAt = rs.getTimestamp("notified_at");
        if (notifiedAt != null) {
            recipient.setNotifiedAt(notifiedAt.toInstant());
        }
        return recipient;
    }
}
