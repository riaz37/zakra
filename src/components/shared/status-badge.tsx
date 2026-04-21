import { cn } from "@/lib/utils";

export type StatusVariant = "active" | "inactive" | "suspended" | "pending";

export interface StatusBadgeProps {
  status: StatusVariant;
  /** Override the display text. Defaults to a capitalized status value. */
  label?: string;
  className?: string;
}

/**
 * Status-semantic color pairs.
 *
 * These hex values intentionally bypass the warm-cream design tokens:
 * they encode *status meaning* (healthy green, warning gold, error crimson)
 * rather than visual theming, so they must not change with light/dark mode.
 * The warm-shifted semantics (no cold blue, no neon) keep them on-brand.
 */
const VARIANT_CLASSES: Record<StatusVariant, string> = {
  // success tint — warm teal-green
  active: "bg-[rgba(31,138,101,0.1)] text-[#1a7855]",
  // neutral — quiet warm brown
  inactive: "bg-[rgba(38,37,30,0.06)] text-muted",
  // error tint — warm crimson rose
  suspended: "bg-[rgba(207,45,86,0.1)] text-error",
  // warning tint — warm gold
  pending: "bg-[rgba(192,133,50,0.1)] text-[#c08532]",
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
        "inline-flex items-center rounded-full px-2 py-0.5 font-sans text-[11px] font-medium leading-none",
        VARIANT_CLASSES[status],
        className,
      )}
    >
      {displayText}
    </span>
  );
}
