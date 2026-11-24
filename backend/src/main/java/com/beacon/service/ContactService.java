package com.beacon.service;

import com.beacon.dao.ContactDao;
import com.beacon.dto.ContactRequest;
import com.beacon.exception.BusinessRuleException;
import com.beacon.exception.DuplicateResourceException;
import com.beacon.exception.ResourceNotFoundException;
import com.beacon.model.EmergencyContact;
import com.beacon.model.Relation;
import com.beacon.util.InputValidator;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.function.Predicate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

/**
 * Business logic for managing a user's emergency contacts.
 */
@Service
public class ContactService {

    public static final int MAX_CONTACTS = 10;

    private final ContactDao contactDao;

    public ContactService(ContactDao contactDao) {
        this.contactDao = contactDao;
    }

    public List<EmergencyContact> listContacts(int userId, String search) {
        List<EmergencyContact> contacts = contactDao.findAllByUserId(userId);
        if (search == null || search.isBlank()) {
            return contacts;
        }

        String query = search.trim().toLowerCase(Locale.ROOT);
        // Concept (03-java-concepts-map): Searching with Predicate and loop
        Predicate<EmergencyContact> matchesQuery = contact ->
                contact.getName().toLowerCase(Locale.ROOT).contains(query)
                        || contact.getPhone().toLowerCase(Locale.ROOT).contains(query);

        List<EmergencyContact> filtered = new ArrayList<>();
        for (EmergencyContact contact : contacts) {
            if (matchesQuery.test(contact)) {
                filtered.add(contact);
            }
        }
        return filtered;
    }

    public EmergencyContact addContact(int userId, ContactRequest request) {
        InputValidator.validateContact(request.name(), request.phone(), request.relation());

        List<EmergencyContact> existing = contactDao.findAllByUserId(userId);
        if (existing.size() >= MAX_CONTACTS) {
            throw new BusinessRuleException(
                    HttpStatus.CONFLICT,
                    "CONTACT_LIMIT_REACHED",
                    "You can save at most 10 emergency contacts.");
        }

        String normalizedPhone = request.phone().trim();
        // Concept (03-java-concepts-map): HashSet duplicate phone detection
        Set<String> existingPhones = new HashSet<>();
        for (EmergencyContact contact : existing) {
            existingPhones.add(contact.getPhone());
        }
        if (existingPhones.contains(normalizedPhone)) {
            throw new DuplicateResourceException(
                    "DUPLICATE_CONTACT",
                    "A contact with this phone number already exists.");
        }

        EmergencyContact contact = new EmergencyContact();
        contact.setUserId(userId);
        contact.setName(request.name().trim());
        contact.setPhone(normalizedPhone);
        contact.setRelation(Relation.fromString(request.relation()));
        return contactDao.create(contact);
    }

    public EmergencyContact updateContact(int userId, int contactId, ContactRequest request) {
        InputValidator.validateContact(request.name(), request.phone(), request.relation());

        EmergencyContact existing = contactDao.findByIdAndUserId(contactId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found."));

        String normalizedPhone = request.phone().trim();
        // Concept (03-java-concepts-map): HashSet duplicate phone detection
        Set<String> otherPhones = new HashSet<>();
        for (EmergencyContact contact : contactDao.findAllByUserId(userId)) {
            if (!contact.getId().equals(contactId)) {
                otherPhones.add(contact.getPhone());
            }
        }
        if (otherPhones.contains(normalizedPhone)) {
            throw new DuplicateResourceException(
                    "DUPLICATE_CONTACT",
                    "A contact with this phone number already exists.");
        }

        existing.setName(request.name().trim());
        existing.setPhone(normalizedPhone);
        existing.setRelation(Relation.fromString(request.relation()));
        return contactDao.update(existing);
    }

    public void deleteContact(int userId, int contactId) {
        boolean deleted = contactDao.deleteByIdAndUserId(contactId, userId);
        if (!deleted) {
            throw new ResourceNotFoundException("Contact not found.");
        }
    }
}
