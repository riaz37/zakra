"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-lg)] transition-all duration-200 hover:shadow-[var(--shadow-focus)] hover:[color:var(--color-error)]"
      style={{
        background: "var(--color-surface-300)",
        color: "var(--color-foreground)",
      }}
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
