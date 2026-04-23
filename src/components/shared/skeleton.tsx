import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

/**
 * Shimmer skeleton for loading states. Uses an animated gradient instead of
 * the dated `animate-pulse` opacity blink.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn('rounded-md', className)}
      style={{
        background:
          'linear-gradient(90deg, var(--color-surface-300) 25%, var(--color-surface-400) 50%, var(--color-surface-300) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
    />
  );
}
