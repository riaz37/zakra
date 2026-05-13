'use client'

import { useTranslations } from "next-intl";
import { AnimateIn } from "@/components/landing/AnimateIn";

const STAT_KEYS = ["queries", "customers", "latency", "uptime"] as const;

export function StatsSection() {
  const t = useTranslations("landing.stats");

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <AnimateIn>
          <div
            className="grid grid-cols-2 md:grid-cols-4 rounded-lg overflow-hidden border border-border bg-surface-100"
            style={{ gap: "1px", background: "var(--color-border)" }}
          >
            {STAT_KEYS.map((key, i) => (
              <div
                key={key}
                className="relative px-8 py-8 flex flex-col gap-1 bg-surface-100"
              >
                <div
                  className="font-mono font-semibold leading-none mb-1 text-accent"
                  style={{
                    fontSize: "1.875rem",
                    letterSpacing: "-0.02em",
                    transitionDelay: `${i * 60}ms`,
                  }}
                >
                  {t(`${key}.value`)}
                </div>
                <div className="text-[13px] font-medium text-foreground leading-tight">
                  {t(`${key}.label`)}
                </div>
                <div className="text-[11px] text-fg-subtle">
                  {t(`${key}.sub`)}
                </div>
              </div>
            ))}
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
