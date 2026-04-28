'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import {
  useDbConnection,
  useConnectionSchema,
  useTestConnection,
  useDeleteConnection,
} from '@/hooks/useDbConnections';
import { useBusinessRules, useDeleteBusinessRule } from '@/hooks/useBusinessRules';
import { PageHeader } from '@/components/shared/page-header';
import {
  ScaffoldContainer,
  ScaffoldFilterAndContent,
} from '@/components/shared/scaffold';
import { StatusBadge } from '@/components/shared/status-badge';
import type { StatusVariant } from '@/components/shared/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { RuleDialog } from '@/components/features/db-connections/rule-dialog';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/format-date';
import { Skeleton } from '@/components/shared/skeleton';
import type { DatabaseConnection, BusinessRule, TableSchema } from '@/types';

function resolveStatus(connection: DatabaseConnection): StatusVariant {
  if (!connection.is_active) return 'inactive';
  if (connection.last_error) return 'suspended';
  if (connection.last_connected_at) return 'active';
  return 'pending';
}

// ── Overview Tab ─────────────────────────────────────────────────────────────

interface OverviewTabProps {
  connection: DatabaseConnection;
  companyId?: string;
}

function OverviewTab({ connection, companyId }: OverviewTabProps) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const testConnection = useTestConnection(companyId);
  const deleteConnection = useDeleteConnection(companyId);

  async function handleTest() {
    try {
      const result = await testConnection.mutateAsync(connection.id);
      if (result.success) {
        toast.success(
          `Connection successful${result.latency_ms != null ? ` (${result.latency_ms}ms)` : ''}`,
        );
      } else {
        toast.error(result.message || 'Connection test failed');
      }
    } catch {
      toast.error('Connection test failed');
    }
  }

  async function handleDelete() {
    await deleteConnection.mutateAsync(connection.id);
    toast.success('Connection deleted');
    router.push('/db-connections');
  }

  const details: Array<{ label: string; value: React.ReactNode }> = [
    { label: 'Type', value: connection.database_type },
    { label: 'Host', value: <span className="font-mono">{connection.host}</span> },
    { label: 'Port', value: <span className="font-mono">{connection.port}</span> },
    { label: 'Database', value: <span className="font-mono">{connection.database_name}</span> },
    { label: 'Username', value: <span className="font-mono">{connection.username}</span> },
    {
      label: 'Status',
      value: (
        <StatusBadge
          status={resolveStatus(connection)}
          label={
            !connection.is_active
              ? 'Inactive'
              : connection.last_error
                ? 'Error'
                : connection.last_connected_at
                  ? 'Active'
                  : 'Untested'
          }
        />
      ),
    },
    { label: 'Last Tested', value: connection.last_connected_at ? formatDateTime(connection.last_connected_at) : '—' },
    { label: 'Created', value: connection.created_at ? formatDateTime(connection.created_at) : '—' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {connection.last_error && (
        <div
          role="alert"
          className="rounded-card border border-error/20 bg-error/5 px-4 py-3"
        >
          <p className="font-sans text-button font-medium text-error">Last Error</p>
          <p className="mt-1 font-mono text-caption text-error/80">
            {connection.last_error}
          </p>
        </div>
      )}

      <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
        {details.map(({ label, value }) => (
          <div key={label}>
            <dt className="font-sans text-caption font-medium uppercase tracking-wide text-muted">
              {label}
            </dt>
            <dd className="mt-1 font-sans text-button text-foreground">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex items-center gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleTest}
          isLoading={testConnection.isPending}
        >
          Test Connection
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setConfirmDelete(true)}
          className="text-error hover:text-error"
        >
          Delete
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete Connection"
        description={`Are you sure you want to delete "${connection.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteConnection.isPending}
      />
    </div>
  );
}

// ── Schema Explorer Tab ───────────────────────────────────────────────────────

interface SchemaExplorerTabProps {
  connectionId: string;
}

function SchemaExplorerTab({ connectionId }: SchemaExplorerTabProps) {
  const { data, isLoading } = useConnectionSchema(connectionId);
  const [openTables, setOpenTables] = useState<Record<string, boolean>>({});

  function toggleTable(tableName: string) {
    setOpenTables((prev) => ({ ...prev, [tableName]: !prev[tableName] }));
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-11" rounded="lg" />
        ))}
      </div>
    );
  }

  const tables: TableSchema[] = Array.isArray(data) ? data : [];

  if (tables.length === 0) {
    return (
      <p className="font-sans text-[15px] text-muted">
        Schema loading… Run schema discovery to populate table structure.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {tables.map((table) => {
        const isOpen = openTables[table.table_name] ?? false;
        return (
          <div
            key={table.table_name}
            className="rounded-card border border-border overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggleTable(table.table_name)}
              aria-expanded={isOpen}
              className={cn(
                'flex w-full items-center justify-between gap-2 px-4 py-3',
                'bg-background hover:bg-surface-200 transition-colors',
                'font-sans text-button text-foreground focus-visible:outline-none',
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="font-mono text-button font-medium"
                >
                  {table.schema_name}.{table.table_name}
                </span>
                {table.display_name && table.display_name !== table.table_name && (
                  <span className="font-sans text-button text-muted">
                    {table.display_name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-sans text-caption text-muted">
                  {table.columns.length} cols
                </span>
                {isOpen ? (
                  <ChevronDown aria-hidden size={14} className="text-muted" />
                ) : (
                  <ChevronRight aria-hidden size={14} className="text-muted" />
                )}
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-border bg-surface-100">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-2 font-sans text-caption font-medium uppercase tracking-wide text-muted">
                        Column
                      </th>
                      <th className="px-4 py-2 font-sans text-caption font-medium uppercase tracking-wide text-muted">
                        Type
                      </th>
                      <th className="px-4 py-2 font-sans text-caption font-medium uppercase tracking-wide text-muted">
                        Nullable
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.columns.map((col) => (
                      <tr key={col.name} className="border-b border-border last:border-0">
                        <td className="px-4 py-2">
                          <span
                            className="font-mono text-caption text-foreground"
                          >
                            {col.name}
                            {col.is_primary_key && (
                              <span className="ml-1.5 text-micro text-gold">PK</span>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className="font-mono text-caption text-muted"
                          >
                            {col.data_type}
                          </span>
                        </td>
                        <td className="px-4 py-2 font-sans text-caption text-muted">
                          {col.is_nullable ? 'Yes' : 'No'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Business Rules Tab ────────────────────────────────────────────────────────

interface BusinessRulesTabProps {
  connectionId: string;
  companyId?: string;
}

function BusinessRulesTab({ connectionId, companyId }: BusinessRulesTabProps) {
  const { data, isLoading } = useBusinessRules(connectionId, undefined, companyId);
  const deleteRule = useDeleteBusinessRule(connectionId, companyId);

  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<BusinessRule | null>(null);
  const [confirmDeleteRuleId, setConfirmDeleteRuleId] = useState<string | null>(null);

  const rules: BusinessRule[] = data?.rules ?? [];

  function handleEdit(rule: BusinessRule) {
    setEditingRule(rule);
    setRuleDialogOpen(true);
  }

  function handleDialogClose(open: boolean) {
    if (!open) {
      setEditingRule(null);
    }
    setRuleDialogOpen(open);
  }

  async function handleDelete() {
    if (!confirmDeleteRuleId) return;
    await deleteRule.mutateAsync(confirmDeleteRuleId);
    toast.success('Rule deleted');
    setConfirmDeleteRuleId(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditingRule(null);
            setRuleDialogOpen(true);
          }}
        >
          <span aria-hidden>+</span> Add Rule
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-16" rounded="lg" />
          ))}
        </div>
      )}

      {!isLoading && rules.length === 0 && (
        <EmptyState
          title="No business rules"
          description="Add rules to help the AI understand how to interpret your data."
        />
      )}

      {!isLoading && rules.length > 0 && (
        <div className="flex flex-col gap-2">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="rounded-card border border-border bg-background px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-sans text-button font-medium text-foreground">
                      {rule.name}
                    </p>
                    <Badge variant="default" size="sm">
                      {rule.scope_type}
                    </Badge>
                  </div>
                  <p className="mt-1 font-sans text-button text-muted line-clamp-2">
                    {rule.rule_text}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(rule)}>
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmDeleteRuleId(rule.id)}
                    className="text-error hover:border-error/50"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <RuleDialog
        open={ruleDialogOpen}
        onOpenChange={handleDialogClose}
        connectionId={connectionId}
        companyId={companyId}
        editRule={editingRule}
      />

      <ConfirmDialog
        open={confirmDeleteRuleId !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteRuleId(null);
        }}
        title="Delete Rule"
        description="Are you sure you want to delete this rule? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteRule.isPending}
      />
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

type TabId = 'overview' | 'schema' | 'rules';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'schema', label: 'Schema Explorer' },
  { id: 'rules', label: 'Business Rules' },
];

// ── Page ──────────────────────────────────────────────────────────────────────

interface DbConnectionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function DbConnectionDetailPage({ params }: DbConnectionDetailPageProps) {
  const { id } = use(params);
  const companyId = useCurrentCompanyId();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const { data: connection, isLoading } = useDbConnection(id, companyId);

  if (isLoading) {
    return (
      <ScaffoldContainer>
        <div className="space-y-4 py-6">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-6 h-64" rounded="lg" />
        </div>
      </ScaffoldContainer>
    );
  }

  if (!connection) {
    return (
      <ScaffoldContainer>
        <div className="py-6">
          <p className="font-sans text-button text-muted">Connection not found.</p>
        </div>
      </ScaffoldContainer>
    );
  }

  return (
    <ScaffoldContainer>
      <PageHeader
        breadcrumbs={[
          { label: 'Databases', href: '/db-connections' },
          { label: connection.name },
        ]}
        title={connection.name}
        subtitle={
          <span className="font-mono text-caption text-muted">
            {connection.database_type} · {connection.host}:{connection.port}
          </span>
        }
        navigationItems={TABS.map((tab) => ({
          label: tab.label,
          active: activeTab === tab.id,
          onClick: () => setActiveTab(tab.id),
        }))}
      />

      <ScaffoldFilterAndContent className="mt-6">
        {activeTab === 'overview' && (
          <OverviewTab connection={connection} companyId={companyId} />
        )}
        {activeTab === 'schema' && (
          <SchemaExplorerTab connectionId={id} />
        )}
        {activeTab === 'rules' && (
          <BusinessRulesTab connectionId={id} companyId={companyId} />
        )}
      </ScaffoldFilterAndContent>
    </ScaffoldContainer>
  );
}
