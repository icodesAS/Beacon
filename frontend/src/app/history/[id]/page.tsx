"use client";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
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
import { useAlert, useUpdateAlertStatus } from "@/hooks/use-alerts";
import {
  getCategoryMeta,
  getPriorityBadgeVariant,
  getStatusBadgeVariant,
  type AlertStatus,
} from "@/types/alert";
import { formatIndianPhone } from "@/types/contact";

export default function AlertDetailPage() {
  const params = useParams<{ id: string }>();
  const parsedId = Number(params.id);
  const validId = Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;

  const { data: alert, isLoading, isError, error, refetch } = useAlert(validId);
  const updateStatus = useUpdateAlertStatus();

  const [pendingAction, setPendingAction] = useState<Extract<
    AlertStatus,
    "RESOLVED" | "CANCELLED"
  > | null>(null);

  const handleConfirmAction = async () => {
    if (!alert || !pendingAction) {
      return;
    }
    try {
      await updateStatus.mutateAsync({ id: alert.id, status: pendingAction });
      toast.success(
        pendingAction === "RESOLVED"
          ? "Alert marked as resolved."
          : "Alert marked as false alarm."
      );
      setPendingAction(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update alert status."
      );
    }
  };

  if (validId === null) {
    return (
      <AppShell title="Alert Details">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertTriangle
              className="h-8 w-8 text-[var(--warning)]"
              aria-hidden="true"
            />
            <p className="font-medium">Invalid alert ID</p>
            <Link href="/history">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to history
              </Button>
            </Link>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell title="Alert Details">
      <div className="space-y-6">
        <div>
          <Link
            href="/history"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Alert History
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4" aria-busy="true">
            <div className="h-36 animate-pulse rounded-[12px] border border-[var(--border)] bg-[var(--surface)]" />
            <div className="h-48 animate-pulse rounded-[12px] border border-[var(--border)] bg-[var(--surface)]" />
          </div>
        ) : isError || !alert ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <AlertTriangle
                className="h-8 w-8 text-[var(--warning)]"
                aria-hidden="true"
              />
              <div>
                <p className="font-medium">Could not load alert</p>
                <p className="text-sm text-[var(--text-muted)]">
                  {error instanceof Error
                    ? error.message
                    : "The alert may not exist or you do not have access."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => void refetch()}>
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Try again
                </Button>
                <Link href="/history">
                  <Button variant="ghost">Back to history</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Header Card */}
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={getCategoryMeta(alert.category).badgeVariant}>
                      {alert.categoryLabel}
                    </Badge>
                    <Badge variant={getPriorityBadgeVariant(alert.priority)}>
                      P{alert.priority}
                    </Badge>
                    <Badge
                      variant={getStatusBadgeVariant(alert.status)}
                      className={
                        alert.status === "CANCELLED" ? "line-through" : ""
                      }
                    >
                      {alert.status}
                    </Badge>
                  </div>
                  <Badge variant="neutral">Simulation only</Badge>
                </div>
                <CardTitle className="pt-2 text-xl">
                  SOS Alert #{alert.id}
                </CardTitle>
                <CardDescription>
                  Created {new Date(alert.createdAt).toLocaleString()} · Last
                  updated {new Date(alert.updatedAt).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface-raised)] p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                    Message
                  </p>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text)]">
                    {alert.message}
                  </p>
                </div>

                {alert.locationText && (
                  <div className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                    <MapPin
                      className="mt-0.5 h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{alert.locationText}</span>
                  </div>
                )}

                {alert.status === "SENT" && (
                  <div className="flex flex-wrap gap-3 border-t border-[var(--border)] pt-4">
                    <Button
                      type="button"
                      variant="default"
                      onClick={() => setPendingAction("RESOLVED")}
                      className="min-h-[44px]"
                    >
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      Mark as resolved
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPendingAction("CANCELLED")}
                      className="min-h-[44px]"
                    >
                      <XCircle className="h-4 w-4" aria-hidden="true" />
                      Mark as false alarm
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                  <li className="flex items-center gap-2 text-sm">
                    <Clock
                      className="h-4 w-4 text-[var(--info)]"
                      aria-hidden="true"
                    />
                    <span className="font-medium">Created</span>
                  </li>
                  <li
                    className="hidden h-px flex-1 bg-[var(--border)] sm:block"
                    aria-hidden="true"
                  />
                  <li className="flex items-center gap-2 text-sm">
                    <ShieldCheck
                      className={`h-4 w-4 ${
                        alert.status === "CREATED"
                          ? "text-[var(--text-muted)]"
                          : "text-[var(--info)]"
                      }`}
                      aria-hidden="true"
                    />
                    <span
                      className={
                        alert.status === "CREATED"
                          ? "text-[var(--text-muted)]"
                          : "font-medium"
                      }
                    >
                      Sent
                    </span>
                  </li>
                  <li
                    className="hidden h-px flex-1 bg-[var(--border)] sm:block"
                    aria-hidden="true"
                  />
                  <li className="flex items-center gap-2 text-sm">
                    {alert.status === "CANCELLED" ? (
                      <>
                        <XCircle
                          className="h-4 w-4 text-[var(--text-muted)]"
                          aria-hidden="true"
                        />
                        <span className="font-medium line-through text-[var(--text-muted)]">
                          Cancelled
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2
                          className={`h-4 w-4 ${
                            alert.status === "RESOLVED"
                              ? "text-[var(--success)]"
                              : "text-[var(--text-muted)]"
                          }`}
                          aria-hidden="true"
                        />
                        <span
                          className={
                            alert.status === "RESOLVED"
                              ? "font-medium text-[var(--success)]"
                              : "text-[var(--text-muted)]"
                          }
                        >
                          Resolved
                        </span>
                      </>
                    )}
                  </li>
                </ol>
              </CardContent>
            </Card>

            {/* Notified Contacts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notified contacts</CardTitle>
                <CardDescription>
                  Simulated recipient snapshots recorded when this alert was
                  dispatched.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {alert.recipients.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)]">
                    No recipients recorded for this alert.
                  </p>
                ) : (
                  <ul className="divide-y divide-[var(--border)]">
                    {alert.recipients.map((recipient) => (
                      <li
                        key={recipient.id}
                        className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">
                              {recipient.contactName}
                            </span>
                            <Badge variant="neutral">
                              {recipient.contactRelationLabel}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
                            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{formatIndianPhone(recipient.contactPhone)}</span>
                          </div>
                        </div>
                        <span className="text-xs text-[var(--text-muted)]">
                          Notified{" "}
                          {new Date(recipient.notifiedAt).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={pendingAction !== null}
        title={
          pendingAction === "RESOLVED"
            ? "Mark alert as resolved?"
            : "Mark alert as false alarm?"
        }
        description={
          pendingAction === "RESOLVED"
            ? "This will update the alert status to RESOLVED. You cannot undo this change."
            : "This will cancel the alert and mark it as a false alarm. You cannot undo this change."
        }
        confirmLabel={
          pendingAction === "RESOLVED"
            ? "Mark as resolved"
            : "Mark as false alarm"
        }
        variant={pendingAction === "CANCELLED" ? "danger" : "default"}
        isLoading={updateStatus.isPending}
        onConfirm={() => void handleConfirmAction()}
        onCancel={() => setPendingAction(null)}
      />
    </AppShell>
  );
}
