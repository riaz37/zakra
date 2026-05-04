import {
  MessageSquare,
  Database,
  Shield,
  BookOpen,
  Building2,
  FileText,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { AnimateIn } from "@/components/landing/AnimateIn";

interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
  tag: string;
}

const FEATURES: Feature[] = [
  {
    icon: MessageSquare,
    title: "Natural Language Queries",
    body: "Ask in plain English. Zakra queries your databases, surfaces the answer, and cites the exact source row — no SQL required.",
    tag: "AI Interface",
  },
  {
    icon: Database,
    title: "Multi-Source Federation",
    body: "PostgreSQL, MySQL, MongoDB, REST APIs. One connection panel, full query federation across all your data sources simultaneously.",
    tag: "Connectors",
  },
  {
    icon: Shield,
    title: "Fine-Grained Access Control",
    body: "Permissions scoped per company, department, and dataset. Nobody sees what they shouldn't. Role inheritance built in.",
    tag: "Security",
  },
  {
    icon: BookOpen,
    title: "Curated Knowledge Base",
    body: "Augment AI answers with verified articles, SOPs, and runbooks. Ground every response in company-approved truth.",
    tag: "Knowledge",
  },
  {
    icon: Building2,
    title: "Multi-Tenant Architecture",
    body: "Manage hundreds of tenants from one admin dashboard. Separate data, separate roles, unified control surface.",
    tag: "Enterprise",
  },
  {
    icon: FileText,
    title: "Audit & Compliance",
    body: "Every query logged, every access traced. Export-ready for SOC2, ISO 27001, and GDPR on demand.",
    tag: "Compliance",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <AnimateIn className="max-w-xl mb-14">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.06em] text-accent">
            Features
          </p>
          <h2
            className="font-semibold text-foreground mb-4"
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
              lineHeight: 1.18,
              letterSpacing: "-0.03em",
            }}
          >
            Everything your team needs
            <br />
            to get answers fast.
          </h2>
          <p className="text-[14px] text-muted leading-relaxed">
            Built for enterprise teams that need reliable answers from complex,
            multi-source data — without engineering overhead on every request.
          </p>
        </AnimateIn>

        {/* Grid */}
        <AnimateIn delay={80}>
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 rounded-lg overflow-hidden border border-border"
          style={{ gap: "1px", background: "var(--color-border)" }}
        >
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group p-7 transition-colors duration-[120ms] bg-surface-100 hover:bg-surface-200"
            >
              {/* Icon container */}
              <div className="mb-5 inline-flex size-8 items-center justify-center rounded-md bg-accent-soft border border-accent-border">
                <feature.icon
                  size={14}
                  strokeWidth={1.75}
                  className="text-accent"
                />
              </div>

              {/* Tag */}
              <p className="mb-2 text-[10px] uppercase tracking-[0.08em] text-fg-subtle">
                {feature.tag}
              </p>

              <h3
                className="font-semibold text-foreground mb-2 leading-tight"
                style={{ fontSize: "14px", letterSpacing: "-0.015em" }}
              >
                {feature.title}
              </h3>
              <p className="text-[13px] text-muted leading-relaxed">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
        </AnimateIn>
      </div>
    </section>
  );
}
