package com.beacon.dto;

import java.time.Instant;
import java.util.List;

/**
 * Aggregated dashboard statistics payload returned by GET /api/stats/summary.
 */
public record StatsSummaryResponse(
        int totalAlerts,
        int alertsThisMonth,
        int contactCount,
        LastAlertSummary lastAlert,
        List<CategoryCount> byCategory,
        List<StatusCount> byStatus,
        List<DailyCount> last30Days) {

    public record LastAlertSummary(
            int id,
            String category,
            String categoryLabel,
            int priority,
            String status,
            Instant createdAt) {}

    public record CategoryCount(String category, String label, int count) {}

    public record StatusCount(String status, int count) {}

    public record DailyCount(String date, int count) {}
}
