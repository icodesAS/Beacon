package com.beacon.model;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class AlertStatusTest {

    @Test
    void createdTransitionsOnlyToSent() {
        assertTrue(AlertStatus.CREATED.canChangeTo(AlertStatus.SENT));
        assertFalse(AlertStatus.CREATED.canChangeTo(AlertStatus.CREATED));
        assertFalse(AlertStatus.CREATED.canChangeTo(AlertStatus.RESOLVED));
        assertFalse(AlertStatus.CREATED.canChangeTo(AlertStatus.CANCELLED));
        assertFalse(AlertStatus.CREATED.canChangeTo(null));
    }

    @Test
    void sentTransitionsToResolvedOrCancelled() {
        assertTrue(AlertStatus.SENT.canChangeTo(AlertStatus.RESOLVED));
        assertTrue(AlertStatus.SENT.canChangeTo(AlertStatus.CANCELLED));
        assertFalse(AlertStatus.SENT.canChangeTo(AlertStatus.CREATED));
        assertFalse(AlertStatus.SENT.canChangeTo(AlertStatus.SENT));
        assertFalse(AlertStatus.SENT.canChangeTo(null));
    }

    @Test
    void resolvedAndCancelledAreTerminal() {
        for (AlertStatus terminal : new AlertStatus[] {AlertStatus.RESOLVED, AlertStatus.CANCELLED}) {
            for (AlertStatus target : AlertStatus.values()) {
                assertFalse(terminal.canChangeTo(target));
            }
            assertFalse(terminal.canChangeTo(null));
        }
    }
}
