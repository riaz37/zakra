'use client';

/**
 * Reusable animated wrapper components built on Framer Motion.
 *
 * These respect `prefers-reduced-motion` via the `useReducedMotion` hook
 * and fall back to instant rendering when reduced motion is preferred.
 */

import { type ReactNode } from 'react';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from 'framer-motion';
import {
  fadeUp,
  fadeIn,
  staggerContainer,
  staggerItem,
  staggerScaleItem,
} from '@/lib/motion';
import { cn } from '@/lib/utils';

// ── AnimatedPage ─────────────────────────────────────────────────────────────

interface AnimatedPageProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps page-level content with a fade-up entrance animation.
 * Use as the outermost wrapper inside a page component.
 */
export function AnimatedPage({ children, className }: AnimatedPageProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      variants={fadeUp}
      initial={reduced ? 'visible' : 'hidden'}
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── StaggerList ──────────────────────────────────────────────────────────────

interface StaggerListProps {
  children: ReactNode;
  className?: string;
  /** Use 'scale' for cards, 'fade' (default) for list items */
  variant?: 'fade' | 'scale';
  /** HTML element to render as — defaults to 'div' */
  as?: 'div' | 'ul' | 'ol' | 'dl';
}

/**
 * Wraps a list of children and staggers their entrance animation.
 * Each direct child should be wrapped in `StaggerItem` or a `motion.*` element
 * that reads from parent variants.
 */
export function StaggerList({
  children,
  className,
  variant = 'fade',
  as = 'div',
}: StaggerListProps) {
  const reduced = useReducedMotion();
  const Component = motion[as] as typeof motion.div;

  return (
    <Component
      variants={staggerContainer}
      initial={reduced ? 'visible' : 'hidden'}
      animate="visible"
      className={className}
    >
      {children}
    </Component>
  );
}

// ── StaggerItem ──────────────────────────────────────────────────────────────

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  /** Use 'scale' for cards, 'fade' (default) for list items */
  variant?: 'fade' | 'scale';
  /** HTML element to render as — defaults to 'div' */
  as?: 'div' | 'li' | 'tr';
}

/**
 * Individual item that reads stagger timing from a parent `StaggerList`.
 */
export function StaggerItem({
  children,
  className,
  variant = 'fade',
  as = 'div',
}: StaggerItemProps) {
  const itemVariants = variant === 'scale' ? staggerScaleItem : staggerItem;
  const Component = motion[as] as typeof motion.div;

  return (
    <Component variants={itemVariants} className={className}>
      {children}
    </Component>
  );
}

// ── AnimatedPresence ─────────────────────────────────────────────────────────

interface AnimatedPresenceProps {
  children: ReactNode;
  /** Unique key for AnimatePresence tracking */
  presenceKey: string;
  className?: string;
  /** Variant set to use — defaults to fadeUp */
  variants?: Variants;
  /** 'wait' = exit before enter, 'sync' = simultaneous */
  mode?: 'wait' | 'sync' | 'popLayout';
}

/**
 * Convenience wrapper around AnimatePresence + motion.div for
 * content that swaps (tab panels, empty↔content states, etc.).
 */
export function AnimatedSwitch({
  children,
  presenceKey,
  className,
  variants = fadeUp,
  mode = 'wait',
}: AnimatedPresenceProps) {
  const reduced = useReducedMotion();

  return (
    <AnimatePresence mode={mode}>
      <motion.div
        key={presenceKey}
        variants={variants}
        initial={reduced ? 'visible' : 'hidden'}
        animate="visible"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ── AnimatedCard ──────────────────────────────────────────────────────────────

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  /** Enable hover lift effect */
  hover?: boolean;
}

/**
 * Card wrapper with scale-in entrance and optional hover lift.
 * Use inside a `StaggerList` for staggered grid reveals.
 */
export function AnimatedCard({
  children,
  className,
  hover = true,
}: AnimatedCardProps) {
  return (
    <motion.div
      variants={staggerScaleItem}
      whileHover={
        hover ? { y: -2, transition: { duration: 0.12, ease: 'easeOut' } } : undefined
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}
