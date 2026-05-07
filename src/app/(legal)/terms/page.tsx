import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalToc } from '@/components/legal/legal-toc';

export const metadata: Metadata = {
  title: 'Terms of Service — Zakra',
  description:
    'Terms governing access to Zakra, the AI-powered enterprise knowledge base platform by Empowering Energy (ESAP AI).',
};

function SectionHeading({ id, num, children }: { id: string; num: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mb-4 mt-10 flex items-baseline gap-3 font-sans text-xl font-semibold tracking-tight text-foreground first:mt-0"
    >
      <span className="font-mono text-sm font-normal text-accent">{num}</span>
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 font-sans text-sm leading-relaxed text-muted">{children}</p>;
}

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-lg border border-warning-border bg-warning-bg px-4 py-3 font-sans text-sm text-warning">
      {children}
    </div>
  );
}

function ProhibitedList({ items }: { items: string[] }) {
  return (
    <ul className="mb-4 ml-5 list-disc space-y-2 font-sans text-sm text-muted">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

const toc = [
  { id: 'agreement', num: '1', label: 'Agreement' },
  { id: 'service', num: '2', label: 'Description of Service' },
  { id: 'access', num: '3', label: 'Access and Authorised Users' },
  { id: 'database', num: '4', label: 'Database Connection Responsibility' },
  { id: 'acceptable-use', num: '5', label: 'Acceptable Use' },
  { id: 'ai-disclaimer', num: '6', label: 'AI-Generated Content Disclaimer' },
  { id: 'client-data', num: '7', label: 'Client Data and Content' },
  { id: 'data-processing', num: '8', label: 'Data Processing and Privacy' },
  { id: 'pricing', num: '9', label: 'Pricing and Commercial Terms' },
  { id: 'ip', num: '10', label: 'Intellectual Property' },
  { id: 'confidentiality', num: '11', label: 'Confidentiality' },
  { id: 'availability', num: '12', label: 'Service Availability' },
  { id: 'liability', num: '13', label: 'Limitation of Liability' },
  { id: 'termination', num: '14', label: 'Termination' },
  { id: 'governing-law', num: '15', label: 'Governing Law' },
  { id: 'changes', num: '16', label: 'Changes to Terms' },
];

export default function TermsPage() {
  return (
    <div className="flex gap-10">
      {/* Sticky TOC — desktop only */}
      <aside className="hidden shrink-0 xl:block">
        <LegalToc items={toc.map((i) => ({ id: i.id, label: i.label, sub: i.num }))} />
      </aside>

      {/* Main content */}
      <article className="min-w-0 flex-1">
        {/* Header */}
        <div className="mb-8 border-b border-border pb-6">
          <div className="mb-2 font-sans text-xs font-medium uppercase tracking-widest text-accent">
            Legal Document
          </div>
          <h1 className="mb-2 font-sans text-3xl font-semibold tracking-tight text-foreground">
            Terms of Service
          </h1>
          <p className="font-sans text-sm text-muted">
            <strong className="text-foreground">Product:</strong> Zakra — AI-Powered Enterprise Knowledge Base &amp; Reporting Platform
            <br />
            <strong className="text-foreground">Operated by:</strong> Empowering Energy (trading as ESAP AI) (CR No. [Insert CR Number])
            <br />
            <strong className="text-foreground">Platform:</strong>{' '}
            <span className="font-mono text-xs">zakra.esap.ai</span>
          </p>
        </div>

        <SectionHeading id="agreement" num="1">Agreement</SectionHeading>
        <P>
          These Terms govern access to Zakra at <span className="font-mono text-xs">zakra.esap.ai</span>, operated by{' '}
          <strong className="text-foreground">Empowering Energy (trading as ESAP AI)</strong> (CR No. [Insert CR Number]).
          They apply to the Client organisation and all Authorised Users. These Terms operate alongside any Master
          Services Agreement (MSA), Statement of Work (SOW), and Data Processing Agreement (DPA) — the MSA/DPA takes
          precedence in the event of conflicts.
        </P>

        <SectionHeading id="service" num="2">Description of Service</SectionHeading>
        <P>Zakra provides:</P>
        <ul className="mb-4 ml-5 list-disc space-y-2 font-sans text-sm text-muted">
          <li>Overview dashboard with real-time stats (Users, Connections, Reports, Chat Sessions, Activity)</li>
          <li>AI-powered chat interface for natural language database querying</li>
          <li>AI report generation with auto-template selection and structured output</li>
          <li>Report history with status tracking (running, completed, failed)</li>
          <li>Configurable report templates (HR, Financial, Custom) with section structures</li>
          <li>Secure database connection management with connection testing</li>
          <li>Column-level Table Access controls (None, Read, Masked, Write) per table</li>
          <li>Multi-company hierarchy management (Parent/Subsidiary) with Company Context switching</li>
          <li>User management with role assignment (Super Admin, Admin, Regular) and status tracking</li>
          <li>Usage analytics and activity monitoring</li>
        </ul>

        <SectionHeading id="access" num="3">Access and Authorised Users</SectionHeading>
        <P>
          Access is granted exclusively to the Client and designated Authorised Users per a signed MSA. Three roles are
          available: <strong className="text-foreground">Super Admin</strong> (full platform control),{' '}
          <strong className="text-foreground">Admin</strong> (company/user management and all features), and{' '}
          <strong className="text-foreground">Regular</strong> (chat and reports within assigned Company Context).
          The Client is responsible for credential security, Table Access configuration, and ensuring all users comply
          with these Terms.
        </P>

        <SectionHeading id="database" num="4">Database Connection Responsibility</SectionHeading>
        <Highlight>
          ⚠️ The Client bears full responsibility for all data connected to Zakra via database credentials.
        </Highlight>
        <P>Client responsibilities include:</P>
        <ul className="mb-4 ml-5 list-disc space-y-2 font-sans text-sm text-muted">
          <li>Providing database credentials with minimum necessary access (read-only strongly recommended)</li>
          <li>Configuring Table Access controls to prevent over-exposure of sensitive columns (salary, medical, personal data)</li>
          <li>Ensuring all data in Connected Databases is lawfully held under PDPL</li>
          <li>Rotating credentials periodically and immediately upon suspected compromise</li>
          <li>Ensuring Connected Databases do not contain data that violates Saudi law</li>
        </ul>
        <P>
          Empowering Energy (trading as ESAP AI) is not liable for the Client&apos;s misconfiguration of Table Access
          or connection of databases containing unlawfully held data.
        </P>

        <SectionHeading id="acceptable-use" num="5">Acceptable Use</SectionHeading>
        <P>The following are prohibited:</P>
        <ProhibitedList
          items={[
            'Connecting databases containing data that the Client does not lawfully hold',
            'Granting write access to columns without proper authorisation and change management',
            'Using AI-generated reports as the sole basis for employment, financial, or legal decisions without human review',
            'Reverse engineering the AI query translation engine or report generation system',
            'Using outputs for competing products',
            'Sharing, reselling, or sublicensing access or database credentials',
          ]}
        />

        <SectionHeading id="ai-disclaimer" num="6">AI-Generated Content Disclaimer</SectionHeading>
        <ul className="mb-4 ml-5 list-disc space-y-2 font-sans text-sm text-muted">
          <li>AI-generated queries may not always produce the intended results — verify against source data</li>
          <li>Reports are AI-generated summaries, <strong className="text-foreground">not audited financial or HR documents</strong></li>
          <li>AI answers depend on the accuracy and completeness of data in Connected Databases</li>
          <li>All outputs are labelled: <em className="text-foreground">"AI-generated — verify against source data before formal use."</em></li>
          <li>Empowering Energy (trading as ESAP AI) is not liable for decisions made based on AI reports without human verification</li>
        </ul>

        <SectionHeading id="client-data" num="7">Client Data and Content</SectionHeading>
        <P>
          The Client retains full ownership of all data in Connected Databases, generated reports, chat content, and
          configurations. Empowering Energy (trading as ESAP AI) commits to:
        </P>
        <ul className="mb-4 ml-5 list-disc space-y-2 font-sans text-sm text-muted">
          <li>Never selling, licensing, or sharing Client Data with third parties</li>
          <li>Never using Client Data to train AI models without explicit written consent</li>
          <li>Accessing data only for contracted service delivery, security, or legal compliance</li>
          <li>Never retaining copies of raw database data beyond transient query processing</li>
        </ul>

        <SectionHeading id="data-processing" num="8">Data Processing and Privacy</SectionHeading>
        <P>
          Data processing is governed by the{' '}
          <Link href="/privacy" className="text-accent hover:underline">
            Privacy Policy
          </Link>{' '}
          and the signed Data Processing Agreement (DPA). Zakra complies with PDPL Royal Decree M/19 of 2021 and its
          Implementing Regulations.
        </P>

        <SectionHeading id="pricing" num="9">Pricing and Commercial Terms</SectionHeading>
        <P>
          Pricing, payment terms, and billing are defined exclusively in a signed MSA or SOW. These Terms do not govern
          billing independently.
        </P>

        <SectionHeading id="ip" num="10">Intellectual Property</SectionHeading>
        <P>
          All intellectual property in the Zakra platform is exclusively owned by Empowering Energy (trading as ESAP AI),
          including but not limited to: platform software, AI query translation engine, report generation system, template
          engine, Table Access framework, Company Context architecture, branding, and documentation. No licence beyond
          contracted access is granted.
        </P>

        <SectionHeading id="confidentiality" num="11">Confidentiality</SectionHeading>
        <P>
          Both parties agree to maintain confidentiality of non-public information for 3 years post-termination.
          Database credentials are treated at the highest confidentiality classification and must be destroyed
          immediately upon termination or credential rotation.
        </P>

        <SectionHeading id="availability" num="12">Service Availability</SectionHeading>
        <P>
          Zakra targets 99.5% platform availability. Database availability and query latency depend on Client
          infrastructure and is outside Empowering Energy&apos;s control. Planned maintenance will be communicated
          with advance notice.
        </P>

        <SectionHeading id="liability" num="13">Limitation of Liability</SectionHeading>
        <P>
          Total liability is capped at fees paid in the 3 months preceding the claim. Empowering Energy (trading as
          ESAP AI) is not liable for indirect, consequential, or incidental damages, including data loss resulting from
          Client misconfiguration of Table Access or database credentials.
        </P>

        <SectionHeading id="termination" num="14">Termination</SectionHeading>
        <P>
          On termination, a 30-day export window is provided for all generated reports, chat histories, and
          configurations. Database credentials are immediately destroyed. Platform access is revoked at termination.
          Permanent deletion of all Client Data is confirmed in writing within 30 days.
        </P>

        <SectionHeading id="governing-law" num="15">Governing Law</SectionHeading>
        <P>
          These Terms are governed by the laws of the Kingdom of Saudi Arabia. Disputes shall be subject to the
          exclusive jurisdiction of the courts of Riyadh.
        </P>

        <SectionHeading id="changes" num="16">Changes to Terms</SectionHeading>
        <P>
          Material changes to these Terms will be communicated with 14 days&apos; advance notice via the platform or
          registered email. Continued use after the notice period constitutes acceptance.
        </P>

        {/* Contact */}
        <div className="mt-8 rounded-lg border border-border bg-surface-200 p-4">
          <p className="mb-1 font-sans text-sm font-medium text-foreground">Empowering Energy — Legal Team</p>
          <p className="font-sans text-sm text-muted">
            📧{' '}
            <a href="mailto:legal@esap.ai" className="text-accent hover:underline">
              legal@esap.ai
            </a>
            {'  '}·{'  '}
            🌐{' '}
            <Link href="/terms" className="text-accent hover:underline">
              zakra.esap.ai/terms
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
