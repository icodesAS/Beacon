import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "neutral" | "success" | "warning" | "info" | "danger";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral:
    "bg-[var(--surface-raised)] text-[var(--text-muted)] border-[var(--border)]",
  success: "bg-[#22C55E1A] text-[var(--success)] border-[#22C55E40]",
  warning: "bg-[#F59E0B1A] text-[var(--warning)] border-[#F59E0B40]",
  info: "bg-[#3B82F61A] text-[var(--info)] border-[#3B82F640]",
  danger: "bg-[#EF44441A] text-[var(--sos)] border-[#EF444440]",
};

export function Badge({
  className,
  variant = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
