"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Alert, AlertStatus, CreateAlertPayload } from "@/types/alert";

export function useAlert(id: number | null) {
  return useQuery<Alert>({
    queryKey: ["alert", id],
    queryFn: () => apiFetch<Alert>(`/api/alerts/${id}`),
    enabled: id !== null,
  });
}

export function useCreateAlert() {
  const queryClient = useQueryClient();
  return useMutation<Alert, Error, CreateAlertPayload>({
    mutationFn: (payload) =>
      apiFetch<Alert>("/api/alerts", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: (created) => {
      queryClient.setQueryData(["alert", created.id], created);
      void queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

export function useUpdateAlertStatus() {
  const queryClient = useQueryClient();
  return useMutation<
    Alert,
    Error,
    { id: number; status: Extract<AlertStatus, "RESOLVED" | "CANCELLED"> }
  >({
    mutationFn: ({ id, status }) =>
      apiFetch<Alert>(`/api/alerts/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["alert", updated.id], updated);
      void queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}
