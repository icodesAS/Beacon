package com.beacon.dto;

import java.util.List;

/**
 * Paginated SOS alert list payload returned by GET /api/alerts.
 */
public record PagedAlertsResponse(
        List<AlertResponse> items,
        int page,
        int size,
        long totalItems,
        int totalPages) {}
