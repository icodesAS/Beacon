"use client";

import { AppShell } from "@/components/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HistoryPage() {
  return (
    <AppShell title="Alert History">
      <Card>
        <CardHeader>
          <CardTitle>Alert History</CardTitle>
          <CardDescription>
            Alert filtering, sorting, pagination, and incident details will be
            built in Phase 4.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-[var(--text-muted)]">
          Navigation and route protection are active.
        </CardContent>
      </Card>
    </AppShell>
  );
}
