"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  LogOut,
  Monitor,
  Moon,
  Sun,
  User as UserIcon,
  Palette,
  Rows3,
  Rows2,
} from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { StatusDot } from "@/components/admin/status-dot";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/store/authStore";
import { cn } from "@/lib/utils";

const DENSITY_STORAGE_KEY = "zakra-density";

type Density = "comfortable" | "compact";
type ThemeChoice = "light" | "dark" | "system";

export default function SettingsPage() {
  const [tab, setTab] = useState("profile");

  return (
    <div className="mx-auto max-w-[960px]">
      <PageHeader
        title="Settings"
        subtitle="Manage your profile and appearance"
      />

      <Tabs value={tab} onValueChange={(v: string) => setTab(v)}>
        <div className="mb-6 border-b border-[var(--border)]">
          <TabsList
            variant="line"
            className="h-11 w-full justify-start gap-4 rounded-none bg-transparent p-0"
          >
            <TabsTrigger
              value="profile"
              className="h-11 rounded-none border-0 px-0 text-[13px] font-medium data-active:text-[var(--primary)] after:bg-[var(--primary)]"
            >
              <UserIcon className="size-3.5" strokeWidth={1.75} />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="h-11 rounded-none border-0 px-0 text-[13px] font-medium data-active:text-[var(--primary)] after:bg-[var(--primary)]"
            >
              <Palette className="size-3.5" strokeWidth={1.75} />
              Appearance
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile" className="m-0">
          <ProfileSection />
        </TabsContent>
        <TabsContent value="appearance" className="m-0">
          <AppearanceSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* --------------------------------- Profile -------------------------------- */

function ProfileSection() {
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

/* ------------------------------- Appearance ------------------------------- */

function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  const [density, setDensity] = useState<Density>("comfortable");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(DENSITY_STORAGE_KEY) as Density | null;
    const initial: Density = stored === "compact" ? "compact" : "comfortable";
    setDensity(initial);
    document.documentElement.setAttribute("data-density", initial);
  }, []);

  const applyDensity = (next: Density) => {
    setDensity(next);
    document.documentElement.setAttribute("data-density", next);
    localStorage.setItem(DENSITY_STORAGE_KEY, next);
  };

  const currentTheme: ThemeChoice =
    theme === "light" || theme === "dark" || theme === "system"
      ? (theme as ThemeChoice)
      : "system";

  return (
    <div className="flex flex-col gap-5">
      {/* Theme */}
      <section className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-token-sm">
        <div className="border-b border-[var(--border)] px-6 py-4">
          <h3 className="font-display text-[16px] font-semibold -tracking-[0.01em]">
            Theme
          </h3>
          <p className="mt-0.5 text-[12px] text-[var(--fg-subtle)]">
            Pick the color scheme for this browser.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-3">
          {(
            [
              {
                value: "light",
                label: "Light",
                icon: Sun,
                description: "Paper-white canvas",
              },
              {
                value: "dark",
                label: "Dark",
                icon: Moon,
                description: "Deep forest charcoal",
              },
              {
                value: "system",
                label: "System",
                icon: Monitor,
                description: "Follow your OS",
              },
            ] as const
          ).map((o) => {
            const active = mounted && currentTheme === o.value;
            const Icon = o.icon;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => setTheme(o.value)}
                aria-pressed={active}
                className={cn(
                  "group relative flex flex-col items-start gap-3 rounded-[var(--radius-card)] border p-4 text-left transition-all",
                  active
                    ? "border-[var(--primary)] bg-[var(--primary-soft)] shadow-token-sm"
                    : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]",
                )}
              >
                <ThemeSwatch variant={o.value} />
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon
                      className={cn(
                        "size-4",
                        active
                          ? "text-[var(--primary)]"
                          : "text-[var(--fg-muted)]",
                      )}
                      strokeWidth={1.75}
                    />
                    <span
                      className={cn(
                        "text-[13px] font-medium",
                        active ? "text-[var(--primary)]" : "text-[var(--fg)]",
                      )}
                    >
                      {o.label}
                    </span>
                  </div>
                  {active && (
                    <span className="inline-flex size-4 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-fg)]">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                        className="size-2.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </div>
                <p
                  className={cn(
                    "text-[11px]",
                    active
                      ? "text-[var(--primary)]/80"
                      : "text-[var(--fg-subtle)]",
                  )}
                >
                  {o.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Density */}
      <section className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-token-sm">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-6 py-4">
          <div>
            <h3 className="font-display text-[16px] font-semibold -tracking-[0.01em]">
              Density
            </h3>
            <p className="mt-0.5 text-[12px] text-[var(--fg-subtle)]">
              Controls table row height across the workspace.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 p-6">
          <div
            role="radiogroup"
            aria-label="Interface density"
            className="inline-flex rounded-[var(--radius-input)] border border-[var(--border-strong)] bg-[var(--surface-muted)] p-1"
          >
            {(
              [
                {
                  value: "comfortable",
                  label: "Comfortable",
                  icon: Rows3,
                },
                { value: "compact", label: "Compact", icon: Rows2 },
              ] as const
            ).map((o) => {
              const active = mounted && density === o.value;
              const Icon = o.icon;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => applyDensity(o.value)}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium transition-all",
                    active
                      ? "bg-[var(--surface)] text-[var(--fg)] shadow-token-sm"
                      : "text-[var(--fg-muted)] hover:text-[var(--fg)]",
                  )}
                >
                  <Icon className="size-3.5" strokeWidth={1.75} />
                  {o.label}
                </button>
              );
            })}
          </div>
          <div className="text-[12px] text-[var(--fg-subtle)]">
            {density === "compact"
              ? "32px rows · tight layouts for data-heavy screens"
              : "40px rows · default spacing"}
          </div>
        </div>

        {/* Preview */}
        <div className="border-t border-[var(--border)] bg-[var(--surface-muted)] px-6 py-5">
          <div className="caption-upper mb-2.5">Preview</div>
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]">
            {["connections.production", "connections.staging", "warehouse.bi"].map(
              (name, i, arr) => (
                <div
                  key={name}
                  className={cn(
                    "flex items-center gap-3 px-4",
                    i < arr.length - 1 && "border-b border-[var(--border)]",
                  )}
                  style={{ height: "var(--row-h)" }}
                >
                  <StatusDot status="live" />
                  <span className="font-mono text-[12px] text-[var(--fg)]">
                    {name}
                  </span>
                  <div className="grow" />
                  <span className="text-[11px] text-[var(--fg-subtle)]">
                    updated 2m ago
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function ThemeSwatch({ variant }: { variant: ThemeChoice }) {
  if (variant === "system") {
    return (
      <div
        aria-hidden="true"
        className="flex h-16 w-full overflow-hidden rounded-[10px] border border-[var(--border)]"
      >
        <div className="flex-1">
          <SwatchBody shade="light" />
        </div>
        <div className="flex-1">
          <SwatchBody shade="dark" />
        </div>
      </div>
    );
  }
  return (
    <div
      aria-hidden="true"
      className="h-16 w-full overflow-hidden rounded-[10px] border border-[var(--border)]"
    >
      <SwatchBody shade={variant} />
    </div>
  );
}

function SwatchBody({ shade }: { shade: "light" | "dark" }) {
  const canvas = shade === "light" ? "#F7FAF8" : "#0A120F";
  const card = shade === "light" ? "#FFFFFF" : "#101A15";
  const line = shade === "light" ? "#E4EAE5" : "#1F2A24";
  const accent = shade === "light" ? "#0E6F4D" : "#10B981";
  return (
    <div
      className="relative h-full w-full"
      style={{ backgroundColor: canvas }}
    >
      <div
        className="absolute inset-x-2 top-2 h-3 rounded"
        style={{ backgroundColor: card }}
      />
      <div
        className="absolute inset-x-2 top-7 h-2 rounded"
        style={{ backgroundColor: line }}
      />
      <div
        className="absolute bottom-2 left-2 h-2.5 w-10 rounded"
        style={{ backgroundColor: accent }}
      />
    </div>
  );
}
