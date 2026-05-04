import { AnimateIn } from "@/components/landing/AnimateIn";

const STATS = [
  { value: "10M+", label: "Queries answered", sub: "across all tenants" },
  { value: "800+", label: "Enterprise customers", sub: "in production" },
  { value: "< 180ms", label: "Avg response time", sub: "p99 latency" },
  { value: "99.95%", label: "Uptime SLA", sub: "last 12 months" },
];

export function StatsSection() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <AnimateIn>
          <div
            className="grid grid-cols-2 md:grid-cols-4 rounded-lg overflow-hidden border border-border bg-surface-100"
            style={{ gap: "1px", background: "var(--color-border)" }}
          >
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
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
                  {stat.value}
                </div>
                <div className="text-[13px] font-medium text-foreground leading-tight">
                  {stat.label}
                </div>
                <div className="text-[11px] text-fg-subtle">
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
