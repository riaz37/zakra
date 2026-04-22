import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-lg border border-border bg-background px-6 py-16 text-center',
        className,
      )}
    >
      {Icon ? (
        <Icon aria-hidden size={28} strokeWidth={1.25} className="text-muted/60" />
      ) : null}
      <div className="flex flex-col gap-1.5">
        <p className="font-sans text-[15px] font-medium text-foreground">{title}</p>
        {description ? (
          <p className="max-w-sm font-serif text-[15px] text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
