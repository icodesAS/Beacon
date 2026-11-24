"use client";

import {
  AlertCircle,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ContactFormDialog } from "@/components/contact-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useContacts, useDeleteContact } from "@/hooks/use-contacts";
import { ApiError } from "@/lib/api";
import {
  formatIndianPhone,
  getInitials,
  type Contact,
} from "@/types/contact";

const MAX_CONTACTS = 10;

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);

  const trimmedSearch = search.trim();
  const allContactsQuery = useContacts("");
  const filteredContactsQuery = useContacts(trimmedSearch);
  const deleteContact = useDeleteContact();

  const activeQuery = trimmedSearch ? filteredContactsQuery : allContactsQuery;
  const contacts = activeQuery.data ?? [];
  const totalCount = allContactsQuery.data?.length ?? 0;
  const isAtLimit = totalCount >= MAX_CONTACTS;

  const openAddDialog = () => {
    setEditingContact(null);
    setFormOpen(true);
  };

  const openEditDialog = (contact: Contact) => {
    setEditingContact(contact);
    setFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingContact) {
      return;
    }
    try {
      await deleteContact.mutateAsync(deletingContact.id);
      toast.success(`Removed ${deletingContact.name}.`);
      setDeletingContact(null);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Could not delete contact. Please try again.";
      toast.error(message);
    }
  };

  return (
    <AppShell title="Emergency Contacts">
      <div className="space-y-6">
        {/* Header & Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-semibold tracking-tight">
                Saved Contacts
              </h2>
              <Badge variant={isAtLimit ? "warning" : "neutral"}>
                {totalCount} of {MAX_CONTACTS}
              </Badge>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              People notified when you trigger an SOS alert.
            </p>
          </div>

          <Button
            type="button"
            onClick={openAddDialog}
            disabled={isAtLimit}
            className="min-h-[44px] bg-[var(--info)] text-white border-transparent hover:opacity-90 sm:min-h-0"
            title={
              isAtLimit
                ? "Maximum of 10 emergency contacts reached"
                : "Add emergency contact"
            }
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Add Contact</span>
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone number..."
            aria-label="Search emergency contacts"
            className="pl-9 pr-11"
          />
          {search.length > 0 && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-[6px] text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--info)]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Loading State */}
        {activeQuery.isLoading && (
          <div className="space-y-3" aria-busy="true" aria-label="Loading contacts">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-20 animate-pulse rounded-[12px] border border-[var(--border)] bg-[var(--surface)]"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {!activeQuery.isLoading && activeQuery.isError && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EF44441A] text-[var(--sos)]">
                <AlertCircle className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">Could not load emergency contacts</p>
                <p className="text-sm text-[var(--text-muted)]">
                  {activeQuery.error instanceof ApiError
                    ? activeQuery.error.message
                    : "Please check your connection and try again."}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => void activeQuery.refetch()}
                className="min-h-[44px] sm:min-h-0"
              >
                Try again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State: No Contacts Saved */}
        {!activeQuery.isLoading &&
          !activeQuery.isError &&
          contacts.length === 0 &&
          !trimmedSearch && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-raised)] text-[var(--text-muted)] border border-[var(--border)]">
                  <Users className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold">No emergency contacts yet</p>
                  <p className="max-w-sm text-sm text-[var(--text-muted)]">
                    Add up to 10 trusted contacts who should be alerted during an
                    emergency.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={openAddDialog}
                  className="min-h-[44px] bg-[var(--info)] text-white border-transparent hover:opacity-90 sm:min-h-0"
                >
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  <span>Add Your First Contact</span>
                </Button>
              </CardContent>
            </Card>
          )}

        {/* Empty State: Search No Matches */}
        {!activeQuery.isLoading &&
          !activeQuery.isError &&
          contacts.length === 0 &&
          trimmedSearch.length > 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                <p className="font-medium">No matching contacts</p>
                <p className="text-sm text-[var(--text-muted)]">
                  No contacts matched &ldquo;{trimmedSearch}&rdquo;.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSearch("")}
                  className="min-h-[44px] sm:min-h-0"
                >
                  Clear search
                </Button>
              </CardContent>
            </Card>
          )}

        {/* Contacts List: Desktop Table + Mobile Cards */}
        {!activeQuery.isLoading &&
          !activeQuery.isError &&
          contacts.length > 0 && (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--surface)] md:block">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--surface-raised)] text-xs uppercase tracking-wider text-[var(--text-muted)]">
                      <th className="px-4 py-3 font-medium">Contact</th>
                      <th className="px-4 py-3 font-medium">Phone</th>
                      <th className="px-4 py-3 font-medium">Relation</th>
                      <th className="px-4 py-3 text-right font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {contacts.map((contact) => (
                      <tr
                        key={contact.id}
                        className="transition-colors hover:bg-[var(--surface-raised)]/50"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-raised)] text-xs font-semibold">
                              {getInitials(contact.name)}
                            </div>
                            <span className="font-medium">{contact.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs text-[var(--text-muted)]">
                          {formatIndianPhone(contact.phone)}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant="info">{contact.relationLabel}</Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(contact)}
                              aria-label={`Edit ${contact.name}`}
                            >
                              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Edit</span>
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setDeletingContact(contact)}
                              aria-label={`Delete ${contact.name}`}
                              className="text-[var(--sos)] hover:bg-[#EF44441A] hover:border-[#EF444440]"
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards (360px+) */}
              <div className="space-y-3 md:hidden">
                {contacts.map((contact) => (
                  <Card key={contact.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-raised)] text-xs font-semibold">
                            {getInitials(contact.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {contact.name}
                            </p>
                            <p className="mt-0.5 flex items-center gap-1.5 font-mono text-xs text-[var(--text-muted)]">
                              <Phone className="h-3 w-3 shrink-0" aria-hidden="true" />
                              <span>{formatIndianPhone(contact.phone)}</span>
                            </p>
                          </div>
                        </div>
                        <Badge variant="info" className="shrink-0">
                          {contact.relationLabel}
                        </Badge>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => openEditDialog(contact)}
                          className="min-h-[44px] flex-1"
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setDeletingContact(contact)}
                          className="min-h-[44px] flex-1 text-[var(--sos)] hover:bg-[#EF44441A] hover:border-[#EF444440]"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                          <span>Delete</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
      </div>

      <ContactFormDialog
        open={formOpen}
        contact={editingContact}
        onClose={() => {
          setFormOpen(false);
          setEditingContact(null);
        }}
      />

      <ConfirmDialog
        open={deletingContact !== null}
        title="Delete emergency contact?"
        description={
          deletingContact
            ? `${deletingContact.name} (${formatIndianPhone(deletingContact.phone)}) will no longer receive SOS alerts.`
            : ""
        }
        confirmLabel="Delete Contact"
        variant="danger"
        isLoading={deleteContact.isPending}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setDeletingContact(null)}
      />
    </AppShell>
  );
}
