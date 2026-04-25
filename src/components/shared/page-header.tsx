import { Building2 } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: string;
  /**
   * Right-aligned slot, typically a primary action button. Caller styles it.
   *
   * Preferred primary action style:
   *   "rounded-lg bg-accent px-3.5 py-2 font-sans text-button font-medium
   *    text-[#111] hover:bg-accent/90"
   */
  action?: ReactNode;
  /** Scope pill shown next to the title, e.g. a company name. */
  scopeLabel?: string;
  /** Optional subtitle shown under the title. */
  subtitle?: string;
  className?: string;
}

/**
 * Canonical page header — renders the single `<h1>` for the route.
 *
 * Precise 22px title, tight tracking, bottom border separator so the header
 * reads as a true section boundary in the dark surface system.
 */
export function PageHeader({
  title,
  action,
  scopeLabel,
  subtitle,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col items-start gap-3 border-b border-border pb-5",
        "sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <h1 className="font-sans text-[22px] font-normal leading-[1.3] tracking-[-0.02em] text-foreground">
          {title}
          {scopeLabel ? (
            <span
              className="ml-3 inline-flex items-center gap-1 rounded-full bg-surface-300 px-2 py-0.5 align-middle font-sans text-[11px] font-medium text-muted-strong"
              aria-label={`Scope: ${scopeLabel}`}
            >
              <Building2 aria-hidden="true" className="size-3" />
              {scopeLabel}
            </span>
          ) : null}
        </h1>
        {subtitle ? (
          <p className="font-sans text-caption text-muted">{subtitle}</p>
        ) : null}
      </div>

      {action ? (
        <div className="flex shrink-0 items-center gap-2">{action}</div>
      ) : null}
    </div>
  );
}
