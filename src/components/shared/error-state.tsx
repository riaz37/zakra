'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { scaleIn } from '@/lib/motion';

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
  const reduced = useReducedMotion();

  return (
    <motion.div
      variants={scaleIn}
      initial={reduced ? 'visible' : 'hidden'}
      animate="visible"
      className={cn(
        'flex flex-col items-start gap-3 rounded-lg border border-error-border bg-error-bg px-6 py-8',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-error"
        />
        <p className="font-sans text-micro uppercase tracking-widest text-error">
          Error
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="font-sans text-button font-medium text-foreground">
          {title}
        </p>
        <p className="max-w-[54ch] font-sans text-caption text-muted-strong leading-relaxed">
          {description}
        </p>
      </div>
      {onRetry ? (
        <div className="mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="border-error-border/30 bg-transparent hover:bg-error/5 hover:text-error transition-all"
          >
            Try again
          </Button>
        </div>
      ) : null}
    </motion.div>
  );
}
