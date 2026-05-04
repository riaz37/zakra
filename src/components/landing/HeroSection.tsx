import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-24 pb-20 px-6">
      <div className="relative max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy, staggered entrance */}
          <div>
            <div className="inline-flex items-center mb-8 animate-fade-up">
              <Link
                href="/login"
                className="inline-flex items-center gap-3 rounded-full border border-border-medium bg-surface-200 px-4 h-9 text-[13px] text-muted transition-colors duration-[120ms] hover:border-border-strong hover:text-foreground"
              >
                <span>Now generally available · enterprise edition</span>
                <ChevronRight size={14} strokeWidth={1.5} className="text-fg-subtle" />
              </Link>
            </div>

            <h1
              className="mb-6 font-semibold text-foreground animate-fade-up animation-delay-100"
              style={{
                fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
              }}
            >
              Your data.
              <br />
              <span className="text-accent">Any question.</span>
              <br />
              Instant answer.
            </h1>

            <p className="text-[15px] text-muted leading-relaxed max-w-md mb-10 animate-fade-up animation-delay-150">
              Zakra connects to your enterprise databases, learns your business context,
              and gives every team member a natural-language interface to the information
              they need — without writing a single query.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-10 animate-fade-up animation-delay-200">
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

            <p className="text-[12px] text-muted animate-fade-up animation-delay-300">
              Trusted by{" "}
              <strong className="text-foreground font-medium">800+</strong>{" "}
              enterprise teams &middot; No credit card required
            </p>
          </div>

          {/* Right — terminal, delayed entrance */}
          <div
            className="rounded-xl border border-border-medium overflow-hidden bg-code-canvas animate-fade-up animation-delay-200"
            style={{ boxShadow: "var(--shadow-elevated)" }}
          >
            {/* Titlebar */}
            <div className="flex items-center gap-2 px-4 h-10 border-b border-border">
              <span className="size-2.5 rounded-full bg-error opacity-70" />
              <span className="size-2.5 rounded-full bg-warning opacity-70" />
              <span className="size-2.5 rounded-full bg-accent opacity-70" />
              <span className="ml-3 text-[11px] font-mono text-fg-subtle">
                zakra — workspace — analytics_db
              </span>
            </div>

            {/* Content */}
            <div className="p-5 text-[12px] leading-relaxed space-y-4">
              {/* User message */}
              <div className="font-mono animate-fade-up animation-delay-300">
                <span className="text-fg-subtle">user@acme &rsaquo; </span>
                <span className="text-foreground">
                  How many active users signed up last month?
                </span>
              </div>

              {/* Thinking */}
              <div className="text-fg-subtle animate-fade-up animation-delay-400">
                &darr; Querying{" "}
                <span className="font-mono text-[var(--color-read)]">users_db</span>,{" "}
                <span className="font-mono text-[var(--color-read)]">analytics_db</span>{" "}
                — 2 sources matched
              </div>

              {/* SQL block */}
              <div className="rounded-md p-3 text-[11px] leading-loose border border-border bg-surface-100 font-mono animate-fade-up animation-delay-500">
                <div>
                  <span className="text-[var(--color-read)]">SELECT</span>{" "}
                  <span className="text-foreground">COUNT(*)</span>{" "}
                  <span className="text-[var(--color-read)]">AS</span>{" "}
                  <span className="text-[var(--color-edit)]">new_users</span>
                </div>
                <div>
                  <span className="text-[var(--color-read)]">FROM</span>{" "}
                  <span className="text-foreground">users</span>
                </div>
                <div>
                  <span className="text-[var(--color-read)]">WHERE</span>{" "}
                  <span className="text-foreground">created_at</span>{" "}
                  <span className="text-[var(--color-read)]">&gt;=</span>{" "}
                  <span className="text-[var(--color-grep)]">&apos;2026-04-01&apos;</span>
                </div>
                <div>
                  <span className="text-[var(--color-read)]">AND</span>{" "}
                  <span className="text-foreground">status</span>{" "}
                  <span className="text-[var(--color-read)]">=</span>{" "}
                  <span className="text-[var(--color-grep)]">&apos;active&apos;</span>
                </div>
              </div>

              {/* Result */}
              <div className="rounded-md p-3 bg-accent-soft border border-accent-border animate-fade-up animation-delay-600">
                <div className="flex items-baseline gap-2 mb-1">
                  <span
                    className="text-[22px] font-semibold font-mono text-accent"
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    2,847
                  </span>
                  <span className="text-muted">active users</span>
                </div>
                <div className="text-[11px] text-[var(--color-grep)] font-mono">
                  &uarr; 14.2% vs prior month &nbsp;·&nbsp; 0.18s &nbsp;·&nbsp; 2 sources
                </div>
              </div>

              {/* Follow-up prompt */}
              <div className="flex items-center gap-2 rounded-md px-3 h-8 bg-surface-200 border border-border font-mono animate-fade-up animation-delay-600">
                <span className="text-accent">&rsaquo;</span>
                <span className="text-fg-subtle">
                  Ask a follow-up question…
                </span>
                <span className="ml-auto animate-cursor-blink text-accent">
                  ▋
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
