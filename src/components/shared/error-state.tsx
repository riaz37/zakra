import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'There was a problem loading this data.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-start gap-3 rounded-xl border border-error-border bg-error-bg px-6 py-8',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-error"
        />
        <p className="font-sans text-micro uppercase tracking-[0.048px] text-error">
          Error
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="font-sans text-button font-medium text-foreground">
          {title}
        </p>
        <p className="max-w-[54ch] font-sans text-caption text-muted-strong">
          {description}
        </p>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 font-sans text-caption text-muted-strong underline-offset-4 transition-colors duration-150 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
