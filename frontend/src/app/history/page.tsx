"use client";

import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  RefreshCw,
  Search,
  Siren,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAlerts } from "@/hooks/use-alerts";
import {
  CATEGORY_LIST,
  getCategoryMeta,
  getPriorityBadgeVariant,
  getStatusBadgeVariant,
  type AlertSortOption,
  type AlertStatus,
  type EmergencyCategory,
} from "@/types/alert";

const STATUS_OPTIONS: ReadonlyArray<{ value: AlertStatus; label: string }> = [
  { value: "CREATED", label: "Created" },
  { value: "SENT", label: "Sent" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CANCELLED", label: "Cancelled" },
];

const PAGE_SIZE = 10;

export default function HistoryPage() {
  const router = useRouter();
  const [category, setCategory] = useState<EmergencyCategory | "">("");
  const [status, setStatus] = useState<AlertStatus | "">("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<AlertSortOption>("newest");
  const [page, setPage] = useState(0);

  const hasFilters = Boolean(category || status || search.trim());

  const { data, isLoading, isError, error, refetch } = useAlerts({
    category,
    status,
    search,
    sort,
    page,
    size: PAGE_SIZE,
  });

  const clearFilters = () => {
    setCategory("");
    setStatus("");
    setSearch("");
    setSort("newest");
    setPage(0);
  };

  const items = data?.items ?? [];
  const totalItems = data?.totalItems ?? 0;
  const totalPages = data?.totalPages ?? 0;

  return (
    <AppShell title="Alert History">
      <div className="space-y-6">
        {/* Filter & Sort Bar */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Filter &amp; Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="history-search"
                  className="block text-xs font-medium text-[var(--text-muted)]"
                >
                  Search
                </label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
                    aria-hidden="true"
                  />
                  <input
                    id="history-search"
                    type="search"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(0);
                    }}
                    placeholder="Message or location..."
                    className="flex h-10 w-full rounded-[8px] border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--info)]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="history-category"
                  className="block text-xs font-medium text-[var(--text-muted)]"
                >
                  Category
                </label>
                <select
                  id="history-category"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value as EmergencyCategory | "");
                    setPage(0);
                  }}
                  className="flex h-10 w-full rounded-[8px] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--info)]"
                >
                  <option value="">All categories</option>
                  {CATEGORY_LIST.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="history-status"
                  className="block text-xs font-medium text-[var(--text-muted)]"
                >
                  Status
                </label>
                <select
                  id="history-status"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value as AlertStatus | "");
                    setPage(0);
                  }}
                  className="flex h-10 w-full rounded-[8px] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--info)]"
                >
                  <option value="">All statuses</option>
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="history-sort"
                  className="block text-xs font-medium text-[var(--text-muted)]"
                >
                  Sort by
                </label>
                <select
                  id="history-sort"
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value as AlertSortOption);
                    setPage(0);
                  }}
                  className="flex h-10 w-full rounded-[8px] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--info)]"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="priority">Priority (P1 first)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="space-y-3" aria-busy="true">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="h-20 animate-pulse rounded-[12px] border border-[var(--border)] bg-[var(--surface)]"
              />
            ))}
          </div>
        ) : isError ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <AlertTriangle
                className="h-8 w-8 text-[var(--warning)]"
                aria-hidden="true"
              />
              <div>
                <p className="font-medium">Could not load alert history</p>
                <p className="text-sm text-[var(--text-muted)]">
                  {error instanceof Error
                    ? error.message
                    : "An unexpected error occurred."}
                </p>
              </div>
              <Button variant="outline" onClick={() => void refetch()}>
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Try again
              </Button>
            </CardContent>
          </Card>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <Clock
                className="h-9 w-9 text-[var(--text-muted)]"
                aria-hidden="true"
              />
              {hasFilters ? (
                <>
                  <p className="font-medium">No alerts match your filters</p>
                  <p className="text-sm text-[var(--text-muted)]">
                    Try adjusting your search or filter criteria.
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                </>
              ) : (
                <>
                  <p className="font-medium">No alerts yet</p>
                  <p className="text-sm text-[var(--text-muted)]">
                    Simulated SOS alerts you send will appear here.
                  </p>
                  <Link href="/sos">
                    <Button variant="danger">
                      <Siren className="h-4 w-4" aria-hidden="true" />
                      Send SOS
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Desktop Table */}
            <Card className="hidden md:block overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[var(--border)] bg-[var(--surface-raised)] text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                    <tr>
                      <th className="px-4 py-3">Date &amp; Time</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {items.map((alert) => {
                      const catMeta = getCategoryMeta(alert.category);
                      return (
                        <tr
                          key={alert.id}
                          onClick={() => router.push(`/history/${alert.id}`)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              router.push(`/history/${alert.id}`);
                            }
                          }}
                          tabIndex={0}
                          className="cursor-pointer transition-colors hover:bg-[var(--surface-raised)] focus-visible:bg-[var(--surface-raised)] focus-visible:outline-none"
                        >
                          <td className="whitespace-nowrap px-4 py-3 text-[var(--text-muted)]">
                            {new Date(alert.createdAt).toLocaleString()}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <Badge variant={catMeta.badgeVariant}>
                              {alert.categoryLabel}
                            </Badge>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <Badge variant={getPriorityBadgeVariant(alert.priority)}>
                              P{alert.priority}
                            </Badge>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <Badge
                              variant={getStatusBadgeVariant(alert.status)}
                              className={
                                alert.status === "CANCELLED" ? "line-through" : ""
                              }
                            >
                              {alert.status}
                            </Badge>
                          </td>
                          <td className="max-w-xs truncate px-4 py-3">
                            {alert.message}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Mobile Cards (360px friendly) */}
            <div className="space-y-3 md:hidden">
              {items.map((alert) => {
                const catMeta = getCategoryMeta(alert.category);
                return (
                  <Link
                    key={alert.id}
                    href={`/history/${alert.id}`}
                    className="block rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:bg-[var(--surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--info)]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant={catMeta.badgeVariant}>
                          {alert.categoryLabel}
                        </Badge>
                        <Badge variant={getPriorityBadgeVariant(alert.priority)}>
                          P{alert.priority}
                        </Badge>
                      </div>
                      <Badge
                        variant={getStatusBadgeVariant(alert.status)}
                        className={
                          alert.status === "CANCELLED" ? "line-through" : ""
                        }
                      >
                        {alert.status}
                      </Badge>
                    </div>
                    <p className="mt-2.5 line-clamp-2 text-sm text-[var(--text)]">
                      {alert.message}
                    </p>
                    <p className="mt-2 text-xs text-[var(--text-muted)]">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <p className="text-sm text-[var(--text-muted)]">
                Page {page + 1} of {Math.max(1, totalPages)} ({totalItems}{" "}
                {totalItems === 1 ? "alert" : "alerts"})
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="min-h-[40px]"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="min-h-[40px]"
                >
                  Next
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
