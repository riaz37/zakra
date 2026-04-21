"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useIsMounted();

  const isDark = mounted && resolvedTheme === "dark";
  const nextTheme = isDark ? "light" : "dark";
  const label = mounted
    ? `Switch to ${nextTheme} mode`
    : "Toggle color theme";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setTheme(nextTheme)}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-300 text-foreground shadow-ring transition-all duration-200 hover:text-error hover:shadow-focus"
    >
      <span className="sr-only">{label}</span>
      {mounted ? (
        isDark ? (
          <Sun aria-hidden size={16} strokeWidth={1.75} />
        ) : (
          <Moon aria-hidden size={16} strokeWidth={1.75} />
        )
      ) : (
        <span aria-hidden className="block h-4 w-4" />
      )}
    </button>
  );
}
