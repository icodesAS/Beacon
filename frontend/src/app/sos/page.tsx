"use client";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SosPage() {
  return (
    <AppShell title="Send SOS">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Send SOS</CardTitle>
            <Badge variant="neutral">Simulation only</Badge>
          </div>
          <CardDescription>
            The guided SOS flow, category cards, templates, and 10-second
            countdown will be built in Phase 3.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-[var(--text-muted)]">
          Navigation and route protection are active.
        </CardContent>
      </Card>
    </AppShell>
  );
}
