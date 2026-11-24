"use client";

import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  Calendar,
  Clock,
  RefreshCw,
  Siren,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
import { useAlerts, useStatsSummary } from "@/hooks/use-alerts";
import {
  formatRelativeTime,
  getCategoryMeta,
  getPriorityBadgeVariant,
  getStatusBadgeVariant,
  type AlertStatus,
  type EmergencyCategory,
} from "@/types/alert";

const CATEGORY_COLORS: Record<EmergencyCategory, string> = {
  MEDICAL: "#EF4444",
  FIRE: "#F97316",
  ACCIDENT: "#F59E0B",
  HARASSMENT: "#EAB308",
  NATURAL_DISASTER: "#8B5CF6",
  THEFT: "#3B82F6",
  OTHER: "#64748B",
};

const STATUS_COLORS: Record<AlertStatus, string> = {
  CREATED: "#64748B",
  SENT: "#3B82F6",
  RESOLVED: "#22C55E",
  CANCELLED: "#9CA3AF",
};

const emptySubscribe = () => () => {};

function useIsClient(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const isClient = useIsClient();
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    error: statsErrObj,
    refetch: refetchStats,
  } = useStatsSummary();

  const {
    data: recentData,
    isLoading: recentLoading,
  } = useAlerts({ sort: "newest", page: 0, size: 5 });

  const recentAlerts = recentData?.items ?? [];

  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">
        {/* Greeting */}
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Welcome back, {user?.fullName}
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Monitor your emergency readiness, contacts, and recent SOS activity.
          </p>
        </div>

        {/* Big SOS Card */}
        <Card className="border-[#EF444440] bg-[var(--surface)]">
          <CardContent className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Siren className="h-5 w-5 text-[var(--sos)]" aria-hidden="true" />
                <h3 className="text-lg font-semibold">Emergency SOS</h3>
                <Badge variant="neutral">Simulation only</Badge>
              </div>
              {!statsLoading && stats?.contactCount === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">
                  Add a contact to enable SOS notifications.
                </p>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">
                  Trigger a 10-second countdown to notify your saved emergency
                  contacts.
                </p>
              )}
            </div>

            {!statsLoading && stats?.contactCount === 0 ? (
              <Link href="/contacts" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  Add a contact to enable SOS
                </Button>
              </Link>
            ) : (
              <Link href="/sos" className="w-full sm:w-auto">
                <Button
                  variant="danger"
                  size="lg"
                  className="w-full sm:w-auto shadow-[0_0_24px_var(--sos-glow)] animate-pulse motion-reduce:animate-none"
                >
                  <Siren className="h-5 w-5" aria-hidden="true" />
                  Send SOS Now
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Stats Error */}
        {statsError ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <AlertTriangle
                className="h-8 w-8 text-[var(--warning)]"
                aria-hidden="true"
              />
              <div>
                <p className="font-medium">Could not load dashboard stats</p>
                <p className="text-sm text-[var(--text-muted)]">
                  {statsErrObj instanceof Error
                    ? statsErrObj.message
                    : "An unexpected error occurred."}
                </p>
              </div>
              <Button variant="outline" onClick={() => void refetchStats()}>
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Try again
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 4 Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {statsLoading || !stats ? (
                [0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className="h-28 animate-pulse rounded-[12px] border border-[var(--border)] bg-[var(--surface)]"
                    aria-busy="true"
                  />
                ))
              ) : (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardDescription>Total alerts</CardDescription>
                      <BellRing
                        className="h-4 w-4 text-[var(--text-muted)]"
                        aria-hidden="true"
                      />
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-semibold tabular-nums">
                        {stats.totalAlerts}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardDescription>This month</CardDescription>
                      <Calendar
                        className="h-4 w-4 text-[var(--text-muted)]"
                        aria-hidden="true"
                      />
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-semibold tabular-nums">
                        {stats.alertsThisMonth}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardDescription>Contacts</CardDescription>
                      <Users
                        className="h-4 w-4 text-[var(--text-muted)]"
                        aria-hidden="true"
                      />
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-semibold tabular-nums">
                        {stats.contactCount}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardDescription>Last alert</CardDescription>
                      <Clock
                        className="h-4 w-4 text-[var(--text-muted)]"
                        aria-hidden="true"
                      />
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-semibold">
                        {stats.lastAlert
                          ? formatRelativeTime(stats.lastAlert.createdAt)
                          : "None yet"}
                      </p>
                      {stats.lastAlert && (
                        <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
                          {stats.lastAlert.categoryLabel} · P
                          {stats.lastAlert.priority}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* 3 Charts */}
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Alerts by category */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Alerts by category</CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading || !stats ? (
                    <div className="h-60 animate-pulse rounded-[8px] bg-[var(--surface-raised)]" />
                  ) : stats.totalAlerts === 0 || stats.byCategory.length === 0 ? (
                    <div className="flex h-60 items-center justify-center text-center text-sm text-[var(--text-muted)]">
                      No alert data yet. Send an SOS to see category breakdown.
                    </div>
                  ) : (
                    <div className="h-60 w-full">
                      {isClient && (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={stats.byCategory}
                              dataKey="count"
                              nameKey="label"
                              innerRadius={48}
                              outerRadius={76}
                              paddingAngle={3}
                            >
                              {stats.byCategory.map((entry) => (
                                <Cell
                                  key={entry.category}
                                  fill={CATEGORY_COLORS[entry.category]}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Last 30 days */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Last 30 days</CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading || !stats ? (
                    <div className="h-60 animate-pulse rounded-[8px] bg-[var(--surface-raised)]" />
                  ) : stats.totalAlerts === 0 ? (
                    <div className="flex h-60 items-center justify-center text-center text-sm text-[var(--text-muted)]">
                      No alerts recorded in the last 30 days.
                    </div>
                  ) : (
                    <div className="h-60 w-full">
                      {isClient && (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={stats.last30Days}
                            margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="var(--border)"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="date"
                              tickFormatter={(val: string) => val.slice(5)}
                              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                              minTickGap={20}
                            />
                            <YAxis
                              allowDecimals={false}
                              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                            />
                            <Tooltip />
                            <Bar
                              dataKey="count"
                              name="Alerts"
                              fill="#EF4444"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Status breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Status breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading || !stats ? (
                    <div className="h-60 animate-pulse rounded-[8px] bg-[var(--surface-raised)]" />
                  ) : stats.totalAlerts === 0 || stats.byStatus.length === 0 ? (
                    <div className="flex h-60 items-center justify-center text-center text-sm text-[var(--text-muted)]">
                      No status data yet.
                    </div>
                  ) : (
                    <div className="h-60 w-full">
                      {isClient && (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={stats.byStatus}
                            layout="vertical"
                            margin={{ top: 8, right: 16, left: 16, bottom: 0 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="var(--border)"
                              horizontal={false}
                            />
                            <XAxis
                              type="number"
                              allowDecimals={false}
                              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                            />
                            <YAxis
                              type="category"
                              dataKey="status"
                              width={82}
                              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                            />
                            <Tooltip />
                            <Bar dataKey="count" name="Alerts" radius={[0, 4, 4, 0]}>
                              {stats.byStatus.map((entry) => (
                                <Cell
                                  key={entry.status}
                                  fill={STATUS_COLORS[entry.status]}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Recent Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Recent alerts</CardTitle>
              <CardDescription>Your latest 5 SOS alerts</CardDescription>
            </div>
            <Link
              href="/history"
              className="inline-flex items-center gap-1 text-sm font-medium text-[var(--info)] hover:underline"
            >
              View all
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentLoading ? (
              <div className="space-y-2.5" aria-busy="true">
                {[0, 1, 2].map((idx) => (
                  <div
                    key={idx}
                    className="h-14 animate-pulse rounded-[8px] bg-[var(--surface-raised)]"
                  />
                ))}
              </div>
            ) : recentAlerts.length === 0 ? (
              <p className="py-6 text-center text-sm text-[var(--text-muted)]">
                No alerts sent yet.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {recentAlerts.map((alert) => {
                  const catMeta = getCategoryMeta(alert.category);
                  return (
                    <li key={alert.id}>
                      <Link
                        href={`/history/${alert.id}`}
                        className="flex flex-wrap items-center justify-between gap-3 py-3 transition-colors hover:bg-[var(--surface-raised)] rounded-[8px] px-2 -mx-2"
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={catMeta.badgeVariant}>
                              {alert.categoryLabel}
                            </Badge>
                            <Badge
                              variant={getPriorityBadgeVariant(alert.priority)}
                            >
                              P{alert.priority}
                            </Badge>
                            <Badge
                              variant={getStatusBadgeVariant(alert.status)}
                              className={
                                alert.status === "CANCELLED"
                                  ? "line-through"
                                  : ""
                              }
                            >
                              {alert.status}
                            </Badge>
                          </div>
                          <p className="truncate text-sm text-[var(--text)]">
                            {alert.message}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs text-[var(--text-muted)]">
                          {formatRelativeTime(alert.createdAt)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
