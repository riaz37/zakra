'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/store/authStore';
import { NAV_ITEMS } from '@/utils/constants';
import { cn } from '@/lib/utils';
import { NavItem } from './nav-item';
import { CompanySwitcher } from './company-switcher';

export interface SidebarProps {
  /**
   * Visual mode. `full` is the desktop 240px sidebar, `rail` is the
   * icon-only 64px tablet rail, `overlay` is the mobile slide-in.
   */
  variant?: 'full' | 'rail' | 'overlay';
  /**
   * Called after a nav item is clicked — overlay uses this to close itself.
   */
  onNavigate?: () => void;
}

/**
 * Active-route matcher. `/` matches only itself (so "Chat" doesn't light up
 * on every admin page), everything else matches its path or a deeper segment.
 */
function isActivePath(currentPath: string, itemPath: string): boolean {
  if (itemPath === '/') {
    return currentPath === '/';
  }
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

/**
 * Filter NAV_ITEMS by the current user's role.
 * - super_admin  → all items
 * - admin        → items without `requiredRole` + items with `requiredRole: 'admin'`
 * - regular      → only items without `requiredRole`
 */
function filterItemsByRole(
  items: typeof NAV_ITEMS,
  isAdmin: boolean,
  isSuperAdmin: boolean,
) {
  return items.filter((item) => {
    if (!('requiredRole' in item) || !item.requiredRole) {
      return true;
    }
    if (item.requiredRole === 'super_admin') {
      return isSuperAdmin;
    }
    // requiredRole === 'admin' — any admin passes
    return isAdmin;
  });
}

export function Sidebar({ variant = 'full', onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { user, isAdmin, isSuperAdmin, logout } = useAuth();

  const navItems = useMemo(
    () => filterItemsByRole(NAV_ITEMS, isAdmin, isSuperAdmin),
    [isAdmin, isSuperAdmin],
  );

  const collapsed = variant === 'rail';
  const email = user?.email ?? '';
  const initial = email.charAt(0).toUpperCase() || '?';

  async function handleSignOut() {
    await logout();
  }

  return (
    <aside
      className={cn(
        'flex h-dvh flex-col border-r border-border bg-surface-400',
        variant === 'full' && 'w-60',
        variant === 'rail' && 'w-16',
        variant === 'overlay' && 'w-60',
      )}
    >
      {/* Brand — matches login page typography */}
      <div
        className={cn(
          'flex items-center border-b border-border px-4',
          collapsed ? 'justify-center px-0' : 'px-5',
        )}
        style={{ minHeight: 'var(--layout-topbar-h)' }}
      >
        {collapsed ? (
          <span
            className="font-display text-title text-foreground"
            aria-label="ESAP-KB"
          >
            E
            <span className="text-accent">·</span>
          </span>
        ) : (
          <span className="font-display text-title text-foreground">
            ESAP<span className="text-accent">-</span>KB
          </span>
        )}
      </div>

      {/* Company switcher — super admins only */}
      {isSuperAdmin && (
        <div className="border-b border-border pt-3">
          <CompanySwitcher collapsed={collapsed} />
        </div>
      )}

      {/* Primary navigation */}
      <nav
        aria-label="Main navigation"
        className={cn(
          'flex-1 overflow-y-auto overflow-x-hidden',
          collapsed ? 'px-2 py-4' : 'px-3 py-4',
        )}
      >
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavItem
                label={item.label}
                path={item.path}
                icon={item.icon}
                active={isActivePath(pathname, item.path)}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </ul>

        {/* RECENT CHATS — only in full width; placeholder for Phase 3 */}
        {!collapsed ? (
          <div className="mt-8">
            <h2
              className="px-3 font-sans text-micro uppercase text-muted/40"
              style={{ letterSpacing: '0.048px' }}
            >
              Recent chats
            </h2>
            <p className="mt-3 px-3 font-serif text-body-serif-sm font-feat-cswh text-muted/60">
              Your recent conversations will appear here.
            </p>
          </div>
        ) : null}
      </nav>

      {/* User footer — pinned */}
      <div
        className={cn(
          'border-t border-border',
          collapsed ? 'px-2 py-3' : 'px-3 py-3',
        )}
      >
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <span
              aria-label={email || 'User'}
              title={email}
              className="flex h-8 w-8 items-center justify-center rounded-pill bg-surface-300 font-sans text-button font-medium text-foreground"
            >
              {initial}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Sign out"
              title="Sign out"
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors duration-150 hover:bg-background/60 hover:text-error focus-visible:text-error focus-visible:shadow-focus focus-visible:outline-none"
            >
              <LogOut aria-hidden size={14} strokeWidth={1.75} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-md px-2 py-1.5">
            <span
              aria-hidden
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-surface-300 font-sans text-button font-medium text-foreground"
            >
              {initial}
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-sans text-caption text-muted">
                {email || 'Not signed in'}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="self-start font-sans text-caption text-muted transition-colors duration-150 hover:text-error focus-visible:text-error focus-visible:outline-none"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
