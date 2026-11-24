"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/auth-provider";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      router.replace(user ? "/dashboard" : "/login");
    }
  }, [isLoading, user, router]);

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4" aria-busy="true">
        <div className="h-10 w-40 mx-auto animate-pulse rounded-[8px] bg-[var(--surface)]" />
        <div className="h-48 w-full animate-pulse rounded-[12px] bg-[var(--surface)]" />
      </div>
    </main>
  );
}
