'use client';

import Link from 'next/link';
import {
  Building2,
  Database,
  FileBarChart,
  History,
  MessageCircle,
  MessageSquare,
  Shield,
  Sparkles,
  Table,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Explicit icon map — no dynamic import, no `any`.
// Extend this when NAV_ITEMS grows; ICON_MAP is the source of truth.
const ICON_MAP: Record<string, LucideIcon> = {
  Building2,
  Database,
  FileBarChart,
  History,
  MessageCircle,
  MessageSquare,
  Shield,
  Sparkles,
  Table,
  Users,
};

export interface NavItemProps {
  label: string;
  path: string;
  icon: string;
  active: boolean;
  /**
   * Icon-only rail mode (tablet breakpoint). Hides the label.
   */
  collapsed?: boolean;
  /**
   * Fired after navigation — used by mobile overlay to close itself.
   */
  onNavigate?: () => void;
}

export function NavItem({
  label,
  path,
  icon,
  active,
  collapsed = false,
  onNavigate,
}: NavItemProps) {
  const Icon = ICON_MAP[icon];

  return (
    <Link
      href={path}
      aria-current={active ? 'page' : undefined}
      aria-label={collapsed ? label : undefined}
      title={collapsed ? label : undefined}
      onClick={onNavigate}
      className={cn(
        // base — relative to anchor the 2px orange active indicator
        'relative flex min-h-10 items-center gap-2.5 rounded-md px-3 py-3 font-sans text-button outline-none transition-colors duration-150',
        // focus ring — accessible, non-bluish, uses warm border token
        'focus-visible:shadow-focus focus-visible:ring-1 focus-visible:ring-border-medium',
        // state
        active
          ? 'bg-background font-medium text-foreground'
          : 'text-muted hover:bg-background/60 hover:text-muted-strong',
        collapsed && 'justify-center px-0',
      )}
    >
      {/* 2px × 16px accent indicator — 8px from top, 8px from left */}
      {active ? (
        <span
          aria-hidden
          className="absolute left-2 top-2 h-4 w-0.5 rounded-pill bg-accent"
        />
      ) : null}

      {Icon ? (
        <Icon
          aria-hidden
          size={16}
          strokeWidth={1.75}
          className={cn('shrink-0', collapsed && 'mx-auto')}
        />
      ) : null}

      {collapsed ? (
        <span className="sr-only">{label}</span>
      ) : (
        <span className="truncate">{label}</span>
      )}
    </Link>
  );
}
