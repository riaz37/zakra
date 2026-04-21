import Image from "next/image";
import { LandingThemeToggle } from "@/components/landing-theme-toggle";
import { MobileMenu } from "@/components/mobile-menu";
import { RevealOnScroll } from "@/components/reveal-on-scroll";

const NAV_LINKS = [
  { href: "#product", label: "Product" },
  { href: "#docs", label: "Docs" },
  { href: "#changelog", label: "Changelog" },
];

const FEATURE_ROWS = [
  {
    eyebrow: "Connections",
    title: "Connect once. Query anywhere.",
    body: "Zakra speaks Postgres, MySQL, MSSQL, Snowflake, and BigQuery. Credentials are encrypted at rest with per-connection keys.",
    image: "/screenshots/connections.png",
    alt: "DB Connections grid with status indicators",
    reverse: false,
  },
  {
    eyebrow: "Access control",
    title: "Permissions that match your schema.",
    body: "Grant read or write on a specific table, not a whole database. Changes are audit-logged, reviewable, and reversible.",
    image: "/screenshots/table-access.png",
    alt: "Table access matrix showing per-role read and write permissions across schemas",
    reverse: true,
  },
  {
    eyebrow: "Assistant",
    title: "Ask your data. Get a report.",
    body: "The assistant reads your schema and writes the SQL. Results stream into a shareable report — with the query still editable.",
    image: "/screenshots/chat.png",
    alt: "Chat canvas with an assistant reply, query context, and token usage",
    reverse: false,
  },
];

const BUILT_ITEMS = [
  {
    title: "Self-hosted or managed.",
    body: "Ship it on your infra with the Docker image or the Helm chart. Or run on Zakra Cloud — same binary, same release train.",
  },
  {
    title: "SSO on day one.",
    body: "SAML and OIDC are first-class, not gated behind an Enterprise sticker. SCIM lands in Q3.",
  },
  {
    title: "The audit log is Postgres.",
    body: "Every permission change, query, and login writes to a table you can query. No SaaS event bus, no proprietary format.",
  },
  {
    title: "Every write has a revert.",
    body: (
      <>
        Granted the wrong table? Click revert. Dropped a role? Click revert. No{" "}
        <code>ARE YOU SURE?</code> theater, no destructive defaults.
      </>
    ),
  },
];

const CHANGELOG = [
  {
    date: "Apr 15, 2026",
    version: "v0.18",
    line: (
      <>
        BigQuery connector, <code>INFORMATION_SCHEMA</code> introspection, and
        sub-second autocomplete on schemas over 10k tables.
      </>
    ),
  },
  {
    date: "Apr 02, 2026",
    version: "v0.17",
    line: "Per-connection encryption keys. Rotate without re-entering credentials. Breaking change documented in the migration guide.",
  },
  {
    date: "Mar 20, 2026",
    version: "v0.16",
    line: (
      <>
        Scheduled reports with cron syntax, email delivery, and a{" "}
        <code>--dry-run</code> flag for CI.
      </>
    ),
  },
];

const FOOTER_COLS = [
  {
    head: "Product",
    links: ["Overview", "Connections", "Access control", "Assistant", "Reports"],
  },
  {
    head: "Docs",
    links: ["Quickstart", "Self-hosting", "API reference", "CLI"],
  },
  {
    head: "Company",
    links: ["Changelog", "Careers", "Contact"],
  },
  {
    head: "Legal",
    links: ["Terms", "Privacy", "DPA", "Subprocessors"],
  },
];

export default function Home() {
  return (
    <>
      <RevealOnScroll />

      {/* NAV */}
      <header
        id="nav"
        className="sticky top-0 z-50 flex h-[72px] items-center border-b border-transparent transition-[background-color,border-color,backdrop-filter] duration-200 [&.scrolled]:border-b-[var(--border)] [&.scrolled]:bg-[color-mix(in_oklab,var(--surface)_85%,transparent)] [&.scrolled]:backdrop-blur-xl"
      >
        <div className="mx-auto flex w-full max-w-[1200px] items-center gap-8 px-8 max-md:px-5">
          <a
            href="#"
            aria-label="Zakra, home"
            className="inline-flex items-center gap-[10px] font-display text-[18px] font-semibold tracking-[-0.01em] text-[var(--fg)]"
          >
            <span className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-[7px] bg-[var(--primary)] font-display text-[15px] font-bold text-[var(--primary-fg)]">
              Z
            </span>
            <span>Zakra</span>
          </a>
          <nav
            aria-label="Primary"
            className="flex items-center gap-7 text-[14px] text-[var(--fg-muted)] max-md:hidden"
          >
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="transition-colors duration-150 hover:text-[var(--fg)]"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <LandingThemeToggle />
            <a href="/login" className="btn btn-ghost btn-sm max-md:hidden">
              Sign in
            </a>
            <a href="/dashboard" className="btn btn-primary btn-sm">
              Open admin
            </a>
            <MobileMenu />
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden py-[96px_64px] max-md:py-[56px_32px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[-140px] h-[700px] w-[1100px] -translate-x-1/2 opacity-20 blur-[20px] dark:opacity-[0.15]"
          style={{
            background:
              "radial-gradient(closest-side, var(--primary) 0%, transparent 72%)",
          }}
        />
        <div className="relative mx-auto max-w-[960px] px-8 max-md:px-5">
          <div className="reveal">
            <span className="mb-5 inline-block font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">
              Internal admin for data teams
            </span>
            <h1 className="mb-5 max-w-[18ch] font-display text-[56px] font-semibold leading-[60px] tracking-[-0.02em] text-[var(--fg)] max-md:text-[40px] max-md:leading-[44px]">
              One admin for your databases, pipelines, and data assistants.
            </h1>
            <p
              className="mb-8 max-w-[60ch] text-[17px] leading-[26px] text-[var(--fg-muted)] max-md:text-[16px]"
              style={{ textWrap: "pretty" }}
            >
              Zakra connects to Postgres, MySQL, Snowflake, and BigQuery. Manage
              table-level access, run SQL, and ship reports — from the same
              window.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a href="/dashboard" className="btn btn-primary btn-lg">
                Open admin
              </a>
              <a
                href="/login"
                className="btn btn-ghost btn-lg group inline-flex items-center"
              >
                Sign in
                <span className="ml-1 text-[var(--fg-muted)] transition-transform duration-150 group-hover:translate-x-[2px] group-hover:text-[var(--fg)]">
                  →
                </span>
              </a>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-[22px] gap-y-2 text-[13px] text-[var(--fg-subtle)]">
              {[
                "Self-hosted or managed",
                "SAML / OIDC on day one",
                "Postgres-backed audit log",
              ].map((m) => (
                <span key={m} className="inline-flex items-center gap-[6px]">
                  <span className="inline-block h-2 w-2 rounded-full bg-[var(--primary)]" />
                  {m}
                </span>
              ))}
            </div>
          </div>

          <div className="reveal-shot relative mt-[72px]">
            <Image
              src="/screenshots/dashboard.png"
              alt="Zakra dashboard showing active connections, query volume, and system health"
              width={1800}
              height={1200}
              priority
              sizes="(max-width: 960px) 100vw, 960px"
              className="block w-full rounded-[16px] border border-[var(--border-strong)] bg-[var(--surface)]"
              style={{
                boxShadow:
                  "var(--shadow-lg), 0 32px 80px -24px color-mix(in oklab, var(--primary) 35%, transparent)",
              }}
            />
          </div>
        </div>
      </section>

      {/* FEATURE ROWS */}
      <section id="product" className="py-24 max-md:py-[72px]">
        <div className="mx-auto max-w-[1200px] px-8 max-md:px-5">
          <div className="flex flex-col gap-[120px] max-md:gap-[72px]">
            {FEATURE_ROWS.map((row) => (
              <div
                key={row.eyebrow}
                className={`grid items-center gap-[72px] max-md:gap-8 max-md:grid-cols-1 ${
                  row.reverse
                    ? "grid-cols-[1.15fr_1fr] max-md:grid-flow-row"
                    : "grid-cols-[1fr_1.15fr]"
                }`}
              >
                <div
                  className={`reveal ${row.reverse ? "md:order-2" : ""} max-md:order-1`}
                >
                  <span className="mb-[14px] inline-block font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">
                    {row.eyebrow}
                  </span>
                  <h3 className="mb-[14px] font-display text-[28px] font-semibold leading-[34px] tracking-[-0.015em] text-[var(--fg)]">
                    {row.title}
                  </h3>
                  <p
                    className="mb-5 max-w-[46ch] text-[16px] leading-[26px] text-[var(--fg-muted)]"
                    style={{ textWrap: "pretty" }}
                  >
                    {row.body}
                  </p>
                  <a
                    href="#docs"
                    className="group inline-flex items-center gap-[6px] text-[14px] font-medium text-[var(--fg)] transition-colors duration-150 hover:text-[var(--primary)]"
                  >
                    See the docs
                    <span className="text-[var(--fg-muted)] transition-[transform,color] duration-150 group-hover:translate-x-[2px] group-hover:text-[var(--primary)]">
                      →
                    </span>
                  </a>
                </div>
                <div
                  className={`reveal-shot relative ${row.reverse ? "md:order-1" : ""} max-md:order-2`}
                >
                  <Image
                    src={row.image}
                    alt={row.alt}
                    width={1600}
                    height={1100}
                    sizes="(max-width: 900px) 100vw, 660px"
                    className="block w-full rounded-[14px] border border-[var(--border)] bg-[var(--surface)] shadow-token-lg"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BUILT BY */}
      <section className="border-y border-[var(--border)] bg-[var(--surface-muted)] py-24 max-md:py-[72px]">
        <div className="mx-auto max-w-[1200px] px-8 max-md:px-5">
          <div className="reveal mx-auto mb-12 max-w-[680px] text-center">
            <span className="mb-5 inline-block font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
              How it&apos;s built
            </span>
            <h2 className="mb-3 font-display text-[36px] font-semibold leading-[42px] tracking-[-0.015em] text-[var(--fg)] max-md:text-[28px] max-md:leading-[34px]">
              Built by people who&apos;ve run data platforms.
            </h2>
            <p
              className="text-[16px] leading-[26px] text-[var(--fg-muted)]"
              style={{ textWrap: "pretty" }}
            >
              Engineering decisions you&apos;ll recognize. No surprises in the
              architecture.
            </p>
          </div>
          <div className="reveal mx-auto grid max-w-[960px] grid-cols-2 gap-x-[72px] gap-y-12 max-md:grid-cols-1 max-md:gap-8">
            {BUILT_ITEMS.map((item) => (
              <div key={item.title}>
                <h4 className="mb-2 font-display text-[17px] font-semibold leading-6 text-[var(--fg)]">
                  {item.title}
                </h4>
                <p className="max-w-[42ch] text-[15px] leading-6 text-[var(--fg-muted)]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHANGELOG */}
      <section id="changelog" className="py-24 max-md:py-[72px]">
        <div className="mx-auto max-w-[1200px] px-8 max-md:px-5">
          <div className="reveal mx-auto mb-14 max-w-[680px] text-center">
            <span className="mb-5 inline-block font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
              Changelog
            </span>
            <h2 className="mb-3 font-display text-[36px] font-semibold leading-[42px] tracking-[-0.015em] text-[var(--fg)] max-md:text-[28px] max-md:leading-[34px]">
              Shipped recently.
            </h2>
            <p className="text-[16px] leading-[26px] text-[var(--fg-muted)]">
              The last three releases. Everything else is in the full
              changelog.
            </p>
          </div>

          <div className="reveal mx-auto max-w-[760px] overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--surface)]">
            {CHANGELOG.map((item, i) => (
              <div
                key={item.version}
                className={`grid items-baseline gap-6 px-6 py-5 max-md:grid-cols-[90px_1fr] md:grid-cols-[120px_80px_1fr] ${
                  i !== CHANGELOG.length - 1
                    ? "border-b border-[var(--border)]"
                    : ""
                }`}
              >
                <span className="font-mono text-[12px] tracking-[0.02em] text-[var(--fg-subtle)]">
                  {item.date}
                </span>
                <span className="font-mono text-[12px] font-medium text-[var(--primary)] max-md:col-start-2 max-md:row-start-2 max-md:-mt-[14px]">
                  {item.version}
                </span>
                <span className="text-[15px] leading-6 text-[var(--fg)] max-md:col-span-full [&_code]:rounded [&_code]:bg-[var(--surface-muted)] [&_code]:px-[6px] [&_code]:py-[1px] [&_code]:font-mono [&_code]:text-[13px]">
                  {item.line}
                </span>
              </div>
            ))}
          </div>

          <div className="reveal mt-5 text-center">
            <a
              href="#changelog-full"
              className="group inline-flex items-center gap-[6px] text-[14px] font-medium text-[var(--fg)] transition-colors duration-150 hover:text-[var(--primary)]"
            >
              Read the full changelog
              <span className="text-[var(--fg-muted)] transition-[transform,color] duration-150 group-hover:translate-x-[2px] group-hover:text-[var(--primary)]">
                →
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="border-t border-[var(--border)] bg-[var(--surface-muted)] py-[88px] text-center">
        <div className="reveal mx-auto max-w-[1200px] px-8 max-md:px-5">
          <h2 className="mx-auto mb-7 max-w-[22ch] font-display text-[36px] font-semibold leading-[42px] tracking-[-0.015em] text-[var(--fg)] max-md:text-[28px] max-md:leading-[34px]">
            Book 30 minutes. We&apos;ll set up your first connection live.
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="/dashboard" className="btn btn-primary btn-lg">
              Open admin
            </a>
            <a href="/login" className="btn btn-ghost btn-lg">
              Sign in
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[var(--border)] bg-[var(--bg)] px-0 pb-12 pt-16">
        <div className="mx-auto max-w-[1200px] px-8 max-md:px-5">
          <div className="mb-12 grid grid-cols-[1.5fr_repeat(4,1fr)] gap-12 max-md:grid-cols-2 max-md:gap-8">
            <div>
              <div className="inline-flex items-center gap-[10px] font-display text-[18px] font-semibold tracking-[-0.01em] text-[var(--fg)]">
                <span className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-[7px] bg-[var(--primary)] font-display text-[15px] font-bold text-[var(--primary-fg)]">
                  Z
                </span>
                <span>Zakra</span>
              </div>
              <p className="mt-[14px] max-w-[32ch] text-[14px] leading-[22px] text-[var(--fg-muted)]">
                The admin layer for your data stack. Built for teams that
                already know what they want.
              </p>
            </div>
            {FOOTER_COLS.map((col) => (
              <div key={col.head}>
                <h5 className="mb-[14px] font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--fg-subtle)]">
                  {col.head}
                </h5>
                <ul className="m-0 flex list-none flex-col gap-[10px] p-0">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-[14px] text-[var(--fg-muted)] transition-colors duration-150 hover:text-[var(--fg)]"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-6 text-[13px] text-[var(--fg-subtle)]">
            <span>© 2026 Zakra Systems, Inc.</span>
            <div className="flex gap-5">
              <a
                href="#"
                className="transition-colors duration-150 hover:text-[var(--fg)]"
              >
                status.zakra.dev
              </a>
              <a
                href="#"
                className="transition-colors duration-150 hover:text-[var(--fg)]"
              >
                security.txt
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
