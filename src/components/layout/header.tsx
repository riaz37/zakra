'use client';

import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HeaderProps {
  /**
   * Whether the mobile navigation overlay is currently open.
   * Wired into `aria-expanded` on the hamburger trigger.
   */
  navOpen: boolean;
  /**
   * Opens the mobile navigation overlay. The overlay itself owns the
   * close affordance (backdrop click + Escape key + in-overlay close btn).
   */
  onOpenNav: () => void;
}

/**
 * Mobile-only top bar. Desktop (>=768px) uses the persistent sidebar.
 */
export function Header({ navOpen, onOpenNav }: HeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background-translucent px-4 backdrop-blur-md md:hidden',
      )}
      style={{ minHeight: 'var(--layout-topbar-h)' }}
    >
      <span className="font-display text-title text-foreground">
        ESAP<span className="text-accent">-</span>KB
      </span>

      <button
        type="button"
        onClick={onOpenNav}
        aria-label="Open navigation"
        aria-expanded={navOpen}
        aria-controls="mobile-navigation"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-300 text-foreground shadow-ring transition-all duration-200 hover:text-error hover:shadow-focus focus-visible:text-error focus-visible:shadow-focus focus-visible:outline-none"
      >
        <Menu aria-hidden size={16} strokeWidth={1.75} />
      </button>
    </header>
  );
}
