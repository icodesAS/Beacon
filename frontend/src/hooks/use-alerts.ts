"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type {
  Alert,
  AlertListParams,
  AlertStatus,
  CreateAlertPayload,
  PagedAlerts,
  StatsSummary,
} from "@/types/alert";

function buildAlertsQueryString(params: AlertListParams): string {
  const sp = new URLSearchParams();
  if (params.sort) {
    sp.set("sort", params.sort);
  }
  if (params.category) {
    sp.set("category", params.category);
  }
  if (params.status) {
    sp.set("status", params.status);
  }
  if (params.search && params.search.trim()) {
    sp.set("search", params.search.trim());
  }
  if (typeof params.page === "number") {
    sp.set("page", String(params.page));
  }
  if (typeof params.size === "number") {
    sp.set("size", String(params.size));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export function useAlerts(params: AlertListParams = {}) {
  return useQuery<PagedAlerts>({
    queryKey: ["alerts", params],
    queryFn: () => apiFetch<PagedAlerts>(`/api/alerts${buildAlertsQueryString(params)}`),
  });
}

export function useStatsSummary() {
  return useQuery<StatsSummary>({
    queryKey: ["stats", "summary"],
    queryFn: () => apiFetch<StatsSummary>("/api/stats/summary"),
  });
}

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
      void queryClient.invalidateQueries({ queryKey: ["stats"] });
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
      void queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}
