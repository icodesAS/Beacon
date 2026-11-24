package com.beacon.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.beacon.model.User;
import com.beacon.security.SessionConstants;
import com.beacon.service.AuthService;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @Test
    void meWithoutSessionReturns401() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"));
    }

    @Test
    void meWithSessionReturnsCurrentUser() throws Exception {
        User user = new User();
        user.setId(1);
        user.setFullName("Aarav Sharma");
        user.setEmail("demo@beacon.local");
        user.setCreatedAt(Instant.now());
        when(authService.getCurrentUser(1)).thenReturn(user);

        MockHttpSession session = new MockHttpSession();
        session.setAttribute(SessionConstants.USER_ID_ATTR, 1);

        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("demo@beacon.local"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void loginReturns200AndCreatesSession() throws Exception {
        User user = new User();
        user.setId(1);
        user.setFullName("Aarav Sharma");
        user.setEmail("demo@beacon.local");
        when(authService.login(any())).thenReturn(user);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"demo@beacon.local\",\"password\":\"Demo1234\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Aarav Sharma"));
    }
}
