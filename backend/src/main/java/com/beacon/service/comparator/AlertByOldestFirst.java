package com.beacon.service.comparator;

import com.beacon.model.Alert;
import java.time.Instant;
import java.util.Comparator;

/**
 * Sorts alerts oldest-first by createdAt ascending, tie-breaking by id ascending.
 * Implements 03-java-concepts-map: Comparator sorting.
 */
public class AlertByOldestFirst implements Comparator<Alert> {

    @Override
    public int compare(Alert a, Alert b) {
        Instant left = a.getCreatedAt();
        Instant right = b.getCreatedAt();
        if (left != null && right != null) {
            int dateCmp = left.compareTo(right);
            if (dateCmp != 0) {
                return dateCmp;
            }
        } else if (left == null && right != null) {
            return 1;
        } else if (left != null) {
            return -1;
        }
        int leftId = a.getId() != null ? a.getId() : 0;
        int rightId = b.getId() != null ? b.getId() : 0;
        return Integer.compare(leftId, rightId);
    }
}
