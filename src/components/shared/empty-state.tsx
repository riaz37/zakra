'use client';

import { type LucideIcon } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { fadeUp, staggerContainer, staggerItem } from '@/lib/motion';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  /** Defaults to true on `primaryAction`, false on `secondaryAction`. */
  isLoading?: boolean;
}

interface EmptyStateProps {
  /**
   * Optional Lucide icon. Rendered inline at the top-left of the block —
   * never large, never in a coloured circle. Pass the component itself,
   * not an instance: `icon={DatabaseIcon}`.
   */
  icon?: LucideIcon;
  title: string;
  description?: string;
  /**
   * Free-form action slot. Use this when you need full control over the
   * action UI (custom buttons, dropdowns, links). For typical primary +
   * secondary buttons prefer `primaryAction` / `secondaryAction`.
   */
  action?: React.ReactNode;
  /** Convenience: renders a default-variant Button. */
  primaryAction?: EmptyStateAction;
  /** Convenience: renders a ghost-variant Button. */
  secondaryAction?: EmptyStateAction;
  className?: string;
}

/**
 * Typographic empty state for dark enterprise surfaces.
 *
 * - Left-aligned layout — asymmetric, feels designed, not template.
 * - Dashed border hints "container that could hold things".
 * - Optional small inline icon for spatial recognition; never the large
 *   icon-in-circle pattern that screams AI-generated.
 * - Empty states teach the next action; description is the onboarding moment.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  primaryAction,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const hasAnyAction =
    Boolean(action) || Boolean(primaryAction) || Boolean(secondaryAction);
  const reduced = useReducedMotion();

  return (
    <motion.div
      variants={staggerContainer}
      initial={reduced ? 'visible' : 'hidden'}
      animate="visible"
      className={cn(
        'flex flex-col items-start gap-3 rounded-lg border border-dashed border-border px-8 py-20 max-w-2xl mx-auto w-full',
        className,
      )}
    >
      {Icon ? (
        <motion.div
          variants={staggerItem}
          initial={reduced ? {} : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <Icon
            aria-hidden
            className="size-5 text-muted"
            strokeWidth={1.5}
          />
        </motion.div>
      ) : null}

      <motion.h3
        variants={staggerItem}
        className="font-sans text-sub font-normal tracking-[-0.325px] text-foreground"
      >
        {title}
      </motion.h3>

      {description ? (
        <motion.p
          variants={staggerItem}
          className="max-w-[46ch] font-sans text-body text-muted"
        >
          {description}
        </motion.p>
      ) : null}

      {hasAnyAction ? (
        <motion.div
          variants={staggerItem}
          className="mt-4 flex flex-wrap items-center gap-2"
        >
          {action ?? (
            <>
              {primaryAction ? (
                <PrimaryActionButton {...primaryAction} />
              ) : null}
              {secondaryAction ? (
                <SecondaryActionButton {...secondaryAction} />
              ) : null}
            </>
          )}
        </motion.div>
      ) : null}
    </motion.div>
  );
}

function PrimaryActionButton({ label, onClick, isLoading }: EmptyStateAction) {
  return (
    <Button onClick={onClick} isLoading={isLoading ?? false}>
      {label}
    </Button>
  );
}

function SecondaryActionButton({
  label,
  onClick,
  isLoading,
}: EmptyStateAction) {
  return (
    <Button variant="ghost" onClick={onClick} isLoading={isLoading ?? false}>
      {label}
    </Button>
  );
}
