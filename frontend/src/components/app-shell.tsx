"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Clock,
  LayoutDashboard,
  LogOut,
  Moon,
  ShieldAlert,
  Siren,
  Sun,
  Users,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppShellProps {
  title: string;
  children: ReactNode;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sos", label: "Send SOS", icon: Siren, isSos: true },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/history", label: "History", icon: Clock },
];

export function AppShell({ title, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[var(--bg)] p-6">
        <div className="mx-auto max-w-[1100px] space-y-6" aria-busy="true">
          <div className="h-12 w-48 animate-pulse rounded-[8px] bg-[var(--surface)]" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-36 animate-pulse rounded-[12px] bg-[var(--surface)]" />
            <div className="h-36 animate-pulse rounded-[12px] bg-[var(--surface)]" />
          </div>
        </div>
      </div>
    );
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-[var(--border)] md:bg-[var(--surface)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#EF44441A] text-[var(--sos)] border border-[#EF444440]">
              <ShieldAlert className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Beacon</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1.5 p-3" aria-label="Primary navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--info)]",
                  item.isSos
                    ? active
                      ? "bg-[var(--sos)] text-white"
                      : "text-[var(--sos)] hover:bg-[#EF44441A]"
                    : active
                      ? "bg-[var(--surface-raised)] text-[var(--text)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[var(--border)] p-4">
          <Badge variant="neutral" className="w-full justify-center">
            Simulation only
          </Badge>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-4 md:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/dashboard"
              className="flex md:hidden h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#EF44441A] text-[var(--sos)] border border-[#EF444440]"
              aria-label="Beacon Dashboard"
            >
              <ShieldAlert className="h-5 w-5" aria-hidden="true" />
            </Link>
            <h1 className="truncate text-lg font-semibold md:text-xl">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              className="h-11 w-11 p-0 md:h-9 md:w-9"
            >
              {mounted && theme === "light" ? (
                <Moon className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Sun className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>

            <div className="hidden sm:flex items-center gap-2 rounded-[8px] border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-1.5 text-sm">
              <span className="max-w-[140px] truncate font-medium">
                {user.fullName}
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void logout()}
              aria-label="Log out"
              className="h-11 px-3 md:h-9"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:pb-8">
          <div className="mx-auto w-full max-w-[1100px]">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 md:hidden"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          if (item.isSos) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label="Send SOS"
                className="flex h-12 w-12 -mt-4 items-center justify-center rounded-full bg-[var(--sos)] text-white shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--info)]"
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-[44px] min-w-[56px] flex-col items-center justify-center gap-0.5 rounded-[8px] px-2 text-[11px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--info)]",
                active ? "text-[var(--text)]" : "text-[var(--text-muted)]"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
