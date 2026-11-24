package com.beacon.dao;

import com.beacon.model.EmergencyContact;
import java.util.List;
import java.util.Optional;

/**
 * Data access contract for emergency contacts. Every query is scoped to a userId.
 */
public interface ContactDao {

    List<EmergencyContact> findAllByUserId(int userId);

    Optional<EmergencyContact> findByIdAndUserId(int id, int userId);

    EmergencyContact create(EmergencyContact contact);

    EmergencyContact update(EmergencyContact contact);

    boolean deleteByIdAndUserId(int id, int userId);
}
