'use client'

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimateIn } from "@/components/landing/AnimateIn";

export function CtaSection() {
  const t = useTranslations("landing.cta");

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <AnimateIn>
          <div className="rounded-lg border border-accent-border bg-surface-100 px-10 py-14 text-center">
            <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.06em] text-accent">
              {t("eyebrow")}
            </p>

            <h2
              className="font-semibold text-foreground mb-4 mx-auto"
              style={{
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                lineHeight: 1.15,
                letterSpacing: "-0.03em",
                maxWidth: "520px",
              }}
            >
              {t("headline1")}
              <br />
              {t("headline2")}
            </h2>

            <p
              className="text-[14px] text-muted mx-auto mb-10"
              style={{ maxWidth: "380px" }}
            >
              {t("description")}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "default", size: "lg" }))}
              >
                {t("startFree")}
                <ArrowRight size={13} strokeWidth={2.5} className="rtl:rotate-180" />
              </Link>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                {t("talkSales")}
              </Link>
            </div>

            <p className="mt-6 text-[12px] text-fg-subtle">
              {t("disclaimer")}
            </p>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
