package com.beacon.service;

import com.beacon.dao.AlertDao;
import com.beacon.dao.ContactDao;
import com.beacon.dto.StatsSummaryResponse;
import com.beacon.dto.StatsSummaryResponse.CategoryCount;
import com.beacon.dto.StatsSummaryResponse.DailyCount;
import com.beacon.dto.StatsSummaryResponse.LastAlertSummary;
import com.beacon.dto.StatsSummaryResponse.StatusCount;
import com.beacon.model.Alert;
import com.beacon.model.AlertStatus;
import com.beacon.model.EmergencyCategory;
import com.beacon.model.EmergencyContact;
import com.beacon.service.comparator.AlertByNewestFirst;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import org.springframework.stereotype.Service;

/**
 * Computes dashboard analytics for a user's SOS alerts and emergency contacts.
 */
@Service
public class StatsService {

    private final AlertDao alertDao;
    private final ContactDao contactDao;

    public StatsService(AlertDao alertDao, ContactDao contactDao) {
        this.alertDao = alertDao;
        this.contactDao = contactDao;
    }

    public StatsSummaryResponse getSummary(int userId) {
        List<Alert> alerts = alertDao.findAllByUserId(userId);
        List<EmergencyContact> contacts = contactDao.findAllByUserId(userId);

        int totalAlerts = alerts.size();
        int contactCount = contacts.size();

        YearMonth currentMonth = YearMonth.now(ZoneOffset.UTC);
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        LocalDate windowStart = today.minusDays(29);

        int alertsThisMonth = 0;

        // 03-java-concepts-map: HashMap and TreeMap stats grouping
        Map<EmergencyCategory, Integer> categoryCounts = new HashMap<>();
        Map<AlertStatus, Integer> statusCounts = new HashMap<>();
        Map<LocalDate, Integer> dailyCounts = new TreeMap<>();
        for (int i = 0; i < 30; i++) {
            dailyCounts.put(windowStart.plusDays(i), 0);
        }

        for (Alert alert : alerts) {
            if (alert.getCategory() != null) {
                categoryCounts.put(
                        alert.getCategory(),
                        categoryCounts.getOrDefault(alert.getCategory(), 0) + 1);
            }
            if (alert.getStatus() != null) {
                statusCounts.put(
                        alert.getStatus(),
                        statusCounts.getOrDefault(alert.getStatus(), 0) + 1);
            }
            Instant createdAt = alert.getCreatedAt();
            if (createdAt != null) {
                LocalDate utcDate = createdAt.atZone(ZoneOffset.UTC).toLocalDate();
                if (YearMonth.from(utcDate).equals(currentMonth)) {
                    alertsThisMonth++;
                }
                if (!utcDate.isBefore(windowStart) && !utcDate.isAfter(today)) {
                    dailyCounts.put(utcDate, dailyCounts.getOrDefault(utcDate, 0) + 1);
                }
            }
        }

        LastAlertSummary lastAlert = null;
        if (!alerts.isEmpty()) {
            List<Alert> sorted = new ArrayList<>(alerts);
            sorted.sort(new AlertByNewestFirst());
            Alert newest = sorted.get(0);
            lastAlert = new LastAlertSummary(
                    newest.getId() != null ? newest.getId() : 0,
                    newest.getCategory().name(),
                    newest.getCategory().getLabel(),
                    newest.getPriority(),
                    newest.getStatus().name(),
                    newest.getCreatedAt());
        }

        List<CategoryCount> byCategory = new ArrayList<>();
        for (EmergencyCategory category : EmergencyCategory.values()) {
            int count = categoryCounts.getOrDefault(category, 0);
            if (count > 0) {
                byCategory.add(new CategoryCount(category.name(), category.getLabel(), count));
            }
        }

        List<StatusCount> byStatus = new ArrayList<>();
        for (AlertStatus status : AlertStatus.values()) {
            int count = statusCounts.getOrDefault(status, 0);
            if (count > 0) {
                byStatus.add(new StatusCount(status.name(), count));
            }
        }

        List<DailyCount> last30Days = new ArrayList<>(30);
        for (Map.Entry<LocalDate, Integer> entry : dailyCounts.entrySet()) {
            last30Days.add(new DailyCount(entry.getKey().toString(), entry.getValue()));
        }

        return new StatsSummaryResponse(
                totalAlerts,
                alertsThisMonth,
                contactCount,
                lastAlert,
                byCategory,
                byStatus,
                last30Days);
    }
}
