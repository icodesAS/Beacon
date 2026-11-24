package com.beacon.dao;

import com.beacon.model.User;
import com.beacon.util.DatabaseConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.Optional;
import org.springframework.stereotype.Repository;

/**
 * Plain JDBC implementation of UserDao.
 * Concept (03-java-concepts-map): JDBC persistence with PreparedStatement and
 * try-with-resources for safe connection, statement, and result set cleanup.
 */
@Repository
public class JdbcUserDao implements UserDao {

    private static final String SQL_FIND_BY_EMAIL =
            "SELECT id, full_name, email, password_hash, created_at FROM users WHERE email = ?";
    private static final String SQL_FIND_BY_ID =
            "SELECT id, full_name, email, password_hash, created_at FROM users WHERE id = ?";
    private static final String SQL_INSERT =
            "INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)";

    private final DatabaseConnection databaseConnection;

    public JdbcUserDao(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
    }

    @Override
    public Optional<User> findByEmail(String email) {
        try (Connection conn = databaseConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(SQL_FIND_BY_EMAIL)) {
            stmt.setString(1, email);
            try (ResultSet rs = stmt.executeQuery()) {
                return rs.next() ? Optional.of(mapRow(rs)) : Optional.empty();
            }
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to query user by email", ex);
        }
    }

    @Override
    public Optional<User> findById(int id) {
        try (Connection conn = databaseConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(SQL_FIND_BY_ID)) {
            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                return rs.next() ? Optional.of(mapRow(rs)) : Optional.empty();
            }
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to query user by id", ex);
        }
    }

    @Override
    public User create(User user) {
        try (Connection conn = databaseConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(SQL_INSERT, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, user.getFullName());
            stmt.setString(2, user.getEmail());
            stmt.setString(3, user.getPasswordHash());
            stmt.executeUpdate();

            try (ResultSet keys = stmt.getGeneratedKeys()) {
                if (!keys.next()) {
                    throw new IllegalStateException("No generated key returned for inserted user");
                }
                int generatedId = keys.getInt(1);
                return findById(generatedId)
                        .orElseThrow(() -> new IllegalStateException("Inserted user could not be loaded"));
            }
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to insert user", ex);
        }
    }

    private User mapRow(ResultSet rs) throws SQLException {
        User user = new User();
        user.setId(rs.getInt("id"));
        user.setFullName(rs.getString("full_name"));
        user.setEmail(rs.getString("email"));
        user.setPasswordHash(rs.getString("password_hash"));
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            user.setCreatedAt(createdAt.toInstant());
        }
        return user;
    }
}
