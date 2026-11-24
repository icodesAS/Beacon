"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateContact, useUpdateContact } from "@/hooks/use-contacts";
import { ApiError } from "@/lib/api";
import { contactSchema, type ContactFormValues } from "@/lib/validation";
import { RELATION_OPTIONS, type Contact } from "@/types/contact";

interface ContactFormDialogProps {
  open: boolean;
  contact: Contact | null;
  onClose: () => void;
}

export function ContactFormDialog({
  open,
  contact,
  onClose,
}: ContactFormDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <ContactFormDialogInner
      key={contact?.id ?? "new"}
      contact={contact}
      onClose={onClose}
    />
  );
}

function ContactFormDialogInner({
  contact,
  onClose,
}: {
  contact: Contact | null;
  onClose: () => void;
}) {
  const isEditing = contact !== null;
  const titleId = useId();
  const nameId = useId();
  const phoneId = useId();
  const relationId = useId();

  const [formError, setFormError] = useState<string | null>(null);
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const isPending = createContact.isPending || updateContact.isPending;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: contact?.name ?? "",
      phone: contact?.phone ?? "",
      relation: contact?.relation ?? "PARENT",
    },
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPending) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPending, onClose]);

  const onSubmit = async (values: ContactFormValues) => {
    setFormError(null);
    try {
      if (isEditing) {
        await updateContact.mutateAsync({ id: contact.id, payload: values });
        toast.success("Contact updated.");
      } else {
        await createContact.mutateAsync(values);
        toast.success("Contact added.");
      }
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "DUPLICATE_CONTACT") {
          setError("phone", { message: err.message });
          return;
        }
        const entries = Object.entries(err.fieldErrors);
        if (entries.length > 0) {
          for (const [field, message] of entries) {
            if (field === "name" || field === "phone" || field === "relation") {
              setError(field, { message });
            }
          }
          return;
        }
        setFormError(err.message);
        return;
      }
      setFormError("Could not save contact. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]"
      onClick={() => {
        if (!isPending) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-6 text-[var(--text)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id={titleId} className="text-lg font-semibold">
            {isEditing ? "Edit Emergency Contact" : "Add Emergency Contact"}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isPending}
            aria-label="Close dialog"
            className="h-9 w-9 p-0 shrink-0"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4" noValidate>
          {formError && (
            <div
              role="alert"
              className="rounded-[8px] border border-[#EF444440] bg-[#EF44441A] px-3 py-2 text-sm text-[var(--sos)]"
            >
              {formError}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor={nameId}>Name</Label>
            <Input
              id={nameId}
              placeholder="e.g. Priya Nair"
              aria-invalid={Boolean(errors.name)}
              disabled={isPending}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-[var(--sos)]">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={phoneId}>Mobile Number</Label>
            <div className="flex items-center gap-2">
              <span className="flex h-11 items-center rounded-[8px] border border-[var(--border)] bg-[var(--surface-raised)] px-3 text-sm text-[var(--text-muted)]">
                +91
              </span>
              <Input
                id={phoneId}
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="9876543210"
                aria-invalid={Boolean(errors.phone)}
                disabled={isPending}
                {...register("phone")}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-[var(--sos)]">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={relationId}>Relation</Label>
            <select
              id={relationId}
              aria-invalid={Boolean(errors.relation)}
              disabled={isPending}
              className="flex h-11 w-full rounded-[8px] border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-sm text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--info)] disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-[var(--sos)]"
              {...register("relation")}
            >
              {RELATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.relation && (
              <p className="text-xs text-[var(--sos)]">
                {errors.relation.message}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="min-h-[44px] sm:min-h-0"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="min-h-[44px] bg-[var(--info)] text-white border-transparent hover:opacity-90 sm:min-h-0"
            >
              {isPending && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              <span>{isEditing ? "Save Changes" : "Add Contact"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
