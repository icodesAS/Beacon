package com.beacon.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Provides plain JDBC connections configured from application properties.
 * Concept (03-java-concepts-map): JDBC persistence helper — centralizes DriverManager setup
 * so DAOs never hard-code credentials or URLs.
 */
@Component
public class DatabaseConnection {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConnection.class);

    private final String url;
    private final String user;
    private final String password;

    public DatabaseConnection(
            @Value("${app.db.url}") String url,
            @Value("${app.db.user}") String user,
            @Value("${app.db.password}") String password) {
        this.url = url;
        this.user = user;
        this.password = password;
    }

    public Connection getConnection() throws SQLException {
        return DriverManager.getConnection(url, user, password);
    }

    public boolean isReachable() {
        try (Connection connection = getConnection()) {
            return connection.isValid(2);
        } catch (SQLException ex) {
            log.warn("Database health check failed: {}", ex.getMessage());
            return false;
        }
    }
}
