import { cn } from "@/lib/utils";

export type StatusVariant = "active" | "inactive" | "suspended" | "pending" | "completed" | "failed";

export interface StatusBadgeProps {
  status: string;
  /** Override the display text. Defaults to a capitalized status value. */
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

const VARIANT_CLASSES: Record<StatusVariant, string> = {
  active:    "bg-accent-bg text-accent border border-accent-border",
  completed: "bg-accent-bg text-accent border border-accent-border",
  inactive:  "bg-surface-300 text-muted border border-border",
  suspended: "bg-error-bg text-error border border-error-border",
  failed:    "bg-error-bg text-error border border-error-border",
  pending:   "bg-warning-bg text-warning border border-warning-border",
};

function toDisplayText(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function StatusBadge({ status, label, size = "md", className }: StatusBadgeProps) {
  const displayText = label ?? toDisplayText(status);

  return (
    <span
      aria-label={`Status: ${status}`}
      className={cn(
        "inline-flex items-center rounded-full font-sans font-medium leading-none",
        size === "sm" ? "px-1.5 py-0.5 text-micro" : "px-2 py-0.5 text-caption",
        (VARIANT_CLASSES as Record<string, string>)[status] ?? VARIANT_CLASSES.inactive,
        className,
      )}
    >
      {displayText}
    </span>
  );
}
