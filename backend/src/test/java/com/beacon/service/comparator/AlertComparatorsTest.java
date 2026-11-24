package com.beacon.service.comparator;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.beacon.model.Alert;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

class AlertComparatorsTest {

    @Test
    void newestFirstSortsByCreatedAtDescAndTieBreaksByIdDesc() {
        Instant t1 = Instant.parse("2026-01-10T10:00:00Z");
        Instant t2 = Instant.parse("2026-01-11T10:00:00Z");

        Alert older = alert(1, 2, t1);
        Alert tieLowId = alert(3, 1, t2);
        Alert tieHighId = alert(8, 3, t2);

        List<Alert> alerts = new ArrayList<>(List.of(older, tieLowId, tieHighId));
        alerts.sort(new AlertByNewestFirst());

        assertEquals(List.of(8, 3, 1), alerts.stream().map(Alert::getId).toList());
    }

    @Test
    void oldestFirstSortsByCreatedAtAscAndTieBreaksByIdAsc() {
        Instant t1 = Instant.parse("2026-01-10T10:00:00Z");
        Instant t2 = Instant.parse("2026-01-11T10:00:00Z");

        Alert tieHighId = alert(8, 1, t1);
        Alert tieLowId = alert(3, 2, t1);
        Alert newer = alert(1, 3, t2);

        List<Alert> alerts = new ArrayList<>(List.of(newer, tieHighId, tieLowId));
        alerts.sort(new AlertByOldestFirst());

        assertEquals(List.of(3, 8, 1), alerts.stream().map(Alert::getId).toList());
    }

    @Test
    void byPrioritySortsPriorityAscThenNewestFirstThenIdDesc() {
        Instant t1 = Instant.parse("2026-01-10T10:00:00Z");
        Instant t2 = Instant.parse("2026-01-11T10:00:00Z");

        Alert p3 = alert(10, 3, t2);
        Alert p1Older = alert(4, 1, t1);
        Alert p1TieLowId = alert(5, 1, t2);
        Alert p1TieHighId = alert(9, 1, t2);

        List<Alert> alerts = new ArrayList<>(List.of(p3, p1Older, p1TieLowId, p1TieHighId));
        alerts.sort(new AlertByPriority());

        assertEquals(List.of(9, 5, 4, 10), alerts.stream().map(Alert::getId).toList());
    }

    private Alert alert(int id, int priority, Instant createdAt) {
        Alert alert = new Alert();
        alert.setId(id);
        alert.setPriority(priority);
        alert.setCreatedAt(createdAt);
        return alert;
    }
}
