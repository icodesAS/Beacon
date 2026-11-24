package com.beacon.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.beacon.dto.StatsSummaryResponse;
import com.beacon.dto.StatsSummaryResponse.CategoryCount;
import com.beacon.dto.StatsSummaryResponse.DailyCount;
import com.beacon.dto.StatsSummaryResponse.LastAlertSummary;
import com.beacon.dto.StatsSummaryResponse.StatusCount;
import com.beacon.security.SessionConstants;
import com.beacon.service.StatsService;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(StatsController.class)
class StatsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private StatsService statsService;

    @Test
    void getSummaryWithoutSessionReturns401() throws Exception {
        mockMvc.perform(get("/api/stats/summary"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"));
    }

    @Test
    void getSummaryWithSessionReturns200() throws Exception {
        StatsSummaryResponse summary = new StatsSummaryResponse(
                4,
                2,
                3,
                new LastAlertSummary(15, "MEDICAL", "Medical", 1, "SENT", Instant.parse("2026-01-15T10:00:00Z")),
                List.of(new CategoryCount("MEDICAL", "Medical", 4)),
                List.of(new StatusCount("SENT", 4)),
                List.of(new DailyCount("2026-01-15", 1)));

        when(statsService.getSummary(7)).thenReturn(summary);

        MockHttpSession session = new MockHttpSession();
        session.setAttribute(SessionConstants.USER_ID_ATTR, 7);

        mockMvc.perform(get("/api/stats/summary").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAlerts").value(4))
                .andExpect(jsonPath("$.alertsThisMonth").value(2))
                .andExpect(jsonPath("$.contactCount").value(3))
                .andExpect(jsonPath("$.lastAlert.id").value(15))
                .andExpect(jsonPath("$.byCategory[0].category").value("MEDICAL"))
                .andExpect(jsonPath("$.byStatus[0].status").value("SENT"))
                .andExpect(jsonPath("$.last30Days[0].date").value("2026-01-15"));
    }
}
