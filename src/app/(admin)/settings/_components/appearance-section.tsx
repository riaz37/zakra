"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun, Rows3, Rows2 } from "lucide-react";
import { StatusDot } from "@/components/admin/status-dot";
import { cn } from "@/lib/utils";
import { DENSITY_STORAGE_KEY } from "@/utils/constants";

type Density = "comfortable" | "compact";
type ThemeChoice = "light" | "dark" | "system";

export function AppearanceSection() {
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
