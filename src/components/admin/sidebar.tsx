"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/authStore";
import { NAV_GROUPS, SETTINGS_ITEM } from "./nav";
import { ZakraMark } from "./zakra-mark";

interface SidebarProps {
  collapsed: boolean;
  onMobileClose?: () => void;
  onOpenCommand: () => void;
}

export function Sidebar({ collapsed, onMobileClose, onOpenCommand }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  const initials =
    [user?.first_name?.[0], user?.last_name?.[0]].filter(Boolean).join("").toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";
  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.email || "Account";
  const role = user?.user_type === "super_admin" ? "Super admin" : user?.user_type === "admin" ? "Admin" : "Member";

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside
      className="sticky top-0 z-40 flex h-screen flex-col border-r border-[var(--border)] bg-[var(--surface)]"
      style={{
        width: collapsed ? 64 : "var(--sidebar-w)",
        minWidth: collapsed ? 64 : "var(--sidebar-w)",
        transition: "width var(--motion-panel)",
      }}
    >
      {/* Logo block — matches topbar height */}
      <div
        className="flex shrink-0 items-center gap-2.5 border-b border-[var(--border)]"
        style={{
          padding: collapsed ? "16px 12px" : "18px 20px",
          height: "var(--topbar-h)",
        }}
      >
        <ZakraMark size={28} />
        {!collapsed && (
          <div className="flex min-w-0 grow flex-col gap-px">
            <div className="font-display text-[15px] font-semibold leading-none -tracking-[0.01em]">
              Zakra
            </div>
            <div className="text-[11px] text-[var(--fg-subtle)]">Internal admin</div>
          </div>
        )}
        {onMobileClose && (
          <button
            type="button"
            aria-label="Close menu"
            onClick={onMobileClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--fg-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--fg)] md:hidden"
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        )}
      </div>

      {/* Command trigger */}
      {!collapsed && (
        <div className="px-4 pb-2 pt-3">
          <button
            type="button"
            onClick={onOpenCommand}
            className="flex h-[34px] w-full items-center gap-2.5 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-left text-[13px] text-[var(--fg-muted)] transition-colors hover:bg-[var(--surface-muted)]"
          >
            <svg
              className="size-3.5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <span className="grow">Search…</span>
            <kbd className="rounded border border-[var(--border)] bg-[var(--surface-muted)] px-1.5 py-px font-mono text-[11px]">
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      {/* Nav groups */}
      <nav
        className="flex-1 overflow-y-auto"
        style={{ padding: collapsed ? "8px 8px" : "8px 12px" }}
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-3.5">
            {!collapsed && (
              <div className="caption-upper px-2 pb-1 pt-2">{group.label}</div>
            )}
            {group.items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  onClick={onMobileClose}
                  className={cn(
                    "relative flex w-full items-center gap-2.5 rounded-lg text-[14px] transition-colors",
                    collapsed ? "justify-center p-[9px]" : "px-2.5 py-[9px]",
                    active
                      ? "bg-[var(--primary-soft)] font-medium text-[var(--primary)]"
                      : "text-[var(--fg)] hover:bg-[var(--surface-muted)]",
                  )}
                >
                  {active && !collapsed && (
                    <span className="absolute -left-3 top-1.5 bottom-1.5 w-0.5 rounded bg-[var(--primary)]" />
                  )}
                  <Icon className="size-[18px]" strokeWidth={1.75} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--border)]" style={{ padding: collapsed ? 10 : 14 }}>
        <Link
          href={SETTINGS_ITEM.href}
          onClick={onMobileClose}
          className={cn(
            "mb-2 flex w-full items-center gap-2.5 rounded-lg text-[14px] transition-colors",
            collapsed ? "justify-center p-[9px]" : "px-2.5 py-[9px]",
            isActive(SETTINGS_ITEM.href)
              ? "bg-[var(--primary-soft)] font-medium text-[var(--primary)]"
              : "text-[var(--fg)] hover:bg-[var(--surface-muted)]",
          )}
        >
          <SETTINGS_ITEM.icon className="size-[18px]" strokeWidth={1.75} />
          {!collapsed && <span>{SETTINGS_ITEM.label}</span>}
        </Link>

        {!collapsed ? (
          <div className="flex items-center gap-2.5 px-1.5 py-2">
            <div className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[11px] font-semibold text-[var(--primary)]">
              {initials}
            </div>
            <div className="min-w-0 grow">
              <div className="truncate text-[13px] font-medium">{displayName}</div>
              <div className="mt-px inline-flex h-[18px] items-center rounded bg-[var(--primary-soft)] px-1.5 text-[11px] font-medium text-[var(--primary)]">
                {role}
              </div>
            </div>
            <button
              type="button"
              aria-label="Toggle theme"
              title="Toggle theme"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="inline-flex size-8 items-center justify-center rounded-md text-[var(--fg-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--fg)]"
            >
              {isDark ? (
                <Sun className="size-4" strokeWidth={1.75} />
              ) : (
                <Moon className="size-4" strokeWidth={1.75} />
              )}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <div className="inline-flex size-[22px] items-center justify-center rounded-full bg-[var(--primary-soft)] text-[10px] font-semibold text-[var(--primary)]">
              {initials}
            </div>
            <button
              type="button"
              aria-label="Toggle theme"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="inline-flex size-8 items-center justify-center rounded-md text-[var(--fg-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--fg)]"
            >
              {isDark ? (
                <Sun className="size-4" strokeWidth={1.75} />
              ) : (
                <Moon className="size-4" strokeWidth={1.75} />
              )}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
