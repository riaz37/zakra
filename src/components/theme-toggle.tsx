"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-bg text-fg transition-colors hover:text-[var(--color-brand-deep)]"
    >
      <Sun
        className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
        strokeWidth={2}
      />
      <Moon
        className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
        strokeWidth={2}
      />
    </button>
  );
}
