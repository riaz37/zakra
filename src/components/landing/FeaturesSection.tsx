'use client'

import {
  MessageSquare,
  Database,
  Shield,
  BookOpen,
  Building2,
  FileText,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimateIn } from "@/components/landing/AnimateIn";

const FEATURE_ICONS: Record<string, LucideIcon> = {
  nlq: MessageSquare,
  federation: Database,
  access: Shield,
  knowledge: BookOpen,
  multitenant: Building2,
  audit: FileText,
};

const FEATURE_KEYS = [
  "nlq",
  "federation",
  "access",
  "knowledge",
  "multitenant",
  "audit",
] as const;

export function FeaturesSection() {
  const t = useTranslations("landing.features");

  return (
    <section id="features" className="py-20 md:py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <AnimateIn className="max-w-xl mb-14">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.06em] text-accent">
            {t("eyebrow")}
          </p>
          <h2
            className="font-semibold text-foreground mb-4"
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
              lineHeight: 1.18,
              letterSpacing: "-0.03em",
            }}
          >
            {t("headline")}
          </h2>
          <p className="text-[14px] text-muted leading-relaxed">
            {t("subheadline")}
          </p>
        </AnimateIn>

        {/* Grid */}
        <AnimateIn delay={80}>
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 rounded-lg overflow-hidden border border-border"
            style={{ gap: "1px", background: "var(--color-border)" }}
          >
            {FEATURE_KEYS.map((key) => {
              const Icon = FEATURE_ICONS[key];
              return (
                <div
                  key={key}
                  className="group p-7 transition-colors duration-[120ms] bg-surface-100 hover:bg-surface-200"
                >
                  {/* Icon container */}
                  <div className="mb-5 inline-flex size-8 items-center justify-center rounded-md bg-accent-soft border border-accent-border">
                    <Icon
                      size={14}
                      strokeWidth={1.75}
                      className="text-accent"
                    />
                  </div>

                  {/* Tag */}
                  <p className="mb-2 text-[10px] uppercase tracking-[0.08em] text-fg-subtle">
                    {t(`items.${key}.tag`)}
                  </p>

                  <h3
                    className="font-semibold text-foreground mb-2 leading-tight"
                    style={{ fontSize: "14px", letterSpacing: "-0.015em" }}
                  >
                    {t(`items.${key}.title`)}
                  </h3>
                  <p className="text-[13px] text-muted leading-relaxed">
                    {t(`items.${key}.body`)}
                  </p>
                </div>
              );
            })}
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
