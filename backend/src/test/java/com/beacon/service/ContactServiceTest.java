package com.beacon.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.beacon.dao.ContactDao;
import com.beacon.dto.ContactRequest;
import com.beacon.exception.BusinessRuleException;
import com.beacon.exception.DuplicateResourceException;
import com.beacon.exception.ResourceNotFoundException;
import com.beacon.model.EmergencyContact;
import com.beacon.model.Relation;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ContactServiceTest {

    @Mock
    private ContactDao contactDao;

    @InjectMocks
    private ContactService contactService;

    @Test
    void addContactCreatesContactWhenUnderLimitAndUniquePhone() {
        when(contactDao.findAllByUserId(1)).thenReturn(List.of());
        EmergencyContact saved = buildContact(10, 1, "Priya Nair", "9876543210", Relation.PARENT);
        when(contactDao.create(any(EmergencyContact.class))).thenReturn(saved);

        EmergencyContact result = contactService.addContact(
                1, new ContactRequest("  Priya Nair  ", " 9876543210 ", "PARENT"));

        assertEquals(10, result.getId());
        assertEquals("Priya Nair", result.getName());
        assertEquals("9876543210", result.getPhone());
        verify(contactDao).create(any(EmergencyContact.class));
    }

    @Test
    void addContactBlocksEleventhContact() {
        List<EmergencyContact> tenContacts = new ArrayList<>();
        for (int i = 0; i < ContactService.MAX_CONTACTS; i++) {
            tenContacts.add(buildContact(i + 1, 1, "Contact " + i, "987654321" + i, Relation.FRIEND));
        }
        when(contactDao.findAllByUserId(1)).thenReturn(tenContacts);

        BusinessRuleException ex = assertThrows(
                BusinessRuleException.class,
                () -> contactService.addContact(1, new ContactRequest("Extra", "8876543210", "OTHER")));

        assertEquals("CONTACT_LIMIT_REACHED", ex.getCode());
    }

    @Test
    void addContactRejectsDuplicatePhone() {
        EmergencyContact existing = buildContact(1, 1, "Priya Nair", "9876543210", Relation.PARENT);
        when(contactDao.findAllByUserId(1)).thenReturn(List.of(existing));

        DuplicateResourceException ex = assertThrows(
                DuplicateResourceException.class,
                () -> contactService.addContact(1, new ContactRequest("Another Name", "9876543210", "FRIEND")));

        assertEquals("DUPLICATE_CONTACT", ex.getCode());
    }

    @Test
    void updateContactAllowsKeepingOwnPhoneAndRejectsOtherContactsPhone() {
        EmergencyContact c1 = buildContact(1, 1, "Priya Nair", "9876543210", Relation.PARENT);
        EmergencyContact c2 = buildContact(2, 1, "Rohan Verma", "8123456789", Relation.SIBLING);
        when(contactDao.findByIdAndUserId(1, 1)).thenReturn(Optional.of(c1));
        when(contactDao.findAllByUserId(1)).thenReturn(List.of(c1, c2));
        when(contactDao.update(any(EmergencyContact.class))).thenAnswer(inv -> inv.getArgument(0));

        EmergencyContact updated = contactService.updateContact(
                1, 1, new ContactRequest("Priya Sharma", "9876543210", "PARENT"));
        assertEquals("Priya Sharma", updated.getName());
        assertEquals("9876543210", updated.getPhone());

        DuplicateResourceException ex = assertThrows(
                DuplicateResourceException.class,
                () -> contactService.updateContact(1, 1, new ContactRequest("Priya Sharma", "8123456789", "PARENT")));
        assertEquals("DUPLICATE_CONTACT", ex.getCode());
    }

    @Test
    void updateAndDeleteThrow404WhenNotOwnedByUser() {
        when(contactDao.findByIdAndUserId(99, 1)).thenReturn(Optional.empty());
        assertThrows(
                ResourceNotFoundException.class,
                () -> contactService.updateContact(1, 99, new ContactRequest("Test", "9876543210", "OTHER")));

        when(contactDao.deleteByIdAndUserId(99, 1)).thenReturn(false);
        assertThrows(
                ResourceNotFoundException.class,
                () -> contactService.deleteContact(1, 99));
    }

    @Test
    void listContactsFiltersCaseInsensitivelyByNameOrPhone() {
        EmergencyContact c1 = buildContact(1, 1, "Priya Nair", "9876543210", Relation.PARENT);
        EmergencyContact c2 = buildContact(2, 1, "Dr. Mehta", "8123456789", Relation.DOCTOR);
        when(contactDao.findAllByUserId(1)).thenReturn(List.of(c1, c2));

        assertEquals(2, contactService.listContacts(1, null).size());
        assertEquals(2, contactService.listContacts(1, "   ").size());

        List<EmergencyContact> byName = contactService.listContacts(1, "priya");
        assertEquals(1, byName.size());
        assertEquals("Priya Nair", byName.get(0).getName());

        List<EmergencyContact> byPhone = contactService.listContacts(1, "6789");
        assertEquals(1, byPhone.size());
        assertEquals("Dr. Mehta", byPhone.get(0).getName());
    }

    private EmergencyContact buildContact(int id, int userId, String name, String phone, Relation relation) {
        EmergencyContact c = new EmergencyContact();
        c.setId(id);
        c.setUserId(userId);
        c.setName(name);
        c.setPhone(phone);
        c.setRelation(relation);
        c.setCreatedAt(Instant.now());
        return c;
    }
}
