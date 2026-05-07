import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalToc } from '@/components/legal/legal-toc';

export const metadata: Metadata = {
  title: 'Cookie Policy — Zakra',
  description:
    'How Zakra uses cookies to keep sessions secure, maintain Company Context preferences, and provide anonymous analytics.',
};

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mb-4 mt-10 font-sans text-xl font-semibold tracking-tight text-foreground first:mt-0"
    >
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 font-sans text-sm leading-relaxed text-muted">{children}</p>;
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="my-4 overflow-x-auto rounded-lg border border-border">
      <table className="w-full font-sans text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-300">
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-left font-medium text-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border last:border-0 hover:bg-surface-300/50">
              {row.map((cell, j) => (
                <td key={j} className={`px-4 py-3 ${j === 0 ? 'font-mono text-xs text-foreground' : 'text-muted'}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CookiesPage() {
  return (
    <div className="flex gap-10">
      {/* Sticky TOC — desktop only */}
      <aside className="hidden shrink-0 xl:block">
        <LegalToc items={[
          { id: 'what-are-cookies', label: 'What Are Cookies' },
          { id: 'how-we-use', label: 'How We Use Cookies' },
          { id: 'cookie-table', label: 'Cookie Reference Table' },
          { id: 'what-we-dont', label: "What We Don't Do" },
          { id: 'your-choices', label: 'Your Choices' },
          { id: 'contact', label: 'Contact' },
        ]} />
      </aside>

      {/* Main content */}
      <article className="min-w-0 flex-1">
        {/* Header */}
        <div className="mb-8 border-b border-border pb-6">
          <div className="mb-2 font-sans text-xs font-medium uppercase tracking-widest text-accent">
            Legal Document
          </div>
          <h1 className="mb-2 font-sans text-3xl font-semibold tracking-tight text-foreground">
            Cookie Policy
          </h1>
          <p className="font-sans text-sm text-muted">
            <strong className="text-foreground">Product:</strong> Zakra — AI-Powered Enterprise Knowledge Base &amp; Reporting Platform
            <br />
            <strong className="text-foreground">Operated by:</strong> Empowering Energy (trading as ESAP AI)
          </p>
        </div>

        {/* Consent banner preview */}
        <div className="mb-8 rounded-xl border border-accent-border bg-accent-soft p-5">
          <p className="mb-1 font-sans text-sm font-semibold text-foreground">Cookies on Zakra</p>
          <p className="mb-3 font-sans text-sm text-muted">
            This platform uses cookies to keep your session secure, maintain your Company Context preference, and
            provide your organisation with anonymous usage analytics.
          </p>
          <div className="mb-3 space-y-2">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0 text-accent">✓</span>
              <p className="font-sans text-sm text-muted">
                <strong className="text-foreground">Essential Cookies</strong> — Required for login, session security,
                Company Context, and platform functionality. Cannot be disabled.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0 text-muted">○</span>
              <p className="font-sans text-sm text-muted">
                <strong className="text-foreground">Analytics Cookies</strong> — Anonymous, aggregated platform usage
                data. No personal data included.
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-warning-border bg-warning-bg px-3 py-2 font-sans text-xs text-warning">
            ⚠️ Database queries, reports, chat content, and connection credentials are NOT stored in cookies. They are
            handled through encrypted data pipelines under your organisation&apos;s signed DPA.
          </div>
          <div className="mt-4 flex gap-3">
            <div className="rounded-md bg-accent px-4 py-2 font-sans text-sm font-medium text-accent-fg">
              Accept All
            </div>
            <div className="rounded-md border border-border px-4 py-2 font-sans text-sm text-muted">
              Essential Only
            </div>
          </div>
        </div>

        <SectionHeading id="what-are-cookies">What Are Cookies</SectionHeading>
        <P>
          Cookies are small text files placed on your device by a website when you visit. Zakra uses a minimal set of
          cookies strictly necessary for platform operation and anonymous usage analytics. We do not use cookies for
          advertising, behavioural tracking, or profiling.
        </P>

        <SectionHeading id="how-we-use">How We Use Cookies</SectionHeading>
        <P>
          <strong className="text-foreground">Essential cookies</strong> are required for the platform to function.
          They maintain your authenticated session, protect against CSRF attacks, remember your selected Company
          Context, and store your display preferences. These cannot be disabled without breaking core functionality.
        </P>
        <P>
          <strong className="text-foreground">Analytics cookies</strong> collect anonymous, aggregated data about how
          the platform is used. This data contains no personally identifiable information and is used only to improve
          the Zakra platform. These can be declined via the &quot;Essential Only&quot; option in the consent banner.
        </P>

        <SectionHeading id="cookie-table">Cookie Reference Table</SectionHeading>
        <Table
          headers={['Cookie Name', 'Type', 'Purpose', 'Duration']}
          rows={[
            ['session_token', 'Essential', 'Authenticated user session', 'Session end'],
            ['csrf_token', 'Essential', 'Cross-site request forgery protection', 'Session end'],
            ['company_context', 'Essential', 'Active Company Context selection', '1 year'],
            ['user_prefs', 'Essential', 'Display preferences and settings', '1 year'],
            ['_analytics_id', 'Analytics', 'Anonymous platform usage tracking (no PII)', '6 months'],
            ['cookie_consent', 'Essential', 'Records cookie consent choice', '1 year'],
          ]}
        />

        <SectionHeading id="what-we-dont">What We Don&apos;t Do</SectionHeading>
        <ul className="mb-4 ml-5 list-disc space-y-2 font-sans text-sm text-muted">
          <li>No advertising, retargeting, or behavioural tracking cookies</li>
          <li>No cookie data shared with marketing platforms or data brokers</li>
          <li>No third-party social media tracking pixels</li>
          <li>No cross-site tracking or fingerprinting</li>
          <li>Database queries, reports, chat content, and credentials are never stored in cookies</li>
        </ul>

        <SectionHeading id="your-choices">Your Choices</SectionHeading>
        <P>
          When you first access Zakra you will be presented with the consent banner above. Selecting{' '}
          <strong className="text-foreground">Accept All</strong> enables both essential and analytics cookies.
          Selecting <strong className="text-foreground">Essential Only</strong> disables the analytics cookie only —
          the platform remains fully functional.
        </P>
        <P>
          Your choice is stored in the <span className="font-mono text-xs text-foreground">cookie_consent</span> cookie
          for 1 year. You can change your preference at any time by clearing your browser cookies and revisiting the
          platform, which will re-display the consent banner.
        </P>
        <P>
          Browser-level cookie controls are also available. Blocking all cookies may affect essential session and
          Company Context functionality.
        </P>

        <SectionHeading id="contact">Contact</SectionHeading>
        <P>
          Questions about cookies or consent can be directed to the Empowering Energy Data Privacy Team:
        </P>
        <div className="rounded-lg border border-border bg-surface-200 p-4">
          <p className="mb-1 font-sans text-sm font-medium text-foreground">Empowering Energy — Data Privacy Team</p>
          <p className="font-sans text-sm text-muted">
            📧{' '}
            <a href="mailto:privacy@esap.ai" className="text-accent hover:underline">
              privacy@esap.ai
            </a>
            {'  '}·{'  '}
            🌐{' '}
            <Link href="/cookies" className="text-accent hover:underline">
              zakra.esap.ai/cookies
            </Link>
          </p>
        </div>

        {/* Also see */}
        <div className="mt-6 flex gap-4">
          <Link
            href="/privacy"
            className="rounded-lg border border-border px-4 py-2 font-sans text-sm text-muted transition-colors hover:border-border-strong hover:text-foreground"
          >
            Privacy Policy →
          </Link>
          <Link
            href="/terms"
            className="rounded-lg border border-border px-4 py-2 font-sans text-sm text-muted transition-colors hover:border-border-strong hover:text-foreground"
          >
            Terms of Service →
          </Link>
        </div>
      </article>
    </div>
  );
}
