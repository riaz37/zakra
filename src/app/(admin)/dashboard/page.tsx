"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building,
  Database,
  FileText,
  MessageSquare,
  ShieldCheck,
  Terminal,
  Users,
} from "lucide-react";
import { useAuth } from "@/store/authStore";
import { useCompanies } from "@/hooks/useCompanies";
import { useUsers } from "@/hooks/useUsers";
import { useRoles } from "@/hooks/useRoles";
import { useDbConnections } from "@/hooks/useDbConnections";
import { useReportGenerations } from "@/hooks/useReportGenerations";
import { useChatSessions } from "@/hooks/useChatSessions";
import { useCurrentCompanyId } from "@/hooks/useCurrentCompany";
import { PageHeader } from "@/components/admin/page-header";
import { SectionCard } from "@/components/admin/section-card";
import { StatusDot } from "@/components/admin/status-dot";

interface KpiCardProps {
  label: string;
  value: string | number;
  hint?: string;
  loading?: boolean;
}

function KpiCard({ label, value, hint, loading }: KpiCardProps) {
  return (
    <div className="flex flex-col gap-3.5 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-token-sm">
      <div className="text-[13px] font-medium text-[var(--fg-muted)]">{label}</div>
      {loading ? (
        <span className="skel h-9 w-20" />
      ) : (
        <div className="font-display text-[32px] font-semibold leading-[36px] -tracking-[0.02em]">
          {value}
        </div>
      )}
      {hint && <div className="text-[12px] text-[var(--fg-subtle)]">{hint}</div>}
    </div>
  );
}

const QUICK_ACTIONS = [
  { label: "New connection", icon: Database, href: "/connections" },
  { label: "Run a query", icon: Terminal, href: "/query" },
  { label: "Start chat", icon: MessageSquare, href: "/chat" },
  { label: "Generate report", icon: FileText, href: "/reports" },
];

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

const todayLabel = () => {
  const fmt = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  return fmt.format(new Date());
};

export default function DashboardPage() {
  const { user } = useAuth();
  const companyId = useCurrentCompanyId();

  const companies = useCompanies({ page: 1, page_size: 5 });
  const users = useUsers({ page: 1, page_size: 5, company_id: companyId });
  const roles = useRoles({ page: 1, page_size: 5 });
  const connections = useDbConnections({ company_id: companyId, page: 1, page_size: 6 });
  const reports = useReportGenerations(companyId, 0, 5);
  const sessions = useChatSessions(companyId);

  const firstName = user?.first_name ?? user?.email?.split("@")[0] ?? "there";

  return (
    <div className="mx-auto max-w-[1440px]">
      <PageHeader
        title={`${greeting()}, ${firstName}`}
        subtitle={`${todayLabel()} · Workspace overview`}
      />

      {/* KPIs */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Companies"
          value={companies.data?.total ?? 0}
          hint="Across your tenancy"
          loading={companies.isLoading}
        />
        <KpiCard
          label="Users"
          value={users.data?.total ?? 0}
          hint="In your company"
          loading={users.isLoading}
        />
        <KpiCard
          label="Connections"
          value={connections.data?.total ?? 0}
          hint="Live data sources"
          loading={connections.isLoading}
        />
        <KpiCard
          label="Reports"
          value={reports.data?.total ?? 0}
          hint="Total generations"
          loading={reports.isLoading}
        />
      </div>

      {/* Activity + Health */}
      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title="Recent reports"
          subtitle="Last generated in this workspace"
          actions={
            <Link
              href="/reports"
              className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[12px] font-medium text-[var(--fg-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--fg)]"
            >
              View all <ArrowRight className="size-3" strokeWidth={1.75} />
            </Link>
          }
          noPadding
        >
          {reports.isLoading ? (
            <ListSkeleton />
          ) : reports.data?.generations.length ? (
            <ul>
              {reports.data.generations.slice(0, 5).map((r, i, arr) => (
                <li
                  key={r.id}
                  className={`flex items-center gap-3 px-5 py-3 ${
                    i < arr.length - 1 ? "border-b border-[var(--border)]" : ""
                  }`}
                >
                  <span
                    className={`inline-flex size-7 shrink-0 items-center justify-center rounded-full ${
                      r.status === "completed"
                        ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                        : r.status === "failed"
                          ? "bg-[var(--destructive-soft)] text-[var(--destructive)]"
                          : "bg-[var(--warning-soft)] text-[var(--warning)]"
                    }`}
                  >
                    <FileText className="size-3.5" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 grow">
                    <div className="truncate text-[14px] font-medium">{r.title}</div>
                    <div className="truncate text-[12px] text-[var(--fg-subtle)]">
                      {new Date(r.created_at).toLocaleString()}
                    </div>
                  </div>
                  <StatusBadge status={r.status} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyRow text="No reports yet" />
          )}
        </SectionCard>

        <SectionCard title="System health" subtitle="Connection status" noPadding>
          {connections.isLoading ? (
            <ListSkeleton rows={4} />
          ) : connections.data?.items.length ? (
            <ul className="px-3 py-2">
              {connections.data.items.slice(0, 6).map((c) => (
                <li key={c.id} className="flex items-center gap-2.5 rounded-md px-3 py-2.5">
                  <StatusDot
                    status={
                      c.is_active
                        ? c.last_error
                          ? "failed"
                          : "live"
                        : "idle"
                    }
                  />
                  <div className="min-w-0 grow">
                    <div className="truncate text-[13px] font-medium">{c.name}</div>
                    <div className="truncate font-mono text-[11px] text-[var(--fg-subtle)]">
                      {c.database_type} · {c.host}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyRow text="No connections" />
          )}
        </SectionCard>
      </div>

      {/* Counts row 2 */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SmallCounter
          icon={Building}
          label="Companies"
          value={companies.data?.total ?? 0}
          href="/companies"
          loading={companies.isLoading}
        />
        <SmallCounter
          icon={Users}
          label="Users"
          value={users.data?.total ?? 0}
          href="/users"
          loading={users.isLoading}
        />
        <SmallCounter
          icon={ShieldCheck}
          label="Roles"
          value={roles.data?.total ?? 0}
          href="/roles"
          loading={roles.isLoading}
        />
        <SmallCounter
          icon={MessageSquare}
          label="Chat sessions"
          value={sessions.data?.total ?? 0}
          href="/chat"
          loading={sessions.isLoading}
        />
      </div>

      {/* Quick actions */}
      <h3 className="mb-3 font-display text-[16px] font-semibold -tracking-[0.01em]">
        Quick actions
      </h3>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {QUICK_ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.href}
              href={a.href}
              className="group flex flex-col gap-5 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-token-sm transition-all hover:border-[var(--primary)] hover:shadow-token-md"
            >
              <span className="inline-flex size-9 items-center justify-center rounded-[10px] bg-[var(--primary-soft)] text-[var(--primary)]">
                <Icon className="size-[18px]" strokeWidth={1.75} />
              </span>
              <div>
                <div className="text-[14px] font-medium">{a.label}</div>
                <div className="mt-1 inline-flex items-center gap-1 text-[12px] font-medium text-[var(--primary)]">
                  Open <ArrowRight className="size-3" strokeWidth={1.75} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "completed"
      ? "bg-[var(--primary-soft)] text-[var(--primary)]"
      : status === "failed"
        ? "bg-[var(--destructive-soft)] text-[var(--destructive)]"
        : status === "running"
          ? "bg-[var(--info-soft)] text-[var(--info)]"
          : "bg-[var(--warning-soft)] text-[var(--warning)]";
  return (
    <span
      className={`inline-flex h-[22px] items-center rounded-[var(--radius-badge)] px-2 text-[12px] font-medium capitalize ${cls}`}
    >
      {status}
    </span>
  );
}

function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <ul>
      {Array.from({ length: rows }).map((_, i) => (
        <li
          key={i}
          className={`flex items-center gap-3 px-5 py-3 ${i < rows - 1 ? "border-b border-[var(--border)]" : ""}`}
        >
          <span className="skel size-7 shrink-0 rounded-full" />
          <div className="grow">
            <span className="skel h-3 w-2/3" />
            <span className="skel mt-2 h-2.5 w-1/3" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <div className="px-5 py-10 text-center text-[13px] text-[var(--fg-subtle)]">{text}</div>;
}

interface SmallCounterProps {
  icon: typeof Database;
  label: string;
  value: number;
  href: string;
  loading?: boolean;
}

function SmallCounter({ icon: Icon, label, value, href, loading }: SmallCounterProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-token-sm transition-colors hover:border-[var(--primary)]"
    >
      <span className="inline-flex size-9 items-center justify-center rounded-[10px] bg-[var(--primary-soft)] text-[var(--primary)]">
        <Icon className="size-[18px]" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 grow">
        <div className="text-[12px] text-[var(--fg-subtle)]">{label}</div>
        {loading ? (
          <span className="skel mt-1 h-5 w-12" />
        ) : (
          <div className="font-display text-[20px] font-semibold leading-tight -tracking-[0.01em]">
            {value}
          </div>
        )}
      </div>
      <ArrowRight className="size-4 text-[var(--fg-subtle)]" strokeWidth={1.75} />
    </Link>
  );
}
