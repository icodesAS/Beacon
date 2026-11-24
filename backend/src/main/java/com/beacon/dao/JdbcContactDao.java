package com.beacon.dao;

import com.beacon.model.EmergencyContact;
import com.beacon.model.Relation;
import com.beacon.util.DatabaseConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;

/**
 * Plain JDBC implementation of ContactDao.
 * Concept (03-java-concepts-map): JDBC persistence with PreparedStatement,
 * try-with-resources, and strict user_id isolation in every query.
 */
@Repository
public class JdbcContactDao implements ContactDao {

    private static final String SQL_FIND_ALL_BY_USER =
            "SELECT id, user_id, name, phone, relation, created_at "
                    + "FROM contacts WHERE user_id = ? ORDER BY created_at DESC, id DESC";
    private static final String SQL_FIND_BY_ID_AND_USER =
            "SELECT id, user_id, name, phone, relation, created_at "
                    + "FROM contacts WHERE id = ? AND user_id = ?";
    private static final String SQL_INSERT =
            "INSERT INTO contacts (user_id, name, phone, relation) VALUES (?, ?, ?, ?)";
    private static final String SQL_UPDATE =
            "UPDATE contacts SET name = ?, phone = ?, relation = ? WHERE id = ? AND user_id = ?";
    private static final String SQL_DELETE =
            "DELETE FROM contacts WHERE id = ? AND user_id = ?";

    private final DatabaseConnection databaseConnection;

    public JdbcContactDao(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
    }

    @Override
    public List<EmergencyContact> findAllByUserId(int userId) {
        List<EmergencyContact> contacts = new ArrayList<>();
        try (Connection conn = databaseConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(SQL_FIND_ALL_BY_USER)) {
            stmt.setInt(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    contacts.add(mapRow(rs));
                }
            }
            return contacts;
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to load contacts", ex);
        }
    }

    @Override
    public Optional<EmergencyContact> findByIdAndUserId(int id, int userId) {
        try (Connection conn = databaseConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(SQL_FIND_BY_ID_AND_USER)) {
            stmt.setInt(1, id);
            stmt.setInt(2, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                return rs.next() ? Optional.of(mapRow(rs)) : Optional.empty();
            }
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to load contact", ex);
        }
    }

    @Override
    public EmergencyContact create(EmergencyContact contact) {
        try (Connection conn = databaseConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(SQL_INSERT, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, contact.getUserId());
            stmt.setString(2, contact.getName());
            stmt.setString(3, contact.getPhone());
            stmt.setString(4, contact.getRelation().name());
            stmt.executeUpdate();

            try (ResultSet keys = stmt.getGeneratedKeys()) {
                if (!keys.next()) {
                    throw new IllegalStateException("No generated key returned for contact");
                }
                int id = keys.getInt(1);
                return findByIdAndUserId(id, contact.getUserId())
                        .orElseThrow(() -> new IllegalStateException("Inserted contact could not be loaded"));
            }
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to create contact", ex);
        }
    }

    @Override
    public EmergencyContact update(EmergencyContact contact) {
        try (Connection conn = databaseConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(SQL_UPDATE)) {
            stmt.setString(1, contact.getName());
            stmt.setString(2, contact.getPhone());
            stmt.setString(3, contact.getRelation().name());
            stmt.setInt(4, contact.getId());
            stmt.setInt(5, contact.getUserId());
            int rows = stmt.executeUpdate();
            if (rows == 0) {
                throw new IllegalStateException("Contact update affected 0 rows");
            }
            return findByIdAndUserId(contact.getId(), contact.getUserId())
                    .orElseThrow(() -> new IllegalStateException("Updated contact could not be loaded"));
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to update contact", ex);
        }
    }

    @Override
    public boolean deleteByIdAndUserId(int id, int userId) {
        try (Connection conn = databaseConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(SQL_DELETE)) {
            stmt.setInt(1, id);
            stmt.setInt(2, userId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to delete contact", ex);
        }
    }

    private EmergencyContact mapRow(ResultSet rs) throws SQLException {
        EmergencyContact contact = new EmergencyContact();
        contact.setId(rs.getInt("id"));
        contact.setUserId(rs.getInt("user_id"));
        contact.setName(rs.getString("name"));
        contact.setPhone(rs.getString("phone"));
        contact.setRelation(Relation.fromString(rs.getString("relation")));
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            contact.setCreatedAt(createdAt.toInstant());
        }
        return contact;
    }
}
