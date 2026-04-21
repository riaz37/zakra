import { StatusDot } from "@/components/admin/status-dot";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

const TYPE_MAP = {
  super_admin: {
    bg: "bg-[var(--primary-soft)]",
    fg: "text-[var(--primary)]",
    label: "Super admin",
  },
  admin: {
    bg: "bg-[var(--primary-soft)]",
    fg: "text-[var(--primary)]",
    label: "Admin",
  },
  regular: {
    bg: "bg-[var(--surface-muted)]",
    fg: "text-[var(--fg-muted)]",
    label: "Member",
  },
} as const;

export function UserTypeBadge({ type }: { type: User["user_type"] }) {
  const v = TYPE_MAP[type];
  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center rounded-[var(--radius-badge)] px-2 text-[12px] font-medium",
        v.bg,
        v.fg,
      )}
    >
      {v.label}
    </span>
  );
}

const STATUS_DOT_MAP = {
  active: "live",
  inactive: "idle",
  suspended: "failed",
  pending: "idle",
} as const;

export function StatusLabel({ status }: { status: User["status"] }) {
  return (
    <div className="inline-flex items-center gap-2">
      <StatusDot status={STATUS_DOT_MAP[status]} />
      <span className="text-[13px] capitalize text-[var(--fg)]">{status}</span>
    </div>
  );
}
