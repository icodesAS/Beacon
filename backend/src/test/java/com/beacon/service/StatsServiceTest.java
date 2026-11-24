package com.beacon.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.beacon.dao.AlertDao;
import com.beacon.dao.ContactDao;
import com.beacon.dto.StatsSummaryResponse;
import com.beacon.model.Alert;
import com.beacon.model.AlertStatus;
import com.beacon.model.EmergencyCategory;
import com.beacon.model.EmergencyContact;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.junit.jupiter.api.Test;

class StatsServiceTest {

    @Test
    void getSummaryComputesTotalsCategoryStatusAnd30DayWindow() {
        AlertDao alertDao = mock(AlertDao.class);
        ContactDao contactDao = mock(ContactDao.class);
        StatsService statsService = new StatsService(alertDao, contactDao);

        Instant now = Instant.now();
        LocalDate todayUtc = LocalDate.now(ZoneOffset.UTC);
        Instant twoDaysAgo = todayUtc.minusDays(2).atTime(12, 0).toInstant(ZoneOffset.UTC);
        Instant fortyDaysAgo = todayUtc.minusDays(40).atTime(12, 0).toInstant(ZoneOffset.UTC);

        Alert a1 = alert(1, EmergencyCategory.MEDICAL, AlertStatus.SENT, now);
        Alert a2 = alert(2, EmergencyCategory.MEDICAL, AlertStatus.RESOLVED, twoDaysAgo);
        Alert a3 = alert(3, EmergencyCategory.THEFT, AlertStatus.CANCELLED, fortyDaysAgo);

        when(alertDao.findAllByUserId(7)).thenReturn(List.of(a2, a3, a1));
        when(contactDao.findAllByUserId(7)).thenReturn(List.of(new EmergencyContact(), new EmergencyContact()));

        StatsSummaryResponse summary = statsService.getSummary(7);

        assertEquals(3, summary.totalAlerts());
        assertEquals(2, summary.contactCount());

        int expectedThisMonth = (int) List.of(a1, a2, a3).stream()
                .filter(a -> a.getCreatedAt().atZone(ZoneOffset.UTC).getMonth() == now.atZone(ZoneOffset.UTC).getMonth()
                        && a.getCreatedAt().atZone(ZoneOffset.UTC).getYear() == now.atZone(ZoneOffset.UTC).getYear())
                .count();
        assertEquals(expectedThisMonth, summary.alertsThisMonth());

        assertNotNull(summary.lastAlert());
        assertEquals(1, summary.lastAlert().id());
        assertEquals("MEDICAL", summary.lastAlert().category());
        assertEquals("Medical", summary.lastAlert().categoryLabel());

        assertEquals(2, summary.byCategory().size());
        assertEquals(2, summary.byCategory().stream()
                .filter(c -> c.category().equals("MEDICAL"))
                .findFirst()
                .orElseThrow()
                .count());
        assertEquals(1, summary.byCategory().stream()
                .filter(c -> c.category().equals("THEFT"))
                .findFirst()
                .orElseThrow()
                .count());

        assertEquals(3, summary.byStatus().size());

        assertEquals(30, summary.last30Days().size());
        assertEquals(todayUtc.minusDays(29).toString(), summary.last30Days().get(0).date());
        assertEquals(todayUtc.toString(), summary.last30Days().get(29).date());
        assertEquals(1, summary.last30Days().get(29).count());
        assertEquals(1, summary.last30Days().get(27).count());
        assertEquals(0, summary.last30Days().get(0).count());
        assertEquals(2, summary.last30Days().stream().mapToInt(StatsSummaryResponse.DailyCount::count).sum());

        // Ensure timestamps with sub-day differences still stay accurate
        assertEquals(now.truncatedTo(ChronoUnit.SECONDS), summary.lastAlert().createdAt().truncatedTo(ChronoUnit.SECONDS));
    }

    private Alert alert(int id, EmergencyCategory category, AlertStatus status, Instant createdAt) {
        Alert alert = new Alert();
        alert.setId(id);
        alert.setUserId(7);
        alert.setCategory(category);
        alert.setPriority(category.getPriority());
        alert.setStatus(status);
        alert.setMessage("Test alert " + id);
        alert.setCreatedAt(createdAt);
        return alert;
    }
}
