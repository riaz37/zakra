import { cn } from "@/lib/utils";

export type StatusVariant = "active" | "inactive" | "suspended" | "pending";

export interface StatusBadgeProps {
  status: StatusVariant;
  /** Override the display text. Defaults to a capitalized status value. */
  label?: string;
  className?: string;
}

/**
 * Status-semantic color pairs tuned for dark enterprise surfaces.
 *
 * Green / red / gold encode *status meaning* — they are independent of the
 * neutral surface scale and must not change with theme.
 */
const VARIANT_CLASSES: Record<StatusVariant, string> = {
  // success — Supabase green on translucent green
  active:
    "bg-[rgba(62,207,142,0.12)] text-accent border border-[rgba(62,207,142,0.2)]",
  // neutral — quiet surface, muted label
  inactive: "bg-surface-300 text-muted border border-border",
  // error — rose on translucent rose
  suspended:
    "bg-[rgba(229,72,77,0.12)] text-error border border-[rgba(229,72,77,0.2)]",
  // warning — amber on translucent amber
  pending:
    "bg-[rgba(229,165,10,0.12)] text-warning border border-[rgba(229,165,10,0.2)]",
};

function toDisplayText(status: StatusVariant): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const displayText = label ?? toDisplayText(status);

  return (
    <span
      aria-label={`Status: ${status}`}
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 font-sans text-caption font-medium leading-none",
        VARIANT_CLASSES[status],
        className,
      )}
    >
      {displayText}
    </span>
  );
}
