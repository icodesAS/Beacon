"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Contact, ContactPayload } from "@/types/contact";

export function useContacts(search = "") {
  const trimmed = search.trim();
  const path = trimmed
    ? `/api/contacts?search=${encodeURIComponent(trimmed)}`
    : "/api/contacts";

  return useQuery<Contact[]>({
    queryKey: ["contacts", trimmed],
    queryFn: () => apiFetch<Contact[]>(path),
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation<Contact, Error, ContactPayload>({
    mutationFn: (payload) =>
      apiFetch<Contact>("/api/contacts", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation<Contact, Error, { id: number; payload: ContactPayload }>({
    mutationFn: ({ id, payload }) =>
      apiFetch<Contact>(`/api/contacts/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) =>
      apiFetch<void>(`/api/contacts/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}
