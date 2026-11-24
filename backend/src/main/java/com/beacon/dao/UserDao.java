package com.beacon.dao;

import com.beacon.model.User;
import java.util.Optional;

/**
 * Data access contract for user accounts.
 * Concept (03-java-concepts-map): Abstraction & interfaces — AuthService depends on
 * this interface rather than the concrete JDBC implementation.
 */
public interface UserDao {

    Optional<User> findByEmail(String email);

    Optional<User> findById(int id);

    User create(User user);
}
