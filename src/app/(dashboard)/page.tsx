'use client';

import Link from 'next/link';
import {
  ArrowUpRight,
  Database,
  FileBarChart,
  MessageSquarePlus,
  Sparkles,
  Users,
} from 'lucide-react';
import { useAuth } from '@/store/authStore';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { useUsers } from '@/hooks/useUsers';
import { useDbConnections } from '@/hooks/useDbConnections';
import { Skeleton } from '@/components/shared/skeleton';
import { cn } from '@/lib/utils';

function useWorkspaceCounts(companyId: string | null) {
  const { data: usersData, isLoading: usersLoading } = useUsers({
    page: 1,
    page_size: 1,
  });
  const { data: connectionsData, isLoading: connectionsLoading } =
    useDbConnections({
      company_id: companyId ?? undefined,
      page: 1,
      page_size: 1,
    });

  return {
    usersTotal: usersData?.total,
    connectionsTotal: connectionsData?.total,
    isLoading: usersLoading || connectionsLoading,
  };
}

function WorkspaceSummary({ companyId }: { companyId: string }) {
  const { usersTotal, connectionsTotal, isLoading } = useWorkspaceCounts(
    companyId,
  );

  if (isLoading) {
    return <Skeleton className="mt-2 h-4 w-52" />;
  }

  const parts: string[] = [];
  if (usersTotal !== undefined)
    parts.push(`${usersTotal} user${usersTotal === 1 ? '' : 's'}`);
  if (connectionsTotal !== undefined)
    parts.push(
      `${connectionsTotal} connection${connectionsTotal === 1 ? '' : 's'}`,
    );

  if (parts.length === 0) return null;

  return (
    <p className="mt-2 font-sans text-caption text-muted">{parts.join(' · ')}</p>
  );
}

function StatRow({ companyId }: { companyId: string }) {
  const { usersTotal, connectionsTotal, isLoading } = useWorkspaceCounts(
    companyId,
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-6">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    );
  }

  const stats: { value: number; label: string }[] = [];
  if (usersTotal !== undefined)
    stats.push({
      value: usersTotal,
      label: usersTotal === 1 ? 'User' : 'Users',
    });
  if (connectionsTotal !== undefined)
    stats.push({
      value: connectionsTotal,
      label: connectionsTotal === 1 ? 'Connection' : 'Connections',
    });

  if (stats.length === 0) return null;

  return (
    <dl className="flex items-center divide-x divide-border">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={cn(
            'flex flex-col px-6 first:pl-0',
            i === 0 && 'animation-delay-50',
            i === 1 && 'animation-delay-100',
            'animate-fade-up',
          )}
        >
          <dt className="order-2 mt-0.5 font-sans text-caption text-muted">
            {stat.label}
          </dt>
          <dd className="order-1 font-sans text-[28px] font-normal leading-[1.1] tracking-[-0.56px] text-foreground font-feat-tnum">
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

interface QuickAction {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  primary?: boolean;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'New chat session',
    href: '/chat',
    icon: MessageSquarePlus,
    primary: true,
  },
  { label: 'Generate report', href: '/reports/ai-generate', icon: Sparkles },
  { label: 'Report history', href: '/reports/history', icon: FileBarChart },
  { label: 'Manage users', href: '/users', icon: Users, adminOnly: true },
  {
    label: 'Database connections',
    href: '/db-connections',
    icon: Database,
    adminOnly: true,
  },
];

const DELAY_CLASSES = [
  'animation-delay-50',
  'animation-delay-100',
  'animation-delay-150',
  'animation-delay-200',
  'animation-delay-300',
];

export default function OverviewPage() {
  const companyId = useCurrentCompanyId();
  const { isAdmin, isSuperAdmin } = useAuth();
  const canSeeAdminActions = isAdmin || isSuperAdmin;

  const actions = QUICK_ACTIONS.filter(
    (a) => !a.adminOnly || canSeeAdminActions,
  );

  return (
    <div className="max-w-[900px] px-6 py-8">
      {/* Page header */}
      <header className="animate-fade-up">
        <h1 className="font-sans text-[26px] font-normal leading-[1.2] tracking-[-0.52px] text-foreground">
          Overview
        </h1>
        {companyId ? (
          <WorkspaceSummary companyId={companyId} />
        ) : (
          <p className="mt-2 font-sans text-caption text-muted">
            Select a company from the sidebar to see workspace stats.
          </p>
        )}
      </header>

      {/* Stats row — only when a company is selected */}
      {companyId && (
        <section
          aria-label="Workspace statistics"
          className="mt-5"
        >
          <StatRow companyId={companyId} />
        </section>
      )}

      {/* Actions grid — no section label */}
      <section
        aria-label="Quick actions"
        className={cn(companyId ? 'mt-8' : 'mt-8')}
      >
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {actions.map(({ label, href, icon: Icon, primary }, i) => (
            <li
              key={href}
              className={cn(
                'animate-fade-up',
                DELAY_CLASSES[i] ?? 'animation-delay-300',
              )}
            >
              <Link
                href={href}
                className={cn(
                  'group flex flex-col gap-3 rounded-lg border p-4 transition-all duration-200 focus-visible:outline-none',
                  primary
                    ? 'border-[rgba(62,207,142,0.15)] bg-[rgba(62,207,142,0.06)] hover:border-[rgba(62,207,142,0.25)] hover:bg-[rgba(62,207,142,0.1)]'
                    : 'border-border bg-surface-200 hover:border-border-medium hover:bg-surface-300',
                )}
              >
                <div className="flex items-center justify-between">
                  <Icon
                    aria-hidden
                    size={15}
                    strokeWidth={1.5}
                    className={cn(
                      'shrink-0 transition-colors',
                      primary
                        ? 'text-accent'
                        : 'text-muted group-hover:text-accent',
                    )}
                  />
                  <ArrowUpRight
                    aria-hidden
                    size={13}
                    strokeWidth={1.5}
                    className={cn(
                      'transition-colors',
                      primary
                        ? 'text-accent/40 group-hover:text-accent/70'
                        : 'text-muted/30 group-hover:text-muted',
                    )}
                  />
                </div>
                <span className="font-sans text-[13px] text-foreground">
                  {label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
