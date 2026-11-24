package com.beacon.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.beacon.dto.AlertResponse;
import com.beacon.dto.PagedAlertsResponse;
import com.beacon.model.Alert;
import com.beacon.model.AlertRecipient;
import com.beacon.model.AlertStatus;
import com.beacon.model.EmergencyCategory;
import com.beacon.model.Relation;
import com.beacon.security.SessionConstants;
import com.beacon.service.AlertService;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AlertController.class)
class AlertControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AlertService alertService;

    @Test
    void createAlertWithoutSessionReturns401() throws Exception {
        mockMvc.perform(post("/api/alerts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"category\":\"MEDICAL\",\"message\":\"Need help now\",\"force\":false}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"));
    }

    @Test
    void createAlertWithSessionReturns201() throws Exception {
        Alert alert = sampleAlert(12, AlertStatus.SENT);
        when(alertService.createAlert(eq(7), any())).thenReturn(alert);

        MockHttpSession session = sessionFor(7);

        mockMvc.perform(post("/api/alerts")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"category\":\"MEDICAL\",\"message\":\"Need urgent medical help\",\"locationText\":\"Home\",\"force\":false}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(12))
                .andExpect(jsonPath("$.category").value("MEDICAL"))
                .andExpect(jsonPath("$.categoryLabel").value("Medical"))
                .andExpect(jsonPath("$.priority").value(1))
                .andExpect(jsonPath("$.status").value("SENT"))
                .andExpect(jsonPath("$.recipients[0].contactName").value("Priya Nair"));
    }

    @Test
    void listAlertsWithSessionReturnsPagedResponse() throws Exception {
        AlertResponse item = AlertResponse.from(sampleAlert(12, AlertStatus.SENT));
        PagedAlertsResponse paged = new PagedAlertsResponse(List.of(item), 0, 10, 1, 1);
        when(alertService.listAlerts(7, "newest", "MEDICAL", null, null, 0, 10)).thenReturn(paged);

        MockHttpSession session = sessionFor(7);

        mockMvc.perform(get("/api/alerts")
                        .session(session)
                        .param("sort", "newest")
                        .param("category", "MEDICAL")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].id").value(12))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(10))
                .andExpect(jsonPath("$.totalItems").value(1))
                .andExpect(jsonPath("$.totalPages").value(1));
    }

    @Test
    void updateStatusWithSessionReturns200() throws Exception {
        Alert alert = sampleAlert(12, AlertStatus.RESOLVED);
        when(alertService.updateAlertStatus(7, 12, "RESOLVED")).thenReturn(alert);

        MockHttpSession session = sessionFor(7);

        mockMvc.perform(patch("/api/alerts/12/status")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"RESOLVED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(12))
                .andExpect(jsonPath("$.status").value("RESOLVED"));
    }

    private MockHttpSession sessionFor(int userId) {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute(SessionConstants.USER_ID_ATTR, userId);
        return session;
    }

    private Alert sampleAlert(int id, AlertStatus status) {
        AlertRecipient recipient = new AlertRecipient();
        recipient.setId(1);
        recipient.setAlertId(id);
        recipient.setContactName("Priya Nair");
        recipient.setContactPhone("9876543210");
        recipient.setContactRelation(Relation.PARENT);
        recipient.setNotifiedAt(Instant.now());

        Alert alert = new Alert();
        alert.setId(id);
        alert.setUserId(7);
        alert.setCategory(EmergencyCategory.MEDICAL);
        alert.setPriority(1);
        alert.setMessage("Need urgent medical help");
        alert.setLocationText("Home");
        alert.setStatus(status);
        alert.setCreatedAt(Instant.now());
        alert.setUpdatedAt(Instant.now());
        alert.setRecipients(List.of(recipient));
        return alert;
    }
}
