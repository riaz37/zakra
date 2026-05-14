'use client';

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimateIn } from "@/components/landing/AnimateIn";

const CONNECTIONS = [
  { name: "users_db", type: "PostgreSQL", status: "connected" },
  { name: "analytics_db", type: "BigQuery", status: "connected" },
  { name: "crm_db", type: "MySQL", status: "idle" },
];

const RESULTS = [
  { customer: "Acme Corp", revenue: "$1.24M", growth: "+22%" },
  { customer: "Meridian Health", revenue: "$980K", growth: "+11%" },
  { customer: "Quantum Labs", revenue: "$741K", growth: "+31%" },
  { customer: "Atlas Finance", revenue: "$620K", growth: "+8%" },
];

const DEMO_EMAIL = "sales@esap.ai";

function handleBookDemo() {
  window.location.href = `mailto:${DEMO_EMAIL}`;
  navigator.clipboard.writeText(DEMO_EMAIL).then(() => {
    toast.success(`Email copied: ${DEMO_EMAIL}`, {
      description: "No mail client? Paste it into your preferred email app.",
    });
  });
}

export function DemoSection() {
  const t = useTranslations("landing.demo");

  const STEPS = [t("steps.0"), t("steps.1"), t("steps.2")];

  return (
    <section id="demo" className="py-20 md:py-28 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left — copy */}
        <AnimateIn className="lg:pt-4">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.06em] text-accent">
            {t("eyebrow")}
          </p>
          <h2
            className="font-semibold text-foreground mb-5"
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
              lineHeight: 1.18,
              letterSpacing: "-0.03em",
            }}
          >
            {t("headline1")}
            <br />
            {t("headline2")}
          </h2>
          <p className="text-[14px] text-muted leading-relaxed mb-10 max-w-sm">
            {t("description")}
          </p>

          <ul className="space-y-4 mb-10">
            {STEPS.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold bg-accent-soft border border-accent-border text-accent">
                  {i + 1}
                </span>
                <span className="text-[14px] text-muted leading-relaxed">{step}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "default", size: "lg" }))}
            >
              {t("startFree")}
              <ArrowRight size={13} strokeWidth={2.5} className="rtl:rotate-180" />
            </Link>
            <button
              onClick={handleBookDemo}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              {t("bookDemo")}
            </button>
          </div>
        </AnimateIn>

        {/* Right — UI mockup */}
        <AnimateIn delay={120}>
          <div
            className="rounded-xl border border-border-medium overflow-hidden bg-code-canvas"
            style={{ boxShadow: "var(--shadow-elevated)" }}
          >
            <div className="flex items-center gap-2 px-4 h-10 border-b border-border">
              <span className="size-2.5 rounded-full bg-error opacity-70" />
              <span className="size-2.5 rounded-full bg-warning opacity-70" />
              <span className="size-2.5 rounded-full bg-accent opacity-70" />
              <span className="ms-3 text-[11px] font-mono text-fg-subtle">
                {t("terminal.title")}
              </span>
            </div>

            <div className="flex min-h-[420px]">
              <div className="w-44 shrink-0 border-e border-border p-3 flex flex-col gap-4">
                <div>
                  <p className="px-2 mb-2 text-[10px] uppercase tracking-[0.08em] text-fg-subtle">
                    {t("terminal.connectionsLabel")}
                  </p>
                  <div className="space-y-0.5">
                    {CONNECTIONS.map((db) => (
                      <div
                        key={db.name}
                        className={cn(
                          "flex items-center gap-2 px-2 py-1.5 rounded-md",
                          db.name === "analytics_db" && "bg-surface-200"
                        )}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full shrink-0",
                            db.status === "connected" ? "bg-accent" : "bg-fg-subtle"
                          )}
                        />
                        <div className="min-w-0">
                          <p className="text-[11px] font-mono truncate text-muted">{db.name}</p>
                          <p className="text-[10px] text-fg-subtle">{db.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <div className="p-4 flex justify-end">
                  <div className="rounded-lg px-3 py-2 max-w-[85%] text-[12px] bg-surface-200 border border-border text-foreground">
                    {t("terminal.userQuery")}
                  </div>
                </div>

                <div className="px-4 pb-4 space-y-2 flex-1">
                  <p className="text-[11px] text-fg-subtle">
                    {t.rich("terminal.thinking", {
                      db1: (chunks) => <span className="font-mono text-[var(--color-read)]">{chunks}</span>,
                      db2: (chunks) => <span className="font-mono text-[var(--color-read)]">{chunks}</span>,
                    })}
                  </p>

                  <div className="rounded-lg overflow-hidden border border-border text-[11px] font-mono">
                    <div className="grid grid-cols-3 px-3 py-2 border-b border-border bg-surface-200 text-fg-subtle">
                      <span>{t("terminal.tableHeaders.customer")}</span>
                      <span className="text-end">{t("terminal.tableHeaders.revenue")}</span>
                      <span className="text-end">{t("terminal.tableHeaders.growth")}</span>
                    </div>
                    {RESULTS.map((row, i) => (
                      <div
                        key={row.customer}
                        className={cn(
                          "grid grid-cols-3 px-3 py-2 border-b border-border last:border-0",
                          i % 2 === 1 && "bg-surface-100"
                        )}
                      >
                        <span className="text-muted">{row.customer}</span>
                        <span className="text-end text-accent">{row.revenue}</span>
                        <span className="text-end text-[var(--color-grep)]">{row.growth}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <CheckCircle2 size={11} className="text-accent" />
                    <span className="text-[10px] text-fg-subtle">{t("terminal.resultMeta")}</span>
                  </div>
                </div>

                <div className="px-3 py-2 border-t border-border">
                  <div className="flex items-center gap-2 rounded-md px-3 h-8 text-[11px] font-mono bg-surface-200 border border-border">
                    <span className="text-accent">&rsaquo;</span>
                    <span className="text-fg-subtle">{t("terminal.followUp")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
