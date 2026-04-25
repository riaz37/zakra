'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/store/authStore';
import { NAV_ITEMS } from '@/utils/constants';
import { cn } from '@/lib/utils';
import { NavItem } from './nav-item';
import { CompanySwitcher } from './company-switcher';

export interface SidebarProps {
  variant?: 'full' | 'rail' | 'overlay';
  onNavigate?: () => void;
}

type NavEntry = (typeof NAV_ITEMS)[number];

// Split the flat NAV_ITEMS into two groups by label so the source-of-truth
// stays in constants.ts. Anything not matched falls into ADMIN.
const PRIMARY_LABELS = new Set<string>([
  'Overview',
  'Chat',
  'Generate Report',
  'Report History',
]);

const ADMIN_LABELS = new Set<string>([
  'Users',
  'Companies',
  'Databases',
  'Roles',
  'Table Access',
  'Templates',
]);

function isActivePath(currentPath: string, itemPath: string): boolean {
  if (itemPath === '/') {
    return currentPath === '/';
  }
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

function filterItemsByRole(
  items: readonly NavEntry[],
  isAdmin: boolean,
  isSuperAdmin: boolean,
): NavEntry[] {
  return items.filter((item) => {
    if (!('requiredRole' in item) || !item.requiredRole) {
      return true;
    }
    if (item.requiredRole === 'super_admin') {
      return isSuperAdmin;
    }
    return isAdmin;
  });
}

export function Sidebar({ variant = 'full', onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { user, isAdmin, isSuperAdmin, logout } = useAuth();
  const { primaryItems, adminItems } = useMemo(() => {
    const allowed = filterItemsByRole(NAV_ITEMS, isAdmin, isSuperAdmin);
    return {
      primaryItems: allowed.filter((item) => PRIMARY_LABELS.has(item.label)),
      adminItems: allowed.filter((item) => ADMIN_LABELS.has(item.label)),
    };
  }, [isAdmin, isSuperAdmin]);

  const collapsed = variant === 'rail';
  const email = user?.email ?? '';
  const initial = email.charAt(0).toUpperCase() || '?';
  const showAdminGroup = (isAdmin || isSuperAdmin) && adminItems.length > 0;

  const roleBadge = isSuperAdmin
    ? { label: 'Super Admin', tone: 'gold' as const }
    : isAdmin
      ? { label: 'Admin', tone: 'accent' as const }
      : null;

  async function handleSignOut() {
    await logout();
    window.location.href = '/login';
  }

  return (
    <aside
      className={cn(
        'flex h-dvh flex-col border-r border-border bg-surface-100',
        variant === 'full' && 'w-60',
        variant === 'rail' && 'w-16',
        variant === 'overlay' && 'w-60',
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          'flex h-16 items-center border-b border-border',
          collapsed ? 'justify-center px-0' : 'px-5',
        )}
      >
        {collapsed ? (
          <Image
            src="/logo/esaplogo.webp"
            alt="ESAP"
            width={28}
            height={28}
            className="shrink-0"
            priority
          />
        ) : (
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo/esaplogo.webp"
              alt="ESAP"
              width={28}
              height={28}
              className="shrink-0"
              priority
            />
            <Image
              src="/logo/esaplogo.svg"
              alt="ESAP employer solutions"
              width={65}
              height={21}
              className="shrink-0"
              priority
            />
          </div>
        )}
      </div>

      {/* Company switcher — super admins only */}
      {isSuperAdmin && (
        <div className="border-b border-border pt-3">
          <CompanySwitcher collapsed={collapsed} />
        </div>
      )}

      {/* Primary navigation — grouped */}
      <nav
        aria-label="Main navigation"
        className={cn(
          'flex-1 overflow-y-auto overflow-x-hidden',
          collapsed ? 'px-2 py-4' : 'px-3 py-4',
        )}
      >
        {/* Primary group — no section label (these are the defaults) */}
        <ul className="flex flex-col gap-0.5">
          {primaryItems.map((item) => (
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

        {/* Admin group — separated by 20px gap + label */}
        {showAdminGroup && (
          <>
            {!collapsed && (
              <div className="mt-5 mb-1 px-3">
                <span className="font-sans text-micro uppercase tracking-[0.08em] text-muted/60">
                  Admin
                </span>
              </div>
            )}
            {collapsed && <div aria-hidden className="mt-5" />}
            <ul className="flex flex-col gap-0.5">
              {adminItems.map((item) => (
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
          </>
        )}


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
              className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-muted transition-colors duration-150 hover:bg-destructive/10 hover:text-error focus-visible:text-error focus-visible:outline-none"
            >
              <LogOut aria-hidden size={14} strokeWidth={1.75} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5">
            {/* Avatar */}
            <span
              aria-hidden
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-surface-300 font-sans text-button font-medium text-foreground"
            >
              {initial}
            </span>

            {/* Identity column */}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate font-sans text-caption text-muted-strong">
                {email || 'Not signed in'}
              </span>
              {roleBadge && (
                <span
                  className={cn(
                    'w-fit rounded-sm px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em]',
                    roleBadge.tone === 'accent' &&
                      'bg-[rgba(62,207,142,0.1)] text-accent',
                    roleBadge.tone === 'gold' &&
                      'bg-[rgba(229,165,10,0.1)] text-gold',
                  )}
                >
                  {roleBadge.label}
                </span>
              )}
            </div>

            {/* Sign out — icon button, right-aligned */}
            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Sign out"
              title="Sign out"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors duration-150 hover:bg-destructive/10 hover:text-error focus-visible:text-error focus-visible:outline-none"
            >
              <LogOut aria-hidden size={14} strokeWidth={1.75} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
