import { cn } from '@/lib/utils';

const RADIUS_CLASS = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
} as const;

type Radius = keyof typeof RADIUS_CLASS;

interface SkeletonProps {
  className?: string;
  /**
   * Override the corner radius. Defaults to 4px (matches `--radius-md`),
   * which suits text and small surfaces. Variants below set their own.
   */
  rounded?: Radius;
  /** Inline style escape hatch — use sparingly (avatar/card variants). */
  style?: React.CSSProperties;
}

const SHIMMER_STYLE: React.CSSProperties = {
  background:
    'linear-gradient(90deg, var(--color-surface-300) 25%, var(--color-surface-400) 50%, var(--color-surface-300) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s ease-in-out infinite',
};

/**
 * Base shimmer skeleton. Uses an animated warm-surface gradient so the
 * placeholder reads as part of the dark enterprise system, not as a generic
 * grey block. Honours `prefers-reduced-motion` (the keyframe is suppressed
 * by the global media query in `globals.css`).
 */
export function Skeleton({ className, rounded = 'md', style }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(RADIUS_CLASS[rounded], className)}
      style={{ ...SHIMMER_STYLE, ...style }}
    />
  );
}

// ── SkeletonText ───────────────────────────────────────────────────────────

interface SkeletonTextProps {
  /** How many lines to render. Defaults to 1. */
  lines?: number;
  /** Tailwind width utility for the last line (e.g. `'w-3/4'`). */
  lastLineWidth?: string;
  className?: string;
}

/**
 * Multi-line text placeholder. The last line is intentionally narrower so the
 * shape resembles natural prose rather than a perfect block.
 */
export function SkeletonText({
  lines = 1,
  lastLineWidth = 'w-2/3',
  className,
}: SkeletonTextProps) {
  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      {Array.from({ length: lines }).map((_, index) => {
        const isLast = index === lines - 1 && lines > 1;
        return (
          <Skeleton
            key={index}
            rounded="sm"
            className={cn('h-3', isLast ? lastLineWidth : 'w-full')}
          />
        );
      })}
    </div>
  );
}

// ── SkeletonAvatar ─────────────────────────────────────────────────────────

interface SkeletonAvatarProps {
  /** Pixel size. Defaults to 32 to match `size-8` in our system. */
  size?: number;
  className?: string;
}

/** Circular placeholder for avatars. */
export function SkeletonAvatar({ size = 32, className }: SkeletonAvatarProps) {
  return (
    <Skeleton
      rounded="full"
      className={cn('shrink-0', className)}
      style={{ width: size, height: size }}
    />
  );
}

// ── SkeletonCard ───────────────────────────────────────────────────────────

interface SkeletonCardProps {
  /** Card height in pixels. Defaults to a typical list-item height. */
  height?: number;
  className?: string;
}

/**
 * Rectangular card placeholder with the same 10px corner radius as real
 * cards in the system.
 */
export function SkeletonCard({ height = 80, className }: SkeletonCardProps) {
  return (
    <Skeleton
      rounded="xl"
      className={cn('w-full', className)}
      style={{ height }}
    />
  );
}
