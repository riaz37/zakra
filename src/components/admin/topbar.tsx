"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  ChevronRight,
  Columns,
  LogOut,
  Menu,
  Settings as SettingsIcon,
  User as UserIcon,
} from "lucide-react";
import { ROUTE_LABEL } from "./nav";
import { useAuth } from "@/store/authStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface TopbarProps {
  onToggleSidebar: () => void;
  onMobileMenu: () => void;
  onOpenCommand: () => void;
}

export function Topbar({ onToggleSidebar, onMobileMenu, onOpenCommand }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const segment = pathname.split("/").filter(Boolean)[0] ?? "dashboard";
  const crumb = ROUTE_LABEL[segment] ?? "Dashboard";
  const subSegment = pathname.split("/").filter(Boolean)[1];

  const initials =
    [user?.first_name?.[0], user?.last_name?.[0]].filter(Boolean).join("").toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";
  const firstName = user?.first_name || user?.email?.split("@")[0] || "Account";

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out");
    } finally {
      router.push("/login");
    }
  };

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-6"
      style={{ height: "var(--topbar-h)" }}
    >
      <button
        type="button"
        title="Toggle sidebar"
        onClick={onToggleSidebar}
        className="hidden size-8 items-center justify-center rounded-md text-[var(--fg-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--fg)] md:inline-flex"
      >
        <Columns className="size-[18px]" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        title="Menu"
        onClick={onMobileMenu}
        className="inline-flex size-8 items-center justify-center rounded-md text-[var(--fg-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--fg)] md:hidden"
      >
        <Menu className="size-[18px]" strokeWidth={1.75} />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[13px]">
        <span className="text-[var(--fg-subtle)]">Zakra</span>
        <ChevronRight className="size-3.5 text-[var(--fg-subtle)]" strokeWidth={1.75} />
        <span className="font-medium text-[var(--fg)]">{crumb}</span>
        {subSegment && (
          <>
            <ChevronRight className="size-3.5 text-[var(--fg-subtle)]" strokeWidth={1.75} />
            <span className="truncate font-mono text-[12px] text-[var(--fg-muted)]">
              {subSegment}
            </span>
          </>
        )}
      </div>

      <div className="grow" />

      {/* Command palette trigger */}
      <button
        type="button"
        onClick={onOpenCommand}
        className="hidden h-[34px] min-w-[280px] items-center gap-2.5 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-left text-[13px] font-normal text-[var(--fg-muted)] transition-colors hover:bg-[var(--surface-muted)] md:inline-flex"
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
        <span className="grow">Search users, connections, reports…</span>
        <kbd className="rounded border border-[var(--border)] bg-[var(--surface-muted)] px-1.5 py-px font-mono text-[11px]">
          ⌘K
        </kbd>
      </button>

      {/* Back to site */}
      <Link
        href="/"
        title="Back to zakra.dev"
        className="hidden h-[30px] items-center gap-1.5 rounded-md px-2 text-[13px] text-[var(--fg-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--fg)] md:inline-flex"
      >
        <ArrowLeft className="size-3.5" strokeWidth={1.75} />
        <span>Back to site</span>
      </Link>

      {/* Notifications */}
      <button
        type="button"
        title="Notifications"
        className="relative inline-flex size-8 items-center justify-center rounded-md text-[var(--fg-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--fg)]"
      >
        <Bell className="size-[18px]" strokeWidth={1.75} />
        <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[var(--primary)] ring-2 ring-[var(--surface)]" />
      </button>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex h-8 items-center gap-2 rounded-md py-0 pl-1 pr-1.5 text-[13px] transition-colors hover:bg-[var(--surface-muted)]">
          <span className="inline-flex size-[22px] items-center justify-center rounded-full bg-[var(--primary-soft)] text-[10px] font-semibold text-[var(--primary)]">
            {initials}
          </span>
          <span className="hidden md:inline">{firstName}</span>
          <ChevronDown className="size-3.5 text-[var(--fg-muted)]" strokeWidth={1.75} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[180px]">
          <DropdownMenuItem
            onClick={() => router.push("/settings")}
            className="flex items-center gap-2 text-[13px]"
          >
            <UserIcon className="size-3.5" strokeWidth={1.75} />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push("/settings")}
            className="flex items-center gap-2 text-[13px]"
          >
            <SettingsIcon className="size-3.5" strokeWidth={1.75} />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center gap-2 text-[13px] text-[var(--destructive)] focus:text-[var(--destructive)]"
          >
            <LogOut className="size-3.5" strokeWidth={1.75} />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
