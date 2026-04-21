import { Building2 } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: string;
  /**
   * Right-aligned slot, typically a button or trigger. Caller styles it.
   *
   * Recommended action-button classes (matches DESIGN.md warm-crimson hover):
   *   "bg-surface-300 hover:text-error border border-border rounded-lg
   *    px-3.5 py-2 text-button text-foreground"
   */
  action?: ReactNode;
  /** Scope pill shown next to the title, e.g. a company name. */
  scopeLabel?: string;
  className?: string;
}

/**
 * Canonical page header — renders the single `<h1>` for the route.
 *
 * On mobile the title and action stack vertically so the action button keeps
 * its tap target. On >= sm the layout reflows to the designed side-by-side row.
 */
export function PageHeader({
  title,
  action,
  scopeLabel,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col items-start gap-3",
        "sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        className,
      )}
    >
      <h1 className="font-sans text-[22px] font-normal leading-[1.3] tracking-[-0.11px] text-foreground">
        {title}
        {scopeLabel ? (
          <span
            className="ml-3 inline-flex items-center gap-1 rounded-full bg-surface-300 px-2 py-0.5 align-middle font-sans text-[11px] font-medium text-muted"
            aria-label={`Scope: ${scopeLabel}`}
          >
            <Building2 aria-hidden="true" className="size-3" />
            {scopeLabel}
          </span>
        ) : null}
      </h1>

      {action ? (
        <div className="flex shrink-0 items-center gap-2">{action}</div>
      ) : null}
    </div>
  );
}
