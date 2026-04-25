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
  active:    "bg-accent-bg text-accent border border-accent-border",
  inactive:  "bg-surface-300 text-muted border border-border",
  suspended: "bg-error-bg text-error border border-error-border",
  pending:   "bg-warning-bg text-warning border border-warning-border",
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
