package com.beacon.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.beacon.dao.AlertDao;
import com.beacon.dao.ContactDao;
import com.beacon.dto.CreateAlertRequest;
import com.beacon.exception.BusinessRuleException;
import com.beacon.exception.InvalidStatusChangeException;
import com.beacon.model.Alert;
import com.beacon.model.AlertStatus;
import com.beacon.model.EmergencyCategory;
import com.beacon.model.EmergencyContact;
import com.beacon.model.Relation;
import com.beacon.util.DatabaseConnection;
import java.sql.Connection;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AlertServiceTest {

    @Mock
    private AlertDao alertDao;

    @Mock
    private ContactDao contactDao;

    @Mock
    private DatabaseConnection databaseConnection;

    private AlertService alertService;

    @BeforeEach
    void setUp() {
        alertService = new AlertService(alertDao, contactDao, new SimulatedAlertSender(), databaseConnection);
    }

    @Test
    void createAlertThrowsWhenUserHasNoContacts() {
        when(contactDao.findAllByUserId(7)).thenReturn(List.of());

        BusinessRuleException ex = assertThrows(
                BusinessRuleException.class,
                () -> alertService.createAlert(
                        7, new CreateAlertRequest("MEDICAL", "Need medical help immediately", null, false)));

        assertEquals("NO_CONTACTS", ex.getCode());
    }

    @Test
    void createAlertThrowsOnDuplicateWithinTwoMinutesUnlessForced() throws Exception {
        when(contactDao.findAllByUserId(7)).thenReturn(List.of(sampleContact()));

        Alert recent = new Alert();
        recent.setId(10);
        recent.setCategory(EmergencyCategory.FIRE);
        recent.setCreatedAt(Instant.now().minusSeconds(45));
        when(alertDao.findLatestByUserIdAndCategory(7, EmergencyCategory.FIRE)).thenReturn(Optional.of(recent));

        BusinessRuleException ex = assertThrows(
                BusinessRuleException.class,
                () -> alertService.createAlert(
                        7, new CreateAlertRequest("FIRE", "Smoke in apartment stairwell", "Block B", false)));
        assertEquals("DUPLICATE_RECENT_ALERT", ex.getCode());

        // force = true bypasses duplicate check and commits transaction
        Connection conn = mock(Connection.class);
        when(databaseConnection.getConnection()).thenReturn(conn);
        doAnswer(inv -> {
            Alert a = inv.getArgument(1);
            a.setId(99);
            return a;
        }).when(alertDao).insert(eq(conn), any(Alert.class));

        Alert created = alertService.createAlert(
                7, new CreateAlertRequest("FIRE", "Smoke in apartment stairwell", "Block B", true));

        assertEquals(AlertStatus.SENT, created.getStatus());
        verify(conn).commit();
    }

    @Test
    void isRecentDuplicateRespectsTwoMinuteWindowAndCategory() {
        Instant now = Instant.now();

        Alert inside = new Alert();
        inside.setCreatedAt(now.minusSeconds(119));
        when(alertDao.findLatestByUserIdAndCategory(7, EmergencyCategory.MEDICAL))
                .thenReturn(Optional.of(inside));
        assertTrue(alertService.isRecentDuplicate(7, EmergencyCategory.MEDICAL, now));

        Alert outside = new Alert();
        outside.setCreatedAt(now.minusSeconds(121));
        when(alertDao.findLatestByUserIdAndCategory(7, EmergencyCategory.MEDICAL))
                .thenReturn(Optional.of(outside));
        assertFalse(alertService.isRecentDuplicate(7, EmergencyCategory.MEDICAL, now));

        when(alertDao.findLatestByUserIdAndCategory(7, EmergencyCategory.THEFT))
                .thenReturn(Optional.empty());
        assertFalse(alertService.isRecentDuplicate(7, EmergencyCategory.THEFT, now));
    }

    @Test
    void updateAlertStatusRejectsInvalidTargetOrTerminalState() {
        assertThrows(
                InvalidStatusChangeException.class,
                () -> alertService.updateAlertStatus(7, 1, "SENT"));

        Alert resolved = new Alert();
        resolved.setId(1);
        resolved.setUserId(7);
        resolved.setStatus(AlertStatus.RESOLVED);
        when(alertDao.findByIdAndUserId(1, 7)).thenReturn(Optional.of(resolved));

        assertThrows(
                InvalidStatusChangeException.class,
                () -> alertService.updateAlertStatus(7, 1, "CANCELLED"));
    }

    @Test
    void createAlertRollsBackTransactionWhenInsertRecipientsFails() throws Exception {
        when(contactDao.findAllByUserId(7)).thenReturn(List.of(sampleContact()));
        when(alertDao.findLatestByUserIdAndCategory(7, EmergencyCategory.ACCIDENT)).thenReturn(Optional.empty());

        Connection conn = mock(Connection.class);
        when(databaseConnection.getConnection()).thenReturn(conn);
        doAnswer(inv -> {
            Alert a = inv.getArgument(1);
            a.setId(55);
            return a;
        }).when(alertDao).insert(eq(conn), any(Alert.class));
        doThrow(new IllegalStateException("DB insert failed"))
                .when(alertDao)
                .insertRecipients(eq(conn), eq(55), anyList());

        assertThrows(
                IllegalStateException.class,
                () -> alertService.createAlert(
                        7, new CreateAlertRequest("ACCIDENT", "Minor collision near junction", "MG Road", false)));

        verify(conn).setAutoCommit(false);
        verify(conn).rollback();
        verify(conn, never()).commit();
        verify(alertDao, never()).updateStatus(eq(conn), anyInt(), anyInt(), any());
    }

    private EmergencyContact sampleContact() {
        EmergencyContact contact = new EmergencyContact();
        contact.setId(1);
        contact.setUserId(7);
        contact.setName("Priya Nair");
        contact.setPhone("9876543210");
        contact.setRelation(Relation.PARENT);
        return contact;
    }
}
