const FEATURE_ROWS = [
  {
    index: '01',
    eyebrow: 'AI Chat',
    title: 'Ask your data anything in plain English.',
    description:
      'No SQL required. The assistant reads your schema, runs queries on your behalf, and returns answers with the underlying tables — fully traceable.',
    bullets: ['Schema-aware responses', 'Source-cited results', 'Conversation history'],
  },
  {
    index: '02',
    eyebrow: 'Companies & Users',
    title: 'Multi-tenant hierarchy for enterprise teams.',
    description:
      'Manage organisations, sub-companies, roles, and permissions from one place. Designed for the way real enterprises actually structure access.',
    bullets: ['Org & sub-org hierarchy', 'Role-based access control', 'Audit-ready activity log'],
  },
  {
    index: '03',
    eyebrow: 'Database Connections',
    title: 'Connect PostgreSQL, MySQL, and more.',
    description:
      'Your data stays in your infrastructure. ESAP-KB connects through secure read-only credentials and never copies your tables.',
    bullets: ['Read-only by default', 'In-VPC connection support', 'No data egress'],
  },
] as const;

export function Features() {
  return (
    <section id="features" className="bg-background">
      <div className="mx-auto w-full max-w-6xl px-6">
        {/* Section header */}
        <div className="border-b border-border py-20 sm:py-28">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
            Capabilities
          </span>
          <h2 className="mt-5 max-w-xl text-balance font-sans text-[2rem] font-semibold leading-[1.15] tracking-[-0.025em] text-foreground sm:text-[2.5rem]">
            Everything your team needs.
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-[1.55] text-muted">
            Three primitives. One workspace. Built for how technical teams
            actually work with their data.
          </p>
        </div>

        {/* Feature rows — full-width two-column text layout */}
        <div className="divide-y divide-border">
          {FEATURE_ROWS.map((row) => (
            <div
              key={row.index}
              className="grid grid-cols-1 gap-8 py-16 sm:py-20 lg:grid-cols-12 lg:gap-16"
            >
              {/* Left: index + eyebrow */}
              <div className="lg:col-span-4">
                <div className="flex items-baseline gap-4">
                  <span
                    aria-hidden
                    className="font-mono text-[11px] tracking-[0.04em] text-muted"
                  >
                    {row.index}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-accent">
                    {row.eyebrow}
                  </span>
                </div>
                <h3 className="mt-4 text-balance font-sans text-[1.625rem] font-semibold leading-[1.2] tracking-[-0.02em] text-foreground sm:text-[1.875rem]">
                  {row.title}
                </h3>
              </div>

              {/* Right: description + bullets */}
              <div className="flex flex-col justify-center lg:col-span-7 lg:col-start-6">
                <p className="text-pretty text-[15px] leading-[1.65] text-muted">
                  {row.description}
                </p>
                <ul className="mt-7 flex flex-col gap-2.5">
                  {row.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-center gap-3 text-[14px] text-foreground"
                    >
                      <span
                        aria-hidden
                        className="inline-block h-px w-4 shrink-0 bg-accent"
                      />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
