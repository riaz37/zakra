/**
 * Framer Motion tokens and reusable variants.
 *
 * Maps DESIGN.md §11 motion tokens to Framer Motion variant objects.
 * All durations and easings are sourced from DESIGN.md — do not deviate.
 */

import type { Variants, Transition } from 'framer-motion';

// ── Motion tokens (DESIGN.md §11) ──────────────────────────────────────────

export const MOTION = {
  /** State changes — hover, active, focus */
  micro: { duration: 0.15, ease: 'easeOut' },
  /** Dropdowns, popovers entering */
  short: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const },
  /** Modals, fade-up entrance */
  medium: { duration: 0.32, ease: [0.16, 1, 0.3, 1] as const },
  /** Page transitions */
  long: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
} as const satisfies Record<string, Transition>;

/** DESIGN.md stagger: max 300ms total, 80ms increments for better smoothness */
export const STAGGER_DELAY = 0.08;
export const STAGGER_MAX_ITEMS = 6; // 6 × 80ms = 480ms

// ── Reusable variants ───────────────────────────────────────────────────────

/** Page-level fade-up entrance (320ms) */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: MOTION.medium,
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

/** Simple opacity fade (180ms) */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.18, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.12, ease: 'easeIn' },
  },
};

/** Scale entrance from 94% (150ms) — for cards, modals */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.12, ease: 'easeIn' },
  },
};

/** Slide from right (280ms) — sidebar content, action buttons */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    x: 6,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

/** Slide from bottom (260ms) — toasts, floating buttons */
export const slideInBottom: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.26, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: 6,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

/** Slide from left (280ms) — for left-origin content */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    x: -6,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

// ── Stagger container + item ─────────────────────────────────────────────────

/** Parent that staggers child animations by 50ms */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER_DELAY,
      delayChildren: 0.02,
    },
  },
};

/** Child item used inside a staggerContainer — fade-up entrance */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: MOTION.medium,
  },
};

/** Child item used inside a staggerContainer — scale entrance */
export const staggerScaleItem: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
};

// ── Interaction variants ────────────────────────────────────────────────────

/** Subtle lift on hover — for cards */
export const hoverLift = {
  y: -2,
  transition: { duration: 0.12, ease: 'easeOut' },
} as const;

/** Tactile press — for buttons */
export const tapPress = {
  scale: 0.97,
  transition: { duration: 0.08 },
} as const;

/** Quick shake for error feedback */
export const errorShake: Variants = {
  shake: {
    x: [0, -4, 4, -2, 2, 0],
    transition: { duration: 0.3 },
  },
};
