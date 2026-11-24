package com.beacon.controller;

import com.beacon.dto.HealthResponse;
import com.beacon.util.DatabaseConnection;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Health check endpoint for verifying backend and database availability.
 */
@RestController
@RequestMapping("/api")
@Tag(name = "Health", description = "Service health check")
public class HealthController {

    private final DatabaseConnection databaseConnection;

    public HealthController(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
    }

    @GetMapping("/health")
    @Operation(summary = "Check API and database health")
    public HealthResponse health() {
        String dbStatus = databaseConnection.isReachable() ? "UP" : "DOWN";
        return new HealthResponse("OK", dbStatus);
    }
}
