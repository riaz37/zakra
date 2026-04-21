import { StatusDot } from "@/components/admin/status-dot";
import { cn } from "@/lib/utils";
import type { Company } from "@/types";

const MAP = {
  active: {
    dot: "live",
    bg: "bg-[var(--primary-soft)]",
    fg: "text-[var(--primary)]",
    label: "Active",
  },
  inactive: {
    dot: "idle",
    bg: "bg-[var(--surface-muted)]",
    fg: "text-[var(--fg-muted)]",
    label: "Inactive",
  },
  suspended: {
    dot: "failed",
    bg: "bg-[var(--destructive-soft)]",
    fg: "text-[var(--destructive)]",
    label: "Suspended",
  },
} as const;

interface StatusBadgeProps {
  status: Company["status"];
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const v = MAP[status];
  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center gap-1.5 rounded-[var(--radius-badge)] px-2 text-[12px] font-medium",
        v.bg,
        v.fg,
      )}
    >
      <StatusDot status={v.dot} />
      {v.label}
    </span>
  );
}
