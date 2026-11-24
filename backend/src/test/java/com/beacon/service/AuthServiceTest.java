package com.beacon.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.beacon.dao.UserDao;
import com.beacon.dto.LoginRequest;
import com.beacon.dto.RegisterRequest;
import com.beacon.exception.AuthenticationException;
import com.beacon.exception.DuplicateResourceException;
import com.beacon.model.User;
import com.beacon.security.PasswordHasher;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserDao userDao;

    private PasswordHasher passwordHasher;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        passwordHasher = new PasswordHasher();
        authService = new AuthService(userDao, passwordHasher);
    }

    @Test
    void registerHashesPasswordNormalizesEmailAndCreatesUser() {
        when(userDao.findByEmail("aarav@beacon.local")).thenReturn(Optional.empty());
        when(userDao.create(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(1);
            u.setCreatedAt(Instant.now());
            return u;
        });

        User created = authService.register(
                new RegisterRequest("  Aarav Sharma ", "Aarav@Beacon.Local", "Demo1234"));

        assertEquals(1, created.getId());
        assertEquals("Aarav Sharma", created.getFullName());
        assertEquals("aarav@beacon.local", created.getEmail());

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userDao).create(captor.capture());
        assertNotEquals("Demo1234", captor.getValue().getPasswordHash());
    }

    @Test
    void registerRejectsDuplicateEmail() {
        User existing = new User();
        existing.setId(1);
        existing.setEmail("aarav@beacon.local");
        when(userDao.findByEmail("aarav@beacon.local")).thenReturn(Optional.of(existing));

        DuplicateResourceException ex = assertThrows(
                DuplicateResourceException.class,
                () -> authService.register(new RegisterRequest("Aarav", "aarav@beacon.local", "Demo1234")));
        assertEquals("EMAIL_TAKEN", ex.getCode());
    }

    @Test
    void loginSucceedsWithValidCredentials() {
        User stored = new User();
        stored.setId(7);
        stored.setEmail("demo@beacon.local");
        stored.setFullName("Aarav Sharma");
        stored.setPasswordHash(passwordHasher.hash("Demo1234"));
        when(userDao.findByEmail("demo@beacon.local")).thenReturn(Optional.of(stored));

        User loggedIn = authService.login(new LoginRequest("DEMO@beacon.local", "Demo1234"));
        assertEquals(7, loggedIn.getId());
    }

    @Test
    void loginUsesSameGeneralMessageForUnknownEmailAndWrongPassword() {
        when(userDao.findByEmail("missing@beacon.local")).thenReturn(Optional.empty());

        User stored = new User();
        stored.setId(7);
        stored.setEmail("demo@beacon.local");
        stored.setPasswordHash(passwordHasher.hash("Demo1234"));
        when(userDao.findByEmail("demo@beacon.local")).thenReturn(Optional.of(stored));

        AuthenticationException unknownErr = assertThrows(
                AuthenticationException.class,
                () -> authService.login(new LoginRequest("missing@beacon.local", "Demo1234")));
        AuthenticationException wrongPassErr = assertThrows(
                AuthenticationException.class,
                () -> authService.login(new LoginRequest("demo@beacon.local", "Wrong999")));

        assertEquals("Email or password is incorrect.", unknownErr.getMessage());
        assertEquals(unknownErr.getMessage(), wrongPassErr.getMessage());
    }
}
