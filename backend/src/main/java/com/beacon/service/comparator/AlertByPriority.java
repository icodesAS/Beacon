package com.beacon.service.comparator;

import com.beacon.model.Alert;
import java.time.Instant;
import java.util.Comparator;

/**
 * Sorts alerts by priority ascending (1 = most urgent), tie-breaking newest-first then id descending.
 * Implements 03-java-concepts-map: Comparator sorting.
 */
public class AlertByPriority implements Comparator<Alert> {

    @Override
    public int compare(Alert a, Alert b) {
        int priorityCmp = Integer.compare(a.getPriority(), b.getPriority());
        if (priorityCmp != 0) {
            return priorityCmp;
        }
        Instant left = a.getCreatedAt();
        Instant right = b.getCreatedAt();
        if (left != null && right != null) {
            int dateCmp = right.compareTo(left);
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
        return Integer.compare(rightId, leftId);
    }
}
