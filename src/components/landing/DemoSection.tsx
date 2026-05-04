import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimateIn } from "@/components/landing/AnimateIn";

const STEPS = [
  "Connect your databases in minutes",
  "Invite your team with role-based access",
  "Ask questions in plain English — no SQL",
];

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

export function DemoSection() {
  return (
    <section id="demo" className="py-20 md:py-28 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left — copy */}
        <AnimateIn className="lg:pt-4">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.06em] text-accent">
            How it works
          </p>
          <h2
            className="font-semibold text-foreground mb-5"
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
              lineHeight: 1.18,
              letterSpacing: "-0.03em",
            }}
          >
            From data to insight
            <br />
            in three steps.
          </h2>
          <p className="text-[14px] text-muted leading-relaxed mb-10 max-w-sm">
            Connect your databases in minutes. Invite your team. Start getting
            answers the same day — without a single line of code or a data
            engineering ticket.
          </p>

          <ul className="space-y-4 mb-10">
            {STEPS.map((step, i) => (
              <li key={step} className="flex items-start gap-3">
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
              Start for free
              <ArrowRight size={13} strokeWidth={2.5} />
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Book a demo
            </Link>
          </div>
        </AnimateIn>

        {/* Right — UI mockup */}
        <AnimateIn delay={120}>
        <div
          className="rounded-xl border border-border-medium overflow-hidden bg-code-canvas"
          style={{ boxShadow: "var(--shadow-elevated)" }}
        >
          {/* Window titlebar */}
          <div className="flex items-center gap-2 px-4 h-10 border-b border-border">
            <span className="size-2.5 rounded-full bg-error opacity-70" />
            <span className="size-2.5 rounded-full bg-warning opacity-70" />
            <span className="size-2.5 rounded-full bg-accent opacity-70" />
            <span className="ml-3 text-[11px] font-mono text-fg-subtle">
              zakra — workspace
            </span>
          </div>

          <div className="flex min-h-[420px]">
            {/* Sidebar */}
            <div className="w-44 shrink-0 border-r border-border p-3 flex flex-col gap-4">
              <div>
                <p className="px-2 mb-2 text-[10px] uppercase tracking-[0.08em] text-fg-subtle">
                  Connections
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
                        <p className="text-[11px] font-mono truncate text-muted">
                          {db.name}
                        </p>
                        <p className="text-[10px] text-fg-subtle">
                          {db.type}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main chat area */}
            <div className="flex-1 flex flex-col">
              {/* Query */}
              <div className="p-4 flex justify-end">
                <div className="rounded-lg px-3 py-2 max-w-[85%] text-[12px] bg-surface-200 border border-border text-foreground">
                  Top 5 revenue customers last quarter?
                </div>
              </div>

              {/* Response */}
              <div className="px-4 pb-4 space-y-2 flex-1">
                <p className="text-[11px] text-fg-subtle">
                  &darr; Querying{" "}
                  <span className="font-mono text-[var(--color-read)]">crm_db</span>,{" "}
                  <span className="font-mono text-[var(--color-read)]">analytics_db</span>…
                </p>

                {/* Result table */}
                <div className="rounded-lg overflow-hidden border border-border text-[11px] font-mono">
                  <div className="grid grid-cols-3 px-3 py-2 border-b border-border bg-surface-200 text-fg-subtle">
                    <span>Customer</span>
                    <span className="text-right">Revenue</span>
                    <span className="text-right">Growth</span>
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
                      <span className="text-right text-accent">{row.revenue}</span>
                      <span className="text-right text-[var(--color-grep)]">{row.growth}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <CheckCircle2 size={11} className="text-accent" />
                  <span className="text-[10px] text-fg-subtle">
                    4 rows · 2 sources · 0.21s
                  </span>
                </div>
              </div>

              {/* Input bar */}
              <div className="px-3 py-2 border-t border-border">
                <div className="flex items-center gap-2 rounded-md px-3 h-8 text-[11px] font-mono bg-surface-200 border border-border">
                  <span className="text-accent">&rsaquo;</span>
                  <span className="text-fg-subtle">Ask a follow-up…</span>
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
