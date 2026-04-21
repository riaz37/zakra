import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Page() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <SiteNav />
      <Hero />
      <Features />
      <Timeline />
      <PricingPreview />
      <Footer />
    </main>
  );
}

function SiteNav() {
  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-md"
      style={{
        background: "var(--color-background-translucent)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
        <div className="flex items-center gap-10">
          <span
            className="text-[20px] tracking-[-0.11px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            kb<span style={{ color: "var(--color-accent)" }}>/</span>next
          </span>
          <ul className="hidden items-center gap-7 md:flex">
            {["Product", "Docs", "Pricing", "Changelog"].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="text-[14px] font-medium transition-colors duration-150 hover:[color:var(--color-error)]"
                  style={{ fontFamily: "system-ui" }}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="#"
            className="hidden px-3 py-2 text-[14px] font-medium transition-colors hover:[color:var(--color-error)] md:inline-block"
            style={{ fontFamily: "system-ui" }}
          >
            Sign in
          </a>
          <ThemeToggle />
          <button
            className="rounded-[var(--radius-lg)] px-[14px] py-[10px] text-[14px] transition-shadow duration-200 hover:shadow-[var(--shadow-focus)] hover:[color:var(--color-error)]"
            style={{
              background: "var(--color-surface-300)",
              fontFamily: "var(--font-display)",
            }}
          >
            Get started
          </button>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 pt-24 pb-20 md:pt-32 md:pb-28">
      <Pill>v0.1 — warm-minimal release</Pill>
      <h1
        className="mt-8 max-w-[900px] text-[clamp(40px,7vw,72px)]"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 400,
          lineHeight: 1.1,
          letterSpacing: "-2.16px",
        }}
      >
        A knowledge base that feels like{" "}
        <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
          old paper
        </span>{" "}
        and reads like code.
      </h1>
      <p
        className="mt-8 max-w-[640px] text-[17.28px]"
        style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 400,
          lineHeight: 1.5,
          color: "var(--color-muted)",
          fontFeatureSettings: '"cswh"',
        }}
      >
        Warm cream surfaces, oklab-space borders, and a three-voice type
        system. Designed for humans who live in their editor — and the agents
        who work alongside them.
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <PrimaryButton>Open workspace</PrimaryButton>
        <GhostButton>Read the docs →</GhostButton>
      </div>

      <EditorPreview />
    </section>
  );
}

function EditorPreview() {
  return (
    <div
      className="mt-16 overflow-hidden rounded-[var(--radius-lg)]"
      style={{
        background: "#1c1b15",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-elevated)",
      }}
    >
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <span className="h-[10px] w-[10px] rounded-full bg-[#f54e00]/70" />
        <span className="h-[10px] w-[10px] rounded-full bg-[#c08532]/70" />
        <span className="h-[10px] w-[10px] rounded-full bg-[#1f8a65]/70" />
        <span
          className="ml-4 text-[11px]"
          style={{
            fontFamily: "var(--font-mono)",
            color: "rgba(242,241,237,0.5)",
            letterSpacing: "-0.275px",
          }}
        >
          kb-next / src / app / page.tsx
        </span>
      </div>
      <pre
        className="overflow-x-auto px-6 py-5 text-[13px]"
        style={{
          fontFamily: "var(--font-mono)",
          lineHeight: 1.67,
          color: "#ebeae5",
        }}
      >
        <span style={{ color: "#c0a8dd" }}>export default function</span>{" "}
        <span style={{ color: "#9fbbe0" }}>Page</span>
        <span style={{ color: "#dfa88f" }}>()</span>
        {" {"}
        {"\n  "}
        <span style={{ color: "#c0a8dd" }}>return</span>{" "}
        <span style={{ color: "rgba(235,234,229,0.6)" }}>{"<Hero />"}</span>
        {"\n}"}
      </pre>
    </div>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center px-[10px] py-[3px] text-[14px]"
      style={{
        background: "var(--color-surface-400)",
        color: "var(--color-muted)",
        borderRadius: "var(--radius-pill)",
        fontFamily: "var(--font-display)",
        letterSpacing: "0.14px",
      }}
    >
      {children}
    </span>
  );
}

function PrimaryButton({ children }: { children: ReactNode }) {
  return (
    <button
      className="rounded-[var(--radius-lg)] px-[14px] py-[10px] text-[14px] transition-all duration-200 hover:shadow-[var(--shadow-focus)] hover:[color:var(--color-error)]"
      style={{
        background: "var(--color-surface-300)",
        fontFamily: "var(--font-display)",
      }}
    >
      {children}
    </button>
  );
}

function GhostButton({ children }: { children: ReactNode }) {
  return (
    <button
      className="rounded-[var(--radius-lg)] px-3 py-[10px] text-[14px] transition-colors hover:[color:var(--color-error)]"
      style={{
        background: "var(--color-muted-soft)",
        color: "var(--color-muted-strong)",
        fontFamily: "var(--font-display)",
      }}
    >
      {children}
    </button>
  );
}

function Features() {
  const items = [
    {
      kicker: "TYPE SYSTEM",
      title: "Three voices, one page.",
      body: "Gothic for display. Serif for editorial. Mono for the machine. Each voice stays in its lane — no font soup.",
    },
    {
      kicker: "OKLAB BORDERS",
      title: "Edges that feel drawn, not rendered.",
      body: "Perceptually uniform borders in the oklab color space sit consistently across every warm surface tone.",
    },
    {
      kicker: "WARM DEPTH",
      title: "Shadows like the page opened a space.",
      body: "Large-blur, low-opacity shadows produce diffused atmospheric lift instead of hard drop-edges.",
    },
  ];

  return (
    <section
      className="py-20 md:py-28"
      style={{ background: "var(--color-surface-100)" }}
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="max-w-[720px]">
          <MicroLabel>FOUNDATIONS</MicroLabel>
          <h2
            className="mt-4 text-[36px]"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              lineHeight: 1.2,
              letterSpacing: "-0.72px",
            }}
          >
            A design system for craft software.
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <FeatureCard key={item.title} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MicroLabel({ children }: { children: ReactNode }) {
  return (
    <span
      className="font-mono-label uppercase"
      style={{ color: "var(--color-muted)" }}
    >
      {children}
    </span>
  );
}

function FeatureCard({
  kicker,
  title,
  body,
}: {
  kicker: string;
  title: string;
  body: string;
}) {
  return (
    <article
      className="rounded-[var(--radius-lg)] p-6 transition-shadow duration-200 hover:shadow-[var(--shadow-ambient)]"
      style={{
        background: "var(--color-surface-400)",
        border: "1px solid var(--color-border)",
      }}
    >
      <MicroLabel>{kicker}</MicroLabel>
      <h3
        className="mt-3 text-[22px]"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 400,
          lineHeight: 1.3,
          letterSpacing: "-0.11px",
        }}
      >
        {title}
      </h3>
      <p
        className="mt-3 text-[17.28px]"
        style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 400,
          lineHeight: 1.5,
          color: "var(--color-muted)",
          fontFeatureSettings: '"cswh"',
        }}
      >
        {body}
      </p>
    </article>
  );
}

function Timeline() {
  const steps = [
    {
      tone: "var(--color-thinking)",
      label: "Thinking",
      text: "Scan the prompt, sketch the plan, name the uncertainty.",
    },
    {
      tone: "var(--color-grep)",
      label: "Grep",
      text: "Pattern-search the knowledge base for precedent and constraints.",
    },
    {
      tone: "var(--color-read)",
      label: "Read",
      text: "Pull the relevant pages into context — nothing more.",
    },
    {
      tone: "var(--color-edit)",
      label: "Edit",
      text: "Draft a change, verify against the rules, commit to the doc.",
    },
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="max-w-[720px]">
          <MicroLabel>AGENT TIMELINE</MicroLabel>
          <h2
            className="mt-4 text-[36px]"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              lineHeight: 1.2,
              letterSpacing: "-0.72px",
            }}
          >
            Watch the agent think, out loud.
          </h2>
          <p
            className="mt-5 text-[19.2px]"
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 500,
              lineHeight: 1.5,
              color: "var(--color-muted)",
              fontFeatureSettings: '"cswh"',
            }}
          >
            Every operation has a color. Every color is a promise about what
            the system is doing with your knowledge.
          </p>
        </div>

        <ol
          className="mt-14 rounded-[var(--radius-xl)] p-8"
          style={{
            background: "var(--color-surface-400)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-ambient)",
          }}
        >
          {steps.map((step, idx) => (
            <li key={step.label} className="relative flex gap-5 pb-8 last:pb-0">
              {idx < steps.length - 1 && (
                <span
                  aria-hidden
                  className="absolute left-[7px] top-5 w-px"
                  style={{
                    height: "calc(100% - 12px)",
                    background: "var(--color-border)",
                  }}
                />
              )}
              <span
                className="mt-1 block h-[14px] w-[14px] shrink-0 rounded-full"
                style={{
                  background: step.tone,
                  boxShadow: "var(--shadow-ring)",
                }}
              />
              <div>
                <div
                  className="text-[13px] font-medium"
                  style={{
                    fontFamily: "system-ui",
                    color: "var(--color-foreground)",
                  }}
                >
                  {step.label}
                </div>
                <p
                  className="mt-1 text-[16px]"
                  style={{
                    fontFamily: "var(--font-display)",
                    lineHeight: 1.5,
                    color: "var(--color-muted-strong)",
                  }}
                >
                  {step.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function PricingPreview() {
  const tiers = [
    {
      name: "Solo",
      price: "$0",
      note: "For the solitary reader.",
      features: ["1 workspace", "Local indexing", "Community support"],
      cta: "Start reading",
      featured: false,
    },
    {
      name: "Team",
      price: "$24",
      note: "Per seat, per month.",
      features: [
        "Shared workspaces",
        "Agent timeline",
        "Role-based access",
        "Priority support",
      ],
      cta: "Start a team",
      featured: true,
    },
  ];

  return (
    <section
      className="py-20 md:py-28"
      style={{ background: "var(--color-surface-100)" }}
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="max-w-[720px]">
          <MicroLabel>PRICING</MicroLabel>
          <h2
            className="mt-4 text-[36px]"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              lineHeight: 1.2,
              letterSpacing: "-0.72px",
            }}
          >
            Priced like a paperback, scales like a shelf.
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className="rounded-[var(--radius-xl)] p-8"
              style={{
                background: tier.featured
                  ? "var(--color-surface-400)"
                  : "var(--color-surface-200)",
                border: tier.featured
                  ? "1px solid var(--color-border-medium)"
                  : "1px solid var(--color-border)",
                boxShadow: tier.featured
                  ? "var(--shadow-elevated)"
                  : "var(--shadow-ring)",
              }}
            >
              <div className="flex items-baseline justify-between">
                <h3
                  className="text-[26px]"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 400,
                    letterSpacing: "-0.325px",
                    lineHeight: 1.25,
                  }}
                >
                  {tier.name}
                </h3>
                {tier.featured && (
                  <span
                    className="px-2 py-[2px] text-[11px]"
                    style={{
                      background: "var(--color-surface-500)",
                      color: "var(--color-muted)",
                      borderRadius: "var(--radius-pill)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    Most popular
                  </span>
                )}
              </div>
              <div className="mt-6 flex items-baseline gap-2">
                <span
                  className="text-[48px]"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 400,
                    letterSpacing: "-1.44px",
                    lineHeight: 1,
                  }}
                >
                  {tier.price}
                </span>
                <span
                  className="text-[14px]"
                  style={{
                    fontFamily: "var(--font-serif)",
                    color: "var(--color-muted)",
                  }}
                >
                  {tier.note}
                </span>
              </div>
              <ul className="mt-8 space-y-3">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-[17.28px]"
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontWeight: 400,
                      lineHeight: 1.5,
                      color: "var(--color-muted-strong)",
                      fontFeatureSettings: '"cswh"',
                    }}
                  >
                    <span
                      className="mt-[10px] h-[6px] w-[6px] shrink-0 rounded-full"
                      style={{ background: "var(--color-accent)" }}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className="mt-8 w-full rounded-[var(--radius-lg)] px-[14px] py-[12px] text-[14px] transition-all duration-200 hover:shadow-[var(--shadow-focus)] hover:[color:var(--color-error)]"
                style={{
                  background: tier.featured
                    ? "var(--color-foreground)"
                    : "var(--color-surface-300)",
                  color: tier.featured
                    ? "var(--color-surface-200)"
                    : "var(--color-foreground)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {tier.cta}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      className="py-12"
      style={{ borderTop: "1px solid var(--color-border)" }}
    >
      <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-4 px-6 md:flex-row md:items-center">
        <span
          className="text-[14px]"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-muted)",
          }}
        >
          kb-next · warm-minimal · v0.1
        </span>
        <div className="flex gap-6">
          {["Privacy", "Terms", "Changelog"].map((link) => (
            <a
              key={link}
              href="#"
              className="text-[14px] transition-colors hover:[color:var(--color-error)]"
              style={{
                fontFamily: "system-ui",
                color: "var(--color-muted)",
              }}
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
