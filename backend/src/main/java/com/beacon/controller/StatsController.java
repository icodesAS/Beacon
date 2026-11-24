package com.beacon.controller;

import com.beacon.dto.StatsSummaryResponse;
import com.beacon.security.SessionConstants;
import com.beacon.service.StatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for dashboard statistics and chart summaries.
 */
@RestController
@RequestMapping("/api/stats")
@Tag(name = "Stats", description = "Dashboard statistics and analytics")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/summary")
    @Operation(summary = "Get aggregated SOS alert and contact statistics for the current user")
    public ResponseEntity<StatsSummaryResponse> getSummary(HttpServletRequest request) {
        int userId = (int) request.getSession(false).getAttribute(SessionConstants.USER_ID_ATTR);
        return ResponseEntity.ok(statsService.getSummary(userId));
    }
}
