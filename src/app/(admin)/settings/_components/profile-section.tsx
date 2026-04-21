"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { StatusDot } from "@/components/admin/status-dot";
import { useAuth } from "@/store/authStore";
import { cn } from "@/lib/utils";

export function ProfileSection() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  if (!user) {
    return (
      <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-[13px] text-[var(--fg-subtle)] shadow-token-sm">
        Sign in to view your profile.
      </div>
    );
  }

  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.email.split("@")[0];
  const initials =
    ((user.first_name?.[0] ?? "") + (user.last_name?.[0] ?? "") ||
      user.email[0] ||
      "U").toUpperCase();

  const typeLabel =
    user.user_type === "super_admin"
      ? "Super admin"
      : user.user_type === "admin"
        ? "Admin"
        : "Member";

  const statusDot =
    user.status === "active"
      ? "live"
      : user.status === "suspended"
        ? "failed"
        : "idle";

  const onSignOut = async () => {
    setSigningOut(true);
    try {
      await logout();
      toast.success("Signed out");
      router.push("/login");
    } catch {
      toast.error("Sign-out failed");
      setSigningOut(false);
    }
  };

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString();
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Identity card */}
      <section className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-token-sm">
        <div className="flex flex-wrap items-center gap-5 p-6">
          <span
            aria-hidden="true"
            className="inline-flex size-16 shrink-0 items-center justify-center rounded-[14px] bg-[var(--primary-soft)] font-display text-[22px] font-semibold text-[var(--primary)]"
          >
            {initials}
          </span>
          <div className="min-w-0 grow">
            <h2 className="font-display text-[22px] font-semibold -tracking-[0.01em]">
              {fullName}
            </h2>
            <div className="mt-0.5 font-mono text-[12px] text-[var(--fg-muted)]">
              {user.email}
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex h-[22px] items-center rounded-[var(--radius-badge)] bg-[var(--primary-soft)] px-2 text-[12px] font-medium text-[var(--primary)]">
                {typeLabel}
              </span>
              <span className="inline-flex h-[22px] items-center gap-1.5 rounded-[var(--radius-badge)] bg-[var(--surface-muted)] px-2 text-[12px] font-medium capitalize text-[var(--fg-muted)]">
                <StatusDot status={statusDot} />
                {user.status}
              </span>
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-0 border-t border-[var(--border)] md:grid-cols-2">
          <Row label="First name" value={user.first_name || "—"} />
          <Row label="Last name" value={user.last_name || "—"} />
          <Row label="Phone" value={user.phone || "—"} />
          <Row label="Mode" value={user.mode} mono />
          <Row
            label="Email verified"
            value={user.email_verified ? "Yes" : "No"}
          />
          <Row label="Joined" value={formatDate(user.created_at)} />
          <Row label="Last sign-in" value={formatDate(user.last_login_at)} />
          <Row label="User ID" value={user.id} mono isLast />
        </dl>
      </section>

      {/* Danger zone */}
      <section className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--destructive-soft)] bg-[var(--surface)] shadow-token-sm">
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-6 py-4">
          <div className="grow">
            <h3 className="font-display text-[16px] font-semibold -tracking-[0.01em]">
              Session
            </h3>
            <p className="mt-0.5 text-[12px] text-[var(--fg-subtle)]">
              Signing out clears tokens from this browser.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between bg-[var(--surface-muted)] px-6 py-4">
          <span className="text-[13px] text-[var(--fg-muted)]">
            Signed in as{" "}
            <span className="font-mono text-[var(--fg)]">{user.email}</span>
          </span>
          <button
            type="button"
            onClick={onSignOut}
            disabled={signingOut}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-[var(--radius-btn)] bg-[var(--destructive)] px-3.5 text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut className="size-3.5" strokeWidth={1.75} />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </section>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  isLast,
}: {
  label: string;
  value: string;
  mono?: boolean;
  isLast?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-6 border-[var(--border)] px-6 py-3",
        !isLast && "border-b md:[&:nth-last-child(2)]:border-b",
      )}
    >
      <dt className="text-[12px] font-medium text-[var(--fg-subtle)]">{label}</dt>
      <dd
        className={cn(
          "truncate text-right text-[13px]",
          mono ? "font-mono text-[var(--fg-muted)]" : "text-[var(--fg)]",
        )}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}
