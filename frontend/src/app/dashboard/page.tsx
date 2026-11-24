"use client";

import { CheckCircle2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Welcome, {user?.fullName}
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              Your Beacon account is active and protected.
            </p>
          </div>
          <Badge variant="success">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            Session active
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-[var(--sos)]" aria-hidden="true" />
              Phase 1 Complete — Accounts &amp; App Shell
            </CardTitle>
            <CardDescription>
              Next: Phase 2 adds Emergency Contacts, Phase 3 adds the SOS flow
              and 10-second countdown, and Phase 4 adds History &amp; Analytics.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link href="/contacts">
              <Button variant="outline">Preview Contacts</Button>
            </Link>
            <Link href="/sos">
              <Button variant="danger">Preview Send SOS</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
