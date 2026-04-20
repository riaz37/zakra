import {
  ArrowRight,
  Check,
  Eye,
  FileText,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-white text-[#0d0d0d]">
      <header className="sticky top-0 z-40 border-b border-[rgba(0,0,0,0.05)] bg-white/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4 lg:px-8">
          <a href="#" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#18e299]">
              <Sparkles
                className="h-3.5 w-3.5 text-[#0d0d0d]"
                strokeWidth={2.5}
              />
            </div>
            <span className="text-[15px] font-semibold tracking-sub">
              ESAP-KB
            </span>
          </a>
          <div className="hidden items-center gap-7 md:flex">
            {["Product", "Pricing", "Docs", "Blog"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-[14px] font-medium text-[#0d0d0d] transition-colors hover:text-[#0fa76e]"
              >
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <a
              href="#"
              className="hidden rounded-full px-3 py-1.5 text-[14px] font-medium text-[#0d0d0d] transition-colors hover:text-[#0fa76e] sm:inline-block"
            >
              Sign in
            </a>
            <a
              href="#"
              className="shadow-button inline-flex items-center gap-1.5 rounded-full bg-[#0d0d0d] px-5 py-2 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
            >
              Get started
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </a>
          </div>
        </nav>
      </header>

      <section className="hero-gradient relative overflow-hidden">
        <div className="mx-auto max-w-[1200px] px-6 pb-24 pt-24 lg:px-8 lg:pb-32 lg:pt-32">
          <div className="mx-auto max-w-[860px] text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[rgba(0,0,0,0.05)] bg-white/80 px-3 py-1 backdrop-blur-sm">
              <span className="flex h-1.5 w-1.5 rounded-full bg-[#18e299]" />
              <span className="font-mono-label text-[11px] text-[#0fa76e]">
                v2.4 · semantic retrieval shipped
              </span>
            </div>

            <h1 className="font-display text-[40px] leading-[1.1] tracking-[-0.8px] text-[#0d0d0d] md:text-[56px] md:leading-[1.08] lg:text-[64px] lg:leading-[1.05] lg:tracking-[-1.28px]">
              The knowledge base your team can actually trust.
            </h1>

            <p className="mx-auto mt-6 max-w-[640px] text-[17px] leading-[1.55] text-[#666666] md:text-[18px]">
              ESAP-KB is an admin surface for teams that treat institutional
              memory as a first-class product. Semantic search, transparent
              agents, auditable edits.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#"
                className="shadow-button inline-flex items-center gap-2 rounded-full bg-[#0d0d0d] px-6 py-2.5 text-[15px] font-medium text-white transition-opacity hover:opacity-90"
              >
                Get started
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </a>
              <a
                href="#"
                className="inline-flex items-center rounded-full border border-[rgba(0,0,0,0.08)] bg-white px-6 py-2.5 text-[15px] font-medium text-[#0d0d0d] transition-opacity hover:opacity-90"
              >
                Request demo
              </a>
            </div>
          </div>

          <div className="mt-24 grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="shadow-card rounded-2xl border border-[rgba(0,0,0,0.05)] bg-white p-6 text-center"
              >
                <div className="font-display text-[32px] leading-none tracking-[-0.64px] text-[#0d0d0d]">
                  {stat.value}
                </div>
                <div className="mt-2 text-[13px] font-medium text-[#666666]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[rgba(0,0,0,0.05)] px-6 py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto mb-14 max-w-[720px] text-center">
            <div className="font-mono-label mb-4 text-[12px] text-[#0fa76e]">
              Capabilities
            </div>
            <h2 className="font-display text-[36px] leading-[1.1] tracking-[-0.72px] text-[#0d0d0d] md:text-[40px] md:tracking-[-0.8px]">
              Four primitives. Predictable APIs.
            </h2>
            <p className="mx-auto mt-5 max-w-[560px] text-[16px] leading-[1.55] text-[#666666]">
              Composed through a single typed client. No configuration debt,
              no fragile glue code.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="shadow-card group flex flex-col rounded-2xl border border-[rgba(0,0,0,0.05)] bg-white p-6 transition-colors hover:border-[rgba(0,0,0,0.1)]"
              >
                <div className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#d4fae8]">
                  <feature.icon
                    className="h-4.5 w-4.5 text-[#0fa76e]"
                    strokeWidth={2}
                  />
                </div>
                <div className="font-mono-label mb-2 text-[11px] text-[#666666]">
                  {feature.tag}
                </div>
                <h3 className="font-display mb-2 text-[20px] leading-[1.3] tracking-[-0.4px] text-[#0d0d0d]">
                  {feature.title}
                </h3>
                <p className="text-[14px] leading-[1.55] text-[#666666]">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[rgba(0,0,0,0.05)] bg-[#fafafa] px-6 py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <div className="font-mono-label mb-4 text-[12px] text-[#0fa76e]">
                Developer experience
              </div>
              <h2 className="font-display text-[36px] leading-[1.1] tracking-[-0.72px] text-[#0d0d0d] md:text-[40px] md:tracking-[-0.8px]">
                Typed at every boundary.
              </h2>
              <p className="mt-5 max-w-[460px] text-[16px] leading-[1.55] text-[#666666]">
                Zod schemas at the edge. TanStack Query for cache correctness.
                An axios instance that refreshes tokens so you don&apos;t have
                to think about auth.
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  "Schema-validated requests and responses",
                  "Queue-safe JWT refresh on 401",
                  "Server Components by default",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-[15px] text-[#333333]"
                  >
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#d4fae8]">
                      <Check
                        className="h-3 w-3 text-[#0fa76e]"
                        strokeWidth={3}
                      />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="shadow-card rounded-3xl border border-[rgba(0,0,0,0.05)] bg-[#0d0d0d] p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[rgba(255,255,255,0.15)]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[rgba(255,255,255,0.15)]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[rgba(255,255,255,0.15)]" />
                </div>
                <span className="font-mono-label text-[10px] text-[rgba(255,255,255,0.4)]">
                  src/hooks/useArticle.ts
                </span>
              </div>
              <pre className="overflow-x-auto font-mono text-[13px] leading-[1.7] text-[rgba(255,255,255,0.9)]">
                <code>
                  <span className="text-[rgba(255,255,255,0.35)]">
                    {"// typed. validated. cached."}
                  </span>
                  {"\n"}
                  <span className="text-[#18e299]">export const</span>{" "}
                  <span className="text-[#ededed]">useArticle</span>{" = ("}
                  <span className="text-[#ededed]">id</span>
                  {": "}
                  <span className="text-[#18e299]">string</span>
                  {") => {"}
                  {"\n  "}
                  <span className="text-[#18e299]">return</span>{" "}
                  <span className="text-[#ededed]">useQuery</span>
                  {"({"}
                  {"\n    queryKey: ["}
                  <span className="text-[#d4fae8]">&apos;article&apos;</span>
                  {", id],"}
                  {"\n    queryFn: () => "}
                  <span className="text-[#ededed]">fetchArticle</span>
                  {"(id),"}
                  {"\n    staleTime: "}
                  <span className="text-[#18e299]">60_000</span>
                  {","}
                  {"\n  });"}
                  {"\n};"}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[rgba(0,0,0,0.05)] px-6 py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-[1200px] text-center">
          <div className="font-mono-label mb-4 text-[12px] text-[#666666]">
            Trusted by teams at
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {["Linear", "Vercel", "Stripe", "Ramp", "Notion"].map((name) => (
              <div
                key={name}
                className="flex h-16 items-center justify-center rounded-2xl border border-[rgba(0,0,0,0.05)] bg-white text-[15px] font-semibold text-[#888888] tracking-sub"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[rgba(0,0,0,0.05)] px-6 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-[1200px]">
          <div className="hero-gradient shadow-card overflow-hidden rounded-3xl border border-[rgba(0,0,0,0.05)] px-8 py-20 text-center">
            <div className="font-mono-label mb-4 text-[12px] text-[#0fa76e]">
              Start free
            </div>
            <h2 className="font-display mx-auto max-w-[18ch] text-[36px] leading-[1.1] tracking-[-0.72px] text-[#0d0d0d] md:text-[48px] md:tracking-[-0.96px]">
              Make your knowledge base a winning advantage.
            </h2>
            <p className="mx-auto mt-5 max-w-[520px] text-[16px] leading-[1.55] text-[#666666]">
              Thirty days full access. No credit card. SSO and audit logs on
              every tier.
            </p>
            <form className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row">
              <input
                type="email"
                placeholder="you@work.com"
                className="flex-1 rounded-full border border-[rgba(0,0,0,0.08)] bg-white px-4 py-2.5 text-[14px] text-[#0d0d0d] placeholder:text-[#888888] focus:border-[#18e299] focus:outline-none focus:ring-1 focus:ring-[#18e299]"
              />
              <button
                type="submit"
                className="shadow-button inline-flex items-center justify-center gap-1.5 rounded-full bg-[#0d0d0d] px-6 py-2.5 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
              >
                Get started
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className="border-t border-[rgba(0,0,0,0.05)] px-6 py-10 lg:px-8">
        <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#18e299]">
              <Sparkles
                className="h-3 w-3 text-[#0d0d0d]"
                strokeWidth={2.5}
              />
            </div>
            <span className="text-[13px] font-semibold tracking-sub">
              ESAP-KB
            </span>
          </div>
          <div className="font-mono-label text-[11px] text-[#888888]">
            © 2026 · Next.js 16 · Tailwind v4
          </div>
        </div>
      </footer>
    </div>
  );
}

const stats = [
  { value: "1.2M", label: "documents indexed" },
  { value: "18ms", label: "avg query latency" },
  { value: "99.99%", label: "uptime SLA" },
  { value: "240", label: "active workspaces" },
];

const features = [
  {
    tag: "Search",
    title: "Retrieval that reads intent.",
    description:
      "Hybrid vector and lexical scoring, reranked per query. Results in milliseconds.",
    icon: Search,
  },
  {
    tag: "Compose",
    title: "Blocks that cite themselves.",
    description:
      "Author once, reuse everywhere. Every block remembers where it came from.",
    icon: FileText,
  },
  {
    tag: "Agents",
    title: "Transparent by default.",
    description:
      "Thinking, grep, read, edit — surfaced as a timeline you can pause and inspect.",
    icon: Zap,
  },
  {
    tag: "Audit",
    title: "Access control, built in.",
    description:
      "Role-based permissions, per-document ACLs, auditable trails from day one.",
    icon: Eye,
  },
];
