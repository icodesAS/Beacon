"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Car,
  Check,
  CheckCircle2,
  CloudLightning,
  Flame,
  HeartPulse,
  Loader2,
  Lock,
  MapPin,
  ShieldAlert,
  Siren,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateAlert } from "@/hooks/use-alerts";
import { useContacts } from "@/hooks/use-contacts";
import { ApiError } from "@/lib/api";
import { SOS_TEMPLATES } from "@/lib/templates";
import { sosMessageSchema } from "@/lib/validation";
import {
  CATEGORY_LIST,
  type Alert,
  type CategoryMeta,
  type EmergencyCategory,
} from "@/types/alert";
import { formatIndianPhone } from "@/types/contact";

type SosStep = "category" | "message" | "review" | "success";

const COUNTDOWN_SECONDS = 10;
const RING_RADIUS = 64;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function renderCategoryIcon(category: EmergencyCategory, className: string) {
  switch (category) {
    case "MEDICAL":
      return <HeartPulse className={className} aria-hidden="true" />;
    case "FIRE":
      return <Flame className={className} aria-hidden="true" />;
    case "ACCIDENT":
      return <Car className={className} aria-hidden="true" />;
    case "HARASSMENT":
      return <ShieldAlert className={className} aria-hidden="true" />;
    case "NATURAL_DISASTER":
      return <CloudLightning className={className} aria-hidden="true" />;
    case "THEFT":
      return <Lock className={className} aria-hidden="true" />;
    case "OTHER":
      return <AlertTriangle className={className} aria-hidden="true" />;
  }
}

export default function SosPage() {
  const { data: contacts = [], isLoading: contactsLoading } = useContacts();
  const createAlert = useCreateAlert();

  const [step, setStep] = useState<SosStep>("category");
  const [selectedCategory, setSelectedCategory] =
    useState<EmergencyCategory | null>(null);
  const [message, setMessage] = useState("");
  const [locationText, setLocationText] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    message?: string;
    locationText?: string;
  }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [sentAlert, setSentAlert] = useState<Alert | null>(null);

  const isSubmittingRef = useRef(false);

  const selectedMeta: CategoryMeta | undefined = CATEGORY_LIST.find(
    (c) => c.value === selectedCategory
  );

  const submitAlert = useCallback(
    async (force: boolean) => {
      if (!selectedCategory || isSubmittingRef.current) {
        return;
      }
      isSubmittingRef.current = true;
      setSubmitError(null);

      try {
        const created = await createAlert.mutateAsync({
          category: selectedCategory,
          message: message.trim(),
          locationText: locationText.trim() || undefined,
          force,
        });
        setDuplicateOpen(false);
        setSentAlert(created);
        setStep("success");
      } catch (err) {
        if (
          err instanceof ApiError &&
          err.status === 409 &&
          err.code === "DUPLICATE_RECENT_ALERT"
        ) {
          setDuplicateOpen(true);
        } else if (err instanceof ApiError) {
          setSubmitError(err.message);
        } else {
          setSubmitError("Failed to send SOS. Please try again.");
        }
      } finally {
        isSubmittingRef.current = false;
      }
    },
    [createAlert, locationText, message, selectedCategory]
  );

  const cancelCountdown = useCallback(() => {
    setIsCountingDown(false);
    setCountdown(COUNTDOWN_SECONDS);
  }, []);

  useEffect(() => {
    if (!isCountingDown) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        cancelCountdown();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cancelCountdown, isCountingDown]);

  useEffect(() => {
    if (!isCountingDown) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (countdown <= 1) {
        setIsCountingDown(false);
        setCountdown(COUNTDOWN_SECONDS);
        void submitAlert(false);
      } else {
        setCountdown((prev) => prev - 1);
      }
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdown, isCountingDown, submitAlert]);

  const handleSelectCategory = (category: EmergencyCategory) => {
    setSelectedCategory(category);
    setFieldErrors({});
    setSubmitError(null);
    setStep("message");
  };

  const handleGoToReview = () => {
    const parsed = sosMessageSchema.safeParse({
      message,
      locationText,
    });

    if (!parsed.success) {
      const nextErrors: { message?: string; locationText?: string } = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "message" && !nextErrors.message) {
          nextErrors.message = issue.message;
        }
        if (key === "locationText" && !nextErrors.locationText) {
          nextErrors.locationText = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setSubmitError(null);
    setStep("review");
  };

  const handleStartCountdown = () => {
    setSubmitError(null);
    setCountdown(COUNTDOWN_SECONDS);
    setIsCountingDown(true);
  };

  const handleReset = () => {
    setStep("category");
    setSelectedCategory(null);
    setMessage("");
    setLocationText("");
    setFieldErrors({});
    setSubmitError(null);
    setSentAlert(null);
    setDuplicateOpen(false);
  };

  const strokeDashoffset =
    RING_CIRCUMFERENCE * (1 - countdown / COUNTDOWN_SECONDS);

  return (
    <AppShell title="Send SOS">
      <div className="space-y-6">
        {/* Top Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-[var(--text-muted)]">
              Guided emergency alert flow with a 10-second cancel window.
            </p>
          </div>
          <Badge variant="neutral">Simulation only</Badge>
        </div>

        {/* Loading Contacts */}
        {contactsLoading && (
          <div className="space-y-4" aria-busy="true">
            <div className="h-28 animate-pulse rounded-[12px] bg-[var(--surface)]" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="h-28 animate-pulse rounded-[12px] bg-[var(--surface)]" />
              <div className="h-28 animate-pulse rounded-[12px] bg-[var(--surface)]" />
              <div className="h-28 animate-pulse rounded-[12px] bg-[var(--surface)]" />
            </div>
          </div>
        )}

        {/* Zero Contacts Blocker */}
        {!contactsLoading && contacts.length === 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#EF44441A] text-[var(--sos)] border border-[#EF444440]">
                  <Users className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <CardTitle>Add a contact to enable SOS</CardTitle>
                  <CardDescription>
                    You need at least one saved emergency contact before you can
                    send a simulated SOS alert.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link
                href="/contacts"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] bg-[var(--sos)] px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--info)]"
              >
                <Users className="h-4 w-4" aria-hidden="true" />
                <span>Go to Contacts</span>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Main SOS Wizard */}
        {!contactsLoading && contacts.length > 0 && (
          <>
            {/* Step Progress Indicator */}
            {step !== "success" && (
              <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
                <span
                  className={
                    step === "category"
                      ? "rounded-full bg-[var(--surface-raised)] px-3 py-1 text-[var(--text)] border border-[var(--border)]"
                      : "px-2 py-1"
                  }
                >
                  1. Category
                </span>
                <span aria-hidden="true">/</span>
                <span
                  className={
                    step === "message"
                      ? "rounded-full bg-[var(--surface-raised)] px-3 py-1 text-[var(--text)] border border-[var(--border)]"
                      : "px-2 py-1"
                  }
                >
                  2. Details
                </span>
                <span aria-hidden="true">/</span>
                <span
                  className={
                    step === "review"
                      ? "rounded-full bg-[var(--surface-raised)] px-3 py-1 text-[var(--text)] border border-[var(--border)]"
                      : "px-2 py-1"
                  }
                >
                  3. Review
                </span>
              </div>
            )}

            {/* Step 1: Category Selection */}
            {step === "category" && (
              <section aria-label="Select emergency category" className="space-y-4">
                <div>
                  <h2 className="text-base font-semibold">
                    What kind of emergency is this?
                  </h2>
                  <p className="text-sm text-[var(--text-muted)]">
                    Select a category to continue. High-priority emergencies are
                    listed first.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {CATEGORY_LIST.map((cat) => {
                    const isSelected = selectedCategory === cat.value;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => handleSelectCategory(cat.value)}
                        className={`flex min-h-[112px] flex-col justify-between rounded-[12px] border p-4 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--info)] ${
                          isSelected
                            ? "border-[var(--sos)] bg-[var(--surface-raised)]"
                            : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-raised)]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--surface-raised)]"
                            style={{ color: cat.accentColor }}
                          >
                            {renderCategoryIcon(cat.value, "h-5 w-5")}
                          </div>
                          <Badge variant={cat.badgeVariant}>
                            {cat.priorityLabel}
                          </Badge>
                        </div>
                        <div className="mt-3">
                          <div className="font-semibold text-[var(--text)]">
                            {cat.label}
                          </div>
                          <p className="mt-1 text-xs text-[var(--text-muted)] leading-relaxed">
                            {cat.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Step 2: Templates, Message & Location */}
            {step === "message" && selectedCategory && selectedMeta && (
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <Badge variant={selectedMeta.badgeVariant}>
                        {selectedMeta.priorityLabel}
                      </Badge>
                      <CardTitle>{selectedMeta.label}</CardTitle>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep("category")}
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                      <span>Change category</span>
                    </Button>
                  </div>
                  <CardDescription>
                    Tap a quick template or write your own message (5–300
                    characters).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Template Chips */}
                  <div className="space-y-2">
                    <Label>Quick templates</Label>
                    <div className="flex flex-wrap gap-2">
                      {SOS_TEMPLATES[selectedCategory].map((template) => (
                        <button
                          key={template}
                          type="button"
                          onClick={() => {
                            setMessage(template);
                            setFieldErrors((prev) => ({
                              ...prev,
                              message: undefined,
                            }));
                          }}
                          className="rounded-[8px] border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-left text-xs text-[var(--text)] transition-colors hover:border-[var(--info)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--info)]"
                        >
                          {template}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message Textarea */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sos-message">Emergency message</Label>
                      <span className="text-xs tabular-nums text-[var(--text-muted)]">
                        {message.length} / 300
                      </span>
                    </div>
                    <textarea
                      id="sos-message"
                      rows={4}
                      maxLength={300}
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (fieldErrors.message) {
                          setFieldErrors((prev) => ({
                            ...prev,
                            message: undefined,
                          }));
                        }
                      }}
                      placeholder="Describe what happened and how your contacts can help..."
                      className="w-full rounded-[8px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--info)]"
                    />
                    {fieldErrors.message && (
                      <p className="text-xs text-[var(--sos)]">
                        {fieldErrors.message}
                      </p>
                    )}
                  </div>

                  {/* Optional Location */}
                  <div className="space-y-2">
                    <Label htmlFor="sos-location">
                      Location (optional, max 100 characters)
                    </Label>
                    <div className="relative">
                      <MapPin
                        className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[var(--text-muted)]"
                        aria-hidden="true"
                      />
                      <Input
                        id="sos-location"
                        maxLength={100}
                        value={locationText}
                        onChange={(e) => {
                          setLocationText(e.target.value);
                          if (fieldErrors.locationText) {
                            setFieldErrors((prev) => ({
                              ...prev,
                              locationText: undefined,
                            }));
                          }
                        }}
                        placeholder="e.g. Hostel Block B, Room 204 or MG Road"
                        className="pl-9"
                      />
                    </div>
                    {fieldErrors.locationText && (
                      <p className="text-xs text-[var(--sos)]">
                        {fieldErrors.locationText}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep("category")}
                      className="min-h-[44px]"
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                      <span>Back</span>
                    </Button>
                    <Button
                      type="button"
                      onClick={handleGoToReview}
                      className="min-h-[44px]"
                    >
                      Review SOS
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Review & Send */}
            {step === "review" && selectedMeta && (
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle>Review your SOS alert</CardTitle>
                    <Badge variant={selectedMeta.badgeVariant}>
                      {selectedMeta.label} · {selectedMeta.priorityLabel}
                    </Badge>
                  </div>
                  <CardDescription>
                    Confirm the details below. Pressing Send SOS starts a
                    10-second countdown before dispatching.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface-raised)] p-4">
                    <div>
                      <div className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                        Message
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--text)]">
                        {message.trim()}
                      </p>
                    </div>
                    <div className="border-t border-[var(--border)] pt-3">
                      <div className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                        Location
                      </div>
                      <p className="mt-1 text-sm text-[var(--text)]">
                        {locationText.trim() || "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">
                      Contacts to notify ({contacts.length})
                    </div>
                    <ul className="divide-y divide-[var(--border)] rounded-[10px] border border-[var(--border)] bg-[var(--surface)]">
                      {contacts.map((contact) => (
                        <li
                          key={contact.id}
                          className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                        >
                          <div className="min-w-0">
                            <div className="truncate font-medium">
                              {contact.name}
                            </div>
                            <div className="text-xs text-[var(--text-muted)]">
                              {formatIndianPhone(contact.phone)}
                            </div>
                          </div>
                          <Badge variant="neutral">
                            {contact.relationLabel}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {submitError && (
                    <div
                      role="alert"
                      className="rounded-[8px] border border-[#EF444440] bg-[#EF44441A] px-4 py-3 text-sm text-[var(--sos)]"
                    >
                      {submitError}
                    </div>
                  )}

                  <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep("message")}
                      disabled={createAlert.isPending}
                      className="min-h-[44px]"
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                      <span>Back</span>
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="lg"
                      onClick={handleStartCountdown}
                      disabled={createAlert.isPending}
                      className="min-h-[48px]"
                    >
                      {createAlert.isPending ? (
                        <Loader2
                          className="h-4 w-4 animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <Siren className="h-4 w-4" aria-hidden="true" />
                      )}
                      <span>Send SOS</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Success Screen */}
            {step === "success" && sentAlert && (
              <Card>
                <CardHeader>
                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#22C55E40] bg-[#22C55E1A] text-[var(--success)] motion-safe:transition-transform">
                      <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
                    </div>
                    <CardTitle className="mt-4 text-xl">
                      SOS sent (simulated)
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Sent at{" "}
                      {new Date(sentAlert.createdAt).toLocaleString()}
                    </CardDescription>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant="neutral">Simulation only</Badge>
                      <Badge variant="success">
                        {sentAlert.categoryLabel} · P{sentAlert.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">
                      Notified contacts ({sentAlert.recipients.length})
                    </div>
                    <ul className="divide-y divide-[var(--border)] rounded-[10px] border border-[var(--border)] bg-[var(--surface)]">
                      {sentAlert.recipients.map((recipient, idx) => (
                        <li
                          key={`${recipient.id}-${idx}`}
                          className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#22C55E1A] text-[var(--success)]">
                              <Check className="h-3.5 w-3.5" aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                              <div className="truncate font-medium">
                                {recipient.contactName}
                              </div>
                              <div className="text-xs text-[var(--text-muted)]">
                                {formatIndianPhone(recipient.contactPhone)} ·{" "}
                                {recipient.contactRelationLabel}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-[var(--success)] font-medium">
                            Notified
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Link
                      href="/dashboard"
                      className="inline-flex h-11 items-center justify-center rounded-[8px] border border-[var(--border)] bg-[var(--surface-raised)] px-4 text-sm font-medium text-[var(--text)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--info)]"
                    >
                      Back to dashboard
                    </Link>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      className="h-11"
                    >
                      Send another
                    </Button>
                    <Link
                      href="/contacts"
                      className="inline-flex h-11 items-center justify-center rounded-[8px] border border-[var(--border)] bg-transparent px-4 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--info)]"
                    >
                      View contacts
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* 10-Second Countdown Overlay */}
      {isCountingDown && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="SOS countdown"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-6 text-white backdrop-blur-sm"
        >
          <Badge variant="danger" className="mb-6">
            Simulation only
          </Badge>

          <div className="relative flex h-40 w-40 items-center justify-center">
            <svg
              className="h-40 w-40 -rotate-90"
              viewBox="0 0 160 160"
              aria-hidden="true"
            >
              <circle
                cx="80"
                cy="80"
                r={RING_RADIUS}
                fill="none"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="10"
              />
              <circle
                cx="80"
                cy="80"
                r={RING_RADIUS}
                fill="none"
                stroke="#EF4444"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                className="motion-safe:transition-[stroke-dashoffset] motion-safe:duration-1000 motion-safe:ease-linear"
              />
            </svg>
            <span className="absolute text-4xl font-bold tabular-nums">
              {countdown}
            </span>
          </div>

          <p
            aria-live="polite"
            className="mt-6 text-center text-lg font-semibold"
          >
            Sending SOS in {countdown}...
          </p>
          <p className="mt-1 text-center text-sm text-white/70">
            Press Cancel or Escape to stop before it sends.
          </p>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={cancelCountdown}
            className="mt-8 min-h-[52px] min-w-[180px] border-white/30 bg-white/10 text-white hover:bg-white/20"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Duplicate Recent Alert Dialog */}
      <ConfirmDialog
        open={duplicateOpen}
        title="Similar alert sent recently"
        description="You sent a similar alert recently. Send again?"
        confirmLabel="Send anyway"
        cancelLabel="Go back"
        variant="danger"
        isLoading={createAlert.isPending}
        onConfirm={() => {
          void submitAlert(true);
        }}
        onCancel={() => {
          setDuplicateOpen(false);
        }}
      />
    </AppShell>
  );
}
