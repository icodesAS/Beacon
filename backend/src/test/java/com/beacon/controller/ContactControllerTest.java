package com.beacon.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.beacon.model.EmergencyContact;
import com.beacon.model.Relation;
import com.beacon.security.SessionConstants;
import com.beacon.service.ContactService;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ContactController.class)
class ContactControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ContactService contactService;

    @Test
    void listWithoutSessionReturns401() throws Exception {
        mockMvc.perform(get("/api/contacts"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"));
    }

    @Test
    void listWithSessionReturns200() throws Exception {
        EmergencyContact c = buildContact(1, 7, "Priya Nair", "9876543210", Relation.PARENT);
        when(contactService.listContacts(7, null)).thenReturn(List.of(c));

        MockHttpSession session = sessionFor(7);

        mockMvc.perform(get("/api/contacts").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Priya Nair"))
                .andExpect(jsonPath("$[0].relationLabel").value("Parent"));
    }

    @Test
    void createWithSessionReturns201() throws Exception {
        EmergencyContact c = buildContact(5, 7, "Rohan Verma", "8123456789", Relation.SIBLING);
        when(contactService.addContact(eq(7), any())).thenReturn(c);

        MockHttpSession session = sessionFor(7);

        mockMvc.perform(post("/api/contacts")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Rohan Verma\",\"phone\":\"8123456789\",\"relation\":\"SIBLING\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(5))
                .andExpect(jsonPath("$.relation").value("SIBLING"));
    }

    @Test
    void updateWithSessionReturns200() throws Exception {
        EmergencyContact c = buildContact(5, 7, "Rohan V.", "8123456789", Relation.FRIEND);
        when(contactService.updateContact(eq(7), eq(5), any())).thenReturn(c);

        MockHttpSession session = sessionFor(7);

        mockMvc.perform(put("/api/contacts/5")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Rohan V.\",\"phone\":\"8123456789\",\"relation\":\"FRIEND\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Rohan V."))
                .andExpect(jsonPath("$.relationLabel").value("Friend"));
    }

    @Test
    void deleteWithSessionReturns204() throws Exception {
        doNothing().when(contactService).deleteContact(7, 5);

        MockHttpSession session = sessionFor(7);

        mockMvc.perform(delete("/api/contacts/5").session(session))
                .andExpect(status().isNoContent());
    }

    private MockHttpSession sessionFor(int userId) {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute(SessionConstants.USER_ID_ATTR, userId);
        return session;
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
