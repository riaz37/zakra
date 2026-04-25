'use client';

import Link from 'next/link';
import {
  Building2,
  Database,
  FileBarChart,
  History,
  LayoutDashboard,
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
  LayoutDashboard,
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
        // base
        'relative flex min-h-10 items-center gap-2.5 rounded-md px-3 py-2.5 font-sans text-button outline-none transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/40',
        active
          ? 'bg-accent/[0.08] font-medium text-accent'
          : 'text-muted hover:bg-surface-300 hover:text-foreground',
        collapsed && 'justify-center px-0',
      )}
    >
      {Icon ? (
        <Icon
          aria-hidden
          size={15}
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
