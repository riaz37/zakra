import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  /**
   * Deprecated — retained for source compatibility only. The visual
   * icon-in-circle pattern has been removed per the dark-enterprise spec.
   * The icon is intentionally not rendered.
   */
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Typographic empty state for dark enterprise surfaces.
 *
 * - No icon, no circle. Heading does the work.
 * - Dashed border hints "container that could hold things".
 * - Left-aligned — asymmetric, feels designed, not template.
 */
export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-start gap-3 rounded-xl border border-dashed border-border px-8 py-20',
        className,
      )}
    >
      <h3 className="font-sans text-sub font-normal tracking-[-0.325px] text-foreground">
        {title}
      </h3>
      {description ? (
        <p className="max-w-[46ch] font-sans text-body text-muted">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
