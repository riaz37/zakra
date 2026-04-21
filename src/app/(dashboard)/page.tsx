'use client';

import Link from 'next/link';
import { Building2, Users, Database, FileBarChart, Plus } from 'lucide-react';
import { useCompanies } from '@/hooks/useCompanies';
import { useUsers } from '@/hooks/useUsers';
import { useDbConnections } from '@/hooks/useDbConnections';
import { useReportGenerations } from '@/hooks/useReportGenerations';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';

interface StatCardProps {
  label: string;
  value: number | undefined;
  isLoading: boolean;
  icon: React.ElementType;
}

function StatCard({ label, value, isLoading, icon: Icon }: StatCardProps) {
  return (
    <div className="bg-background border border-border rounded-lg p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-sans text-[11px] uppercase tracking-wide text-muted">
          {label}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-300">
          <Icon aria-hidden size={16} strokeWidth={1.5} className="text-muted" />
        </div>
      </div>
      {isLoading ? (
        <div className="h-8 w-16 animate-pulse rounded bg-surface-300" />
      ) : (
        <span className="font-sans text-[32px] font-semibold text-foreground leading-none">
          {value ?? 0}
        </span>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const companyId = useCurrentCompanyId();

  const companies = useCompanies({ page: 1, page_size: 1 });
  const users = useUsers({ page: 1, page_size: 1 });
  const dbConnections = useDbConnections(
    companyId ? { company_id: companyId, page: 1, page_size: 1 } : undefined,
  );
  const reportGenerations = useReportGenerations(companyId);

  const dbConnectionCount = dbConnections.data?.total ?? 0;
  const showOnboarding = !dbConnections.isLoading && dbConnectionCount === 0 && !!companyId;

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-sans text-[22px] font-normal leading-[1.3] tracking-[-0.11px] text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 font-serif text-[15px] text-muted">
          Overview of your ESAP-KB workspace.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Companies"
          value={companies.data?.total}
          isLoading={companies.isLoading}
          icon={Building2}
        />
        <StatCard
          label="Users"
          value={users.data?.total}
          isLoading={users.isLoading}
          icon={Users}
        />
        <StatCard
          label="DB Connections"
          value={dbConnections.data?.total}
          isLoading={dbConnections.isLoading}
          icon={Database}
        />
        <StatCard
          label="Reports Generated"
          value={reportGenerations.data?.total}
          isLoading={reportGenerations.isLoading}
          icon={FileBarChart}
        />
      </div>

      {showOnboarding && (
        <div className="mt-8 rounded-lg border border-border bg-background p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-300">
            <Database aria-hidden size={22} strokeWidth={1.5} className="text-muted" />
          </div>
          <h2 className="font-sans text-[18px] font-medium text-foreground">
            Connect your first database to get started
          </h2>
          <p className="mt-2 font-serif text-[15px] text-muted">
            Add a database connection to start querying data, generating reports,
            and managing table access.
          </p>
          <Link
            href="/db-connections"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-sans text-[14px] font-medium text-white transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            <Plus aria-hidden size={16} />
            Add Database Connection
          </Link>
        </div>
      )}

      {!showOnboarding && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <QuickLinkCard
            href="/companies"
            icon={Building2}
            title="Companies"
            description="Manage parent companies and subsidiaries."
          />
          <QuickLinkCard
            href="/users"
            icon={Users}
            title="Users"
            description="Invite and manage user access across companies."
          />
        </div>
      )}
    </div>
  );
}

function QuickLinkCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-lg border border-border bg-background p-5 transition-colors hover:bg-surface-300"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-300 transition-colors group-hover:bg-surface-400">
        <Icon aria-hidden size={18} strokeWidth={1.5} className="text-muted" />
      </div>
      <div>
        <p className="font-sans text-[15px] font-medium text-foreground">{title}</p>
        <p className="mt-0.5 font-serif text-[14px] text-muted">{description}</p>
      </div>
    </Link>
  );
}
