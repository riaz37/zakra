'use client';

import Image from "next/image";
import { ArrowRight, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEMO_EMAIL = "sales@esap.ai";

function handleBookDemo() {
  window.location.href = `mailto:${DEMO_EMAIL}`;
  navigator.clipboard.writeText(DEMO_EMAIL).then(() => {
    toast.success(`Email copied: ${DEMO_EMAIL}`, {
      description: "No mail client? Paste it into your preferred email app.",
    });
  });
}

export function HeroSection() {
  const t = useTranslations("landing.hero");

  return (
    <section className="relative overflow-hidden pt-24 pb-20 px-6">
      <div className="relative max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <div>
            <div className="inline-flex items-center mb-8 animate-fade-up">
              <Link
                href="/login"
                className="inline-flex items-center gap-3 rounded-full border border-border-medium bg-surface-200 px-4 h-9 text-[13px] text-muted transition-colors duration-[120ms] hover:border-border-strong hover:text-foreground"
              >
                <span>{t("badge")}</span>
                <ChevronRight size={14} strokeWidth={1.5} className="text-fg-subtle rtl:rotate-180" />
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
              {t("headline1")}
              <br />
              <span className="text-accent">{t("headline2")}</span>
              <br />
              {t("headline3")}
            </h1>

            <p className="text-[15px] text-muted leading-relaxed max-w-md mb-10 animate-fade-up animation-delay-150">
              {t("description")}
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-10 animate-fade-up animation-delay-200">
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

            <div className="animate-fade-up animation-delay-300">
              <p className="text-[12px] text-muted mb-4">
                {t.rich("trustedBy", {
                  count: "800",
                  strong: (chunks) => (
                    <strong className="text-foreground font-medium">{chunks}</strong>
                  ),
                })}
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 opacity-30 grayscale brightness-0 dark:invert">
                <Image src="/partners/EMp.svg" alt="Partner" width={80} height={20} className="h-4 w-auto" />
                <Image src="/partners/EMp-1.svg" alt="Partner" width={80} height={20} className="h-4 w-auto" />
                <Image src="/partners/EMp-3.svg" alt="Partner" width={80} height={20} className="h-4 w-auto" />
                <Image src="/partners/EMp-4.svg" alt="Partner" width={80} height={20} className="h-4 w-auto" />
              </div>
            </div>
          </div>

          {/* Right — terminal */}
          <div
            className="rounded-xl border border-border-medium overflow-hidden bg-code-canvas animate-fade-up animation-delay-200"
            style={{ boxShadow: "var(--shadow-elevated)" }}
          >
            {/* Titlebar */}
            <div className="flex items-center gap-2 px-4 h-10 border-b border-border">
              <span className="size-2.5 rounded-full bg-error opacity-70" />
              <span className="size-2.5 rounded-full bg-warning opacity-70" />
              <span className="size-2.5 rounded-full bg-accent opacity-70" />
              <span className="ms-3 text-[11px] font-mono text-fg-subtle">
                {t("terminal.title")}
              </span>
            </div>

            {/* Content */}
            <div className="p-5 text-[12px] leading-relaxed space-y-4">
              <div className="font-mono animate-fade-up animation-delay-300">
                <span className="text-fg-subtle">user@acme &rsaquo; </span>
                <span className="text-foreground">{t("terminal.userPrompt")}</span>
              </div>

              <div className="text-fg-subtle animate-fade-up animation-delay-400">
                &darr;{" "}
                {t.rich("terminal.thinking", {
                  db1: (chunks) => <span className="font-mono text-[var(--color-read)]">{chunks}</span>,
                  db2: (chunks) => <span className="font-mono text-[var(--color-read)]">{chunks}</span>,
                })}
              </div>

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

              <div className="rounded-md p-3 bg-accent-soft border border-accent-border animate-fade-up animation-delay-600">
                <div className="flex items-baseline gap-2 mb-1">
                  <span
                    className="text-[22px] font-semibold font-mono text-accent"
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    2,847
                  </span>
                  <span className="text-muted">{t("terminal.activeUsers")}</span>
                </div>
                <div className="text-[11px] text-[var(--color-grep)] font-mono">
                  {t("terminal.growth")}
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-md px-3 h-8 bg-surface-200 border border-border font-mono animate-fade-up animation-delay-600">
                <span className="text-accent">&rsaquo;</span>
                <span className="text-fg-subtle">{t("terminal.followUp")}</span>
                <span className="ms-auto animate-cursor-blink text-accent">▋</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
