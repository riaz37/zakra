'use client';

import Link from 'next/link';
import {
  Bot,
  Contact,
  Gauge,
  History,
  Landmark,
  MessageSquare,
  ScrollText,
  Server,
  Shield,
  Sparkles,
  TableProperties,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';

// Explicit icon map — no dynamic import, no `any`.
// Extend this when NAV_ITEMS grows; ICON_MAP is the source of truth.
const ICON_MAP: Record<string, LucideIcon> = {
  Bot,
  Contact,
  Gauge,
  History,
  Landmark,
  MessageSquare,
  ScrollText,
  Server,
  Shield,
  Sparkles,
  TableProperties,
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
  const locale = useLocale();
  const isRtl = locale === 'ar';

  return (
    <motion.div
      whileHover={collapsed ? undefined : { x: isRtl ? -2 : 2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1, ease: 'easeOut' }}
    >
      <Link
        href={path}
        aria-current={active ? 'page' : undefined}
        aria-label={collapsed ? label : undefined}
        title={collapsed ? label : undefined}
        onClick={onNavigate}
        className={cn(
          // base
          'relative flex h-8 items-center gap-2.5 rounded-md font-sans text-body outline-none transition-colors duration-[120ms]',
          'border-s-2 ps-[10px] pe-3',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/40',
          active
            ? 'border-s-accent bg-accent-soft font-medium text-foreground'
            : 'border-s-transparent text-fg-muted hover:bg-surface-300 hover:text-foreground',
          collapsed && 'justify-center border-s-0 px-0 ps-0',
        )}
      >
        {Icon ? (
          <Icon
            aria-hidden
            size={15}
            strokeWidth={1.75}
            className={cn(
              'shrink-0',
              active && 'text-accent',
              collapsed && 'mx-auto',
            )}
          />
        ) : null}

        {collapsed ? (
          <span className="sr-only">{label}</span>
        ) : (
          <span className="truncate">{label}</span>
        )}
      </Link>
    </motion.div>
  );
}
