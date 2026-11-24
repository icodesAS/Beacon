package com.beacon.controller;

import com.beacon.dto.ContactRequest;
import com.beacon.dto.ContactResponse;
import com.beacon.model.EmergencyContact;
import com.beacon.security.SessionConstants;
import com.beacon.service.ContactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for emergency contact CRUD operations.
 */
@RestController
@RequestMapping("/api/contacts")
@Tag(name = "Contacts", description = "Emergency contact management")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @GetMapping
    @Operation(summary = "List emergency contacts for the logged-in user")
    public ResponseEntity<List<ContactResponse>> listContacts(
            @RequestParam(required = false) String search,
            HttpServletRequest request) {
        int userId = getUserId(request);
        List<EmergencyContact> contacts = contactService.listContacts(userId, search);
        List<ContactResponse> response = new ArrayList<>(contacts.size());
        for (EmergencyContact contact : contacts) {
            response.add(ContactResponse.from(contact));
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Add a new emergency contact")
    public ResponseEntity<ContactResponse> addContact(
            @RequestBody ContactRequest body,
            HttpServletRequest request) {
        int userId = getUserId(request);
        EmergencyContact created = contactService.addContact(userId, body);
        return ResponseEntity.status(HttpStatus.CREATED).body(ContactResponse.from(created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing emergency contact")
    public ResponseEntity<ContactResponse> updateContact(
            @PathVariable int id,
            @RequestBody ContactRequest body,
            HttpServletRequest request) {
        int userId = getUserId(request);
        EmergencyContact updated = contactService.updateContact(userId, id, body);
        return ResponseEntity.ok(ContactResponse.from(updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an emergency contact")
    public ResponseEntity<Void> deleteContact(
            @PathVariable int id,
            HttpServletRequest request) {
        int userId = getUserId(request);
        contactService.deleteContact(userId, id);
        return ResponseEntity.noContent().build();
    }

    private int getUserId(HttpServletRequest request) {
        return (int) request.getSession(false).getAttribute(SessionConstants.USER_ID_ATTR);
    }
}
