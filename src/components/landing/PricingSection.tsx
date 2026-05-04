import Link from "next/link";
import { Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Plan {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}

const PLANS: Plan[] = [
  {
    name: "Starter",
    price: "$299",
    period: "/month",
    description: "For teams getting started with enterprise knowledge management.",
    features: [
      "Up to 10 users",
      "5 database connections",
      "500K queries per month",
      "Knowledge base (unlimited articles)",
      "Role-based access control",
      "Email support",
    ],
    cta: "Start free trial",
    highlighted: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For organizations that need scale, security, and dedicated support.",
    features: [
      "Unlimited users",
      "Unlimited connections",
      "Unlimited queries",
      "Dedicated infrastructure",
      "SSO & SAML",
      "SLA + 24/7 support",
      "SOC2 & GDPR compliance exports",
      "Custom data retention",
    ],
    cta: "Talk to sales",
    highlighted: true,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-xl mb-14">
          <p className="text-micro uppercase tracking-[0.06em] text-accent font-mono mb-4">
            Pricing
          </p>
          <h2 className="text-section text-foreground font-semibold leading-[1.2] tracking-[-0.03em] mb-4">
            Simple, predictable pricing.
          </h2>
          <p className="text-body text-muted leading-relaxed">
            Start with a 14-day free trial. No credit card required. Upgrade when your team is ready.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "rounded-lg p-8 border flex flex-col",
                plan.highlighted
                  ? "bg-surface-200 border-accent/30 border-l-2 border-l-accent"
                  : "bg-surface-200 border-border-medium"
              )}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[15px] font-medium text-foreground tracking-[-0.015em]">
                  {plan.name}
                </h3>
                {plan.highlighted && (
                  <span className="text-micro uppercase tracking-[0.06em] text-accent bg-accent-soft border border-accent-border px-2 py-0.5 rounded-sm font-mono">
                    Most popular
                  </span>
                )}
              </div>

              <div className="mb-2">
                <span className="text-[2.5rem] font-semibold text-foreground font-sans leading-none">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-body text-muted ml-1">{plan.period}</span>
                )}
              </div>

              <p className="text-body text-muted mb-8 leading-relaxed">
                {plan.description}
              </p>

              <ul className="space-y-3 mb-10 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      size={14}
                      strokeWidth={2}
                      className="text-accent mt-0.5 shrink-0"
                    />
                    <span className="text-body text-muted">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: plan.highlighted ? "default" : "outline", size: "lg" }),
                  "w-full justify-center"
                )}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
