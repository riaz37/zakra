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
  'Reports',
]);

const ADMIN_LABELS = new Set<string>([
  'Users',
  'Companies',
  'Databases',
  'Roles',
  'Table Access',
]);

// Reports sidebar item points to /reports/ai-generate but should be active for any /reports/* route
const SECTION_ROOTS: Record<string, string> = {
  '/reports/ai-generate': '/reports',
  '/reports/templates': '/reports',
  '/reports/generate': '/reports',
};

function isActivePath(currentPath: string, itemPath: string): boolean {
  if (itemPath === '/') {
    return currentPath === '/';
  }
  const sectionRoot = SECTION_ROOTS[itemPath];
  if (sectionRoot) {
    return currentPath.startsWith(sectionRoot);
  }
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

interface EmailParts {
  local: string;
  domain: string | null;
}

function splitEmail(email: string): EmailParts {
  const at = email.lastIndexOf('@');
  if (at <= 0 || at === email.length - 1) {
    return { local: email, domain: null };
  }
  return { local: email.slice(0, at), domain: email.slice(at + 1) };
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
  const isSignedIn = email.length > 0;
  const initial = email.charAt(0).toUpperCase() || '?';
  const { local: emailLocal, domain: emailDomain } = splitEmail(email);
  const showAdminGroup = (isAdmin || isSuperAdmin) && adminItems.length > 0;

  async function handleSignOut() {
    await logout();
    window.location.href = '/login';
  }

  return (
    <aside
      className={cn(
        'flex h-dvh flex-col border-r border-border bg-surface-100',
        variant === 'full' && 'w-56',
        variant === 'rail' && 'w-[52px]',
        variant === 'overlay' && 'w-56',
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
            src="/logo/zakralogo.png"
            alt="Zakra"
            width={32}
            height={32}
            className="shrink-0 object-contain"
            priority
          />
        ) : (
          <Image
            src="/logo/zakralogo.png"
            alt="Zakra"
            width={80}
            height={24}
            className="shrink-0 object-contain"
            priority
          />
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
                <span className="font-sans text-micro uppercase tracking-[0.08em] text-fg-subtle">
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
          <div className="flex flex-col items-center gap-1.5">
            <span
              aria-label={email || 'User'}
              title={email || 'Not signed in'}
              className="flex h-8 w-8 items-center justify-center rounded-pill border border-border-medium bg-surface-300 font-sans text-body font-medium text-foreground"
            >
              {initial}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Sign out"
              title="Sign out"
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md text-fg-muted',
                'transition-colors duration-150',
                'hover:bg-surface-300 hover:text-error',
                'focus-visible:bg-surface-300 focus-visible:text-error focus-visible:outline-none',
              )}
            >
              <LogOut aria-hidden size={14} strokeWidth={1.75} />
            </button>
          </div>
        ) : (
          <div
            role="group"
            aria-label={isSignedIn ? `Signed in as ${email}` : 'Account'}
            className={cn(
              'group flex items-center gap-2.5 rounded-md px-2 py-1.5',
              'transition-colors duration-150',
              'hover:bg-surface-300 focus-within:bg-surface-300',
            )}
          >
            {/* Avatar */}
            <span
              aria-hidden
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-pill',
                'border border-border-medium bg-surface-400',
                'font-sans text-body font-medium text-foreground',
              )}
            >
              {initial}
            </span>

            {/* Identity column — split email at @ for graceful wrapping */}
            <div className="flex min-w-0 flex-1 flex-col">
              {isSignedIn ? (
                emailDomain ? (
                  <>
                    <span
                      className="truncate font-sans text-caption font-medium text-foreground leading-tight"
                      title={email}
                    >
                      {emailLocal}
                    </span>
                    <span
                      className="truncate font-mono text-mono-sm text-fg-muted leading-tight"
                      title={email}
                    >
                      @{emailDomain}
                    </span>
                  </>
                ) : (
                  <span
                    className="truncate font-sans text-caption font-medium text-foreground"
                    title={email}
                  >
                    {emailLocal}
                  </span>
                )
              ) : (
                <span className="truncate font-sans text-caption text-fg-muted">
                  Not signed in
                </span>
              )}
            </div>

            {/* Sign out — ghost at rest, sharpens on group hover/focus */}
            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Sign out"
              title="Sign out"
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                'text-fg-subtle transition-colors duration-150',
                'group-hover:text-fg-muted',
                'hover:!bg-surface-400 hover:!text-error',
                'focus-visible:bg-surface-400 focus-visible:text-error focus-visible:outline-none',
              )}
            >
              <LogOut aria-hidden size={14} strokeWidth={1.75} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
