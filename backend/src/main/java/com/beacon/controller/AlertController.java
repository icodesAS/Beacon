package com.beacon.controller;

import com.beacon.dto.AlertResponse;
import com.beacon.dto.CreateAlertRequest;
import com.beacon.dto.UpdateAlertStatusRequest;
import com.beacon.model.Alert;
import com.beacon.security.SessionConstants;
import com.beacon.service.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for creating, reading, and updating SOS alerts.
 */
@RestController
@RequestMapping("/api/alerts")
@Tag(name = "Alerts", description = "SOS alert creation and status management")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @PostMapping
    @Operation(summary = "Create and send a simulated SOS alert")
    public ResponseEntity<AlertResponse> createAlert(
            @RequestBody CreateAlertRequest body,
            HttpServletRequest request) {
        int userId = getUserId(request);
        Alert created = alertService.createAlert(userId, body);
        return ResponseEntity.status(HttpStatus.CREATED).body(AlertResponse.from(created));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single SOS alert with its notified recipients")
    public ResponseEntity<AlertResponse> getAlert(
            @PathVariable int id,
            HttpServletRequest request) {
        int userId = getUserId(request);
        Alert alert = alertService.getAlert(userId, id);
        return ResponseEntity.ok(AlertResponse.from(alert));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update an SOS alert status to RESOLVED or CANCELLED")
    public ResponseEntity<AlertResponse> updateAlertStatus(
            @PathVariable int id,
            @RequestBody UpdateAlertStatusRequest body,
            HttpServletRequest request) {
        int userId = getUserId(request);
        Alert updated = alertService.updateAlertStatus(userId, id, body.status());
        return ResponseEntity.ok(AlertResponse.from(updated));
    }

    private int getUserId(HttpServletRequest request) {
        return (int) request.getSession(false).getAttribute(SessionConstants.USER_ID_ATTR);
    }
}
