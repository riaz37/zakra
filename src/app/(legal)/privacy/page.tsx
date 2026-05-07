import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalToc } from '@/components/legal/legal-toc';

export const metadata: Metadata = {
  title: 'Privacy Policy — Zakra',
  description:
    'How Empowering Energy (trading as ESAP AI) collects, processes, and protects data on the Zakra platform under PDPL.',
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

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 mt-6 font-sans text-base font-semibold text-foreground">
      {children}
    </h3>
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
                <td key={j} className="px-4 py-3 text-muted">
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

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-lg border border-warning-border bg-warning-bg px-4 py-3 font-sans text-sm text-warning">
      {children}
    </div>
  );
}

const toc = [
  { id: 'who-we-are', label: 'Who We Are' },
  { id: 'our-role', label: 'Our Role: Data Processor' },
  { id: 'critical-access', label: 'Critical: Direct Database Access' },
  { id: 'what-we-process', label: 'What Data We Process' },
  { id: 'why-we-process', label: 'Why We Process Your Data' },
  { id: 'how-we-use-ai', label: 'How We Use AI' },
  { id: 'data-sharing', label: 'Data Sharing & Sub-Processors' },
  { id: 'cross-border', label: 'Cross-Border Data Transfers' },
  { id: 'your-rights', label: "Your Organisation's Rights" },
  { id: 'retention', label: 'Data Retention' },
  { id: 'security', label: 'Data Security' },
  { id: 'contact', label: 'Contact & Complaints' },
] satisfies import('@/components/legal/legal-toc').TocItem[];

export default function PrivacyPage() {
  return (
    <div className="flex gap-10">
      {/* Sticky TOC — desktop only */}
      <aside className="hidden shrink-0 xl:block">
        <LegalToc items={toc} />
      </aside>

      {/* Main content */}
      <article className="min-w-0 flex-1">
        {/* Header */}
        <div className="mb-8 border-b border-border pb-6">
          <div className="mb-2 font-sans text-xs font-medium uppercase tracking-widest text-accent">
            Legal Document
          </div>
          <h1 className="mb-2 font-sans text-3xl font-semibold tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="font-sans text-sm text-muted">
            <strong className="text-foreground">Product:</strong> Zakra — AI-Powered Enterprise Knowledge Base &amp; Reporting Platform
            <br />
            <strong className="text-foreground">Operated by:</strong> Empowering Energy (trading as ESAP AI)
            <br />
            <strong className="text-foreground">Platform:</strong>{' '}
            <span className="font-mono text-xs">zakra.esap.ai</span>
            <br />
            <strong className="text-foreground">Risk Classification:</strong>{' '}
            <span className="font-medium text-error">HIGHEST</span> — Direct connection to client production databases
          </p>
        </div>

        <SectionHeading id="who-we-are">Who We Are</SectionHeading>
        <P>
          Zakra is an AI-powered enterprise knowledge base and reporting platform developed and operated by{' '}
          <strong className="text-foreground">Empowering Energy (trading as ESAP AI)</strong> (CR No. [Insert CR Number]).
          We help organisations connect their databases, query them using natural language AI, and generate structured
          reports — all through a secure, access-controlled interface.
        </P>

        <SectionHeading id="our-role">Our Role: Data Processor</SectionHeading>
        <P>
          Zakra operates exclusively in a B2B enterprise context. Your organisation is the{' '}
          <strong className="text-foreground">Data Controller</strong> — you determine which databases are connected,
          which tables and columns are exposed, and who has access. Empowering Energy (trading as ESAP AI) acts solely
          as a <strong className="text-foreground">Data Processor</strong>, processing database data only on your
          organisation&apos;s behalf and strictly under your documented instructions.
        </P>

        <SectionHeading id="critical-access">Critical: Direct Database Access</SectionHeading>
        <Highlight>
          ⚠️ Zakra connects directly to your organisation&apos;s databases and executes AI-generated queries against
          your live data. This means the platform may access <strong>any data stored in your Connected Databases</strong>,
          including employee records, salary information, financial transactions, customer data, and other business records.
        </Highlight>
        <P>Your organisation, as Data Controller, is responsible for:</P>
        <ul className="mb-4 ml-5 list-disc space-y-1 font-sans text-sm text-muted">
          <li>Configuring <strong className="text-foreground">Table Access controls</strong> to restrict which columns AI can query (None, Read, Masked, Write)</li>
          <li>Providing database credentials with minimum necessary access (read-only recommended)</li>
          <li>Ensuring all data in Connected Databases is lawfully held under PDPL</li>
          <li>Informing Data Subjects whose personal data may be queried or included in reports</li>
        </ul>

        <SectionHeading id="what-we-process">What Data We Process</SectionHeading>
        <ul className="mb-4 ml-5 list-disc space-y-2 font-sans text-sm text-muted">
          <li><strong className="text-foreground">Client Database Content (Queried)</strong> — Data from Connected Databases accessed through AI queries: employee records, salary/payroll data, financial transactions, invoices, purchase orders, and any other data in exposed tables</li>
          <li><strong className="text-foreground">AI-Generated Reports</strong> — Structured reports (HR, Financial, Custom) containing analysis, summaries, and visualisations built from database query results</li>
          <li><strong className="text-foreground">Chat Query Content</strong> — Natural language questions from users and AI-generated responses containing database-sourced results</li>
          <li><strong className="text-foreground">Database Connection Credentials</strong> — Server IPs, ports, database names, authentication credentials (encrypted, never stored in plaintext)</li>
          <li><strong className="text-foreground">Company Hierarchy Data</strong> — Company names, parent/subsidiary relationships, status, creation dates</li>
          <li><strong className="text-foreground">User Account Data</strong> — Names, emails, roles (Super Admin, Admin, Regular), account status</li>
          <li><strong className="text-foreground">Table Access Configurations</strong> — Column-level permissions (None, Read, Masked, Write) per table per role</li>
          <li><strong className="text-foreground">Report Templates</strong> — Template names, types (HR, Financial, Custom), section structures</li>
          <li><strong className="text-foreground">Usage and Analytics Data</strong> — Login timestamps, chat sessions, reports generated, daily activity volumes</li>
        </ul>

        <SectionHeading id="why-we-process">Why We Process Your Data</SectionHeading>
        <Table
          headers={['Purpose', 'Lawful Basis']}
          rows={[
            ['Database querying and AI-powered chat responses', 'Performance of contract'],
            ['AI report generation from database data', 'Performance of contract'],
            ['User authentication and role-based access', 'Performance of contract'],
            ['Table Access control enforcement', 'Performance of contract'],
            ['Platform security and unauthorised access prevention', 'Legitimate interest'],
            ['Service quality improvement and analytics', 'Legitimate interest'],
            ['Legal and regulatory compliance', 'Legal obligation'],
          ]}
        />
        <P>
          We never process data for advertising, profiling, or any purpose outside the contracted scope. We do not retain
          copies of your raw database data — only generated reports and chat outputs.
        </P>

        <SectionHeading id="how-we-use-ai">How We Use AI</SectionHeading>
        <ul className="mb-4 ml-5 list-disc space-y-2 font-sans text-sm text-muted">
          <li>Zakra uses AI to translate natural language questions into database queries and return results</li>
          <li>AI auto-selects report templates, runs database queries, and builds structured reports</li>
          <li>All AI-generated reports and chat answers are assistance tools — <strong className="text-foreground">not final records or audited outputs</strong></li>
          <li>AI outputs should always be verified against source data before use in formal decisions</li>
          <li>We do not use your database data, reports, or chat content to train AI models without explicit written consent</li>
          <li>We maintain documentation of AI models, query translation logic, and known limitations</li>
          <li>Database credentials are never sent to LLM providers — only query results</li>
        </ul>

        <SectionHeading id="data-sharing">Data Sharing &amp; Sub-Processors</SectionHeading>
        <Table
          headers={['Provider', 'Purpose', 'Location']}
          rows={[
            ['Cloud Hosting Provider', 'Infrastructure, storage, and compute', 'USA'],
            ['LLM Provider', 'AI query processing, report generation, NLU', 'USA'],
            ['Analytics Platform', 'Anonymous usage analytics', 'USA'],
          ]}
        />
        <P>
          No sub-processor receives direct access to your Connected Databases. Only query results are processed by LLM
          providers. 30 days&apos; advance notice for any sub-processor changes.
        </P>

        <SectionHeading id="cross-border">Cross-Border Data Transfers</SectionHeading>
        <P>
          All transfers are protected by SDAIA-approved SCCs, completed TRAs filed with NDMO, encrypted transmission, and
          a contractual prohibition on secondary use. Your Connected Databases remain under your control and are not
          transferred.
        </P>

        <SectionHeading id="your-rights">Your Organisation&apos;s Rights Under PDPL</SectionHeading>
        <ul className="mb-4 ml-5 list-disc space-y-2 font-sans text-sm text-muted">
          <li><strong className="text-foreground">Access</strong> — Copy of all generated reports, chat histories, and configurations</li>
          <li><strong className="text-foreground">Correction</strong> — Fix inaccurate metadata or user data</li>
          <li><strong className="text-foreground">Deletion</strong> — Specific reports, chat histories, or all platform data</li>
          <li><strong className="text-foreground">Portability</strong> — JSON or PDF export</li>
          <li><strong className="text-foreground">Objection</strong> — Object to processing not in DPA</li>
          <li><strong className="text-foreground">Restriction</strong> — Restrict processing during dispute</li>
          <li><strong className="text-foreground">Audit</strong> — Evidence of PDPL compliance, query audit logs</li>
        </ul>
        <P>
          Note: Rights regarding data in your Connected Databases must be fulfilled by your organisation directly at the
          database level.
        </P>
        <P>
          Contact:{' '}
          <a href="mailto:privacy@esap.ai" className="text-accent hover:underline">
            privacy@esap.ai
          </a>{' '}
          — Response within 30 days.
        </P>

        <SectionHeading id="retention">Data Retention</SectionHeading>
        <Table
          headers={['Data Type', 'Retention Period']}
          rows={[
            ['Generated reports', 'Contract duration + 6 months'],
            ['Chat session history and query logs', '12 months'],
            ['Database connection credentials', 'Contract duration, then immediately destroyed'],
            ['Table Access configurations', 'Contract duration, then deleted'],
            ['Company and user account data', 'Contract duration + 1 year'],
            ['Report templates', 'Contract duration + 6 months'],
            ['Usage analytics', '12 months'],
            ['Security and access logs', '6 months'],
          ]}
        />
        <P>
          Raw database data is <strong className="text-foreground">NOT retained</strong> — only generated outputs.
          30-day export window on termination. Permanent deletion confirmed in writing.
        </P>

        <SectionHeading id="security">Data Security</SectionHeading>
        <ul className="mb-4 ml-5 list-disc space-y-2 font-sans text-sm text-muted">
          <li>AES-256 encryption at rest for all reports, chat logs, and credentials</li>
          <li>TLS 1.3 encryption in transit, including database connections</li>
          <li>Database credentials encrypted in secure vault — never in plaintext</li>
          <li>Column-level access control (None/Read/Masked/Write) enforced before queries execute</li>
          <li>Company Context isolation between organisations</li>
          <li>Role-based access (Super Admin / Admin / Regular)</li>
          <li>Query audit logging — all AI queries logged with user, timestamp, and content</li>
          <li>Regular security audits and vulnerability assessments</li>
          <li>72-hour SDAIA/NDMO breach notification + immediate client notification</li>
        </ul>

        <SectionHeading id="contact">Contact &amp; Complaints</SectionHeading>
        <P>
          <strong className="text-foreground">Empowering Energy — Data Privacy Team</strong>
          <br />
          📧{' '}
          <a href="mailto:privacy@esap.ai" className="text-accent hover:underline">
            privacy@esap.ai
          </a>
          {'  '}·{'  '}
          🌐{' '}
          <Link href="/privacy" className="text-accent hover:underline">
            zakra.esap.ai/privacy
          </Link>
        </P>
        <P>
          Complaints may be submitted to SDAIA / NDMO at{' '}
          <span className="font-mono text-xs text-muted">sdaia.gov.sa</span>.
        </P>

        {/* Also see */}
        <div className="mt-10 flex gap-4 border-t border-border pt-6">
          <Link
            href="/terms"
            className="rounded-lg border border-border px-4 py-2 font-sans text-sm text-muted transition-colors hover:border-border-strong hover:text-foreground"
          >
            Terms of Service →
          </Link>
          <Link
            href="/cookies"
            className="rounded-lg border border-border px-4 py-2 font-sans text-sm text-muted transition-colors hover:border-border-strong hover:text-foreground"
          >
            Cookie Policy →
          </Link>
        </div>
      </article>
    </div>
  );
}
