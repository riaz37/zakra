'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import {
  useDbConnection,
  useConnectionSchema,
  useTestConnection,
  useDeleteConnection,
} from '@/hooks/useDbConnections';
import { useBusinessRules, useCreateBusinessRule, useUpdateBusinessRule, useDeleteBusinessRule } from '@/hooks/useBusinessRules';
import { StatusBadge } from '@/components/shared/status-badge';
import type { StatusVariant } from '@/components/shared/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldGroup, FieldLabel, FieldError } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { DatabaseConnection, BusinessRule, TableSchema } from '@/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

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
    { label: 'Last Tested', value: formatDate(connection.last_connected_at) },
    { label: 'Created', value: formatDate(connection.created_at) },
  ];

  return (
    <div className="flex flex-col gap-6">
      {connection.last_error && (
        <div className="rounded-lg border border-error/30 bg-error/5 px-4 py-3">
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
          className="text-destructive hover:text-destructive"
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
          <div
            key={i}
            className="animate-pulse h-11 rounded-lg border border-border bg-surface-300"
            aria-hidden="true"
          />
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
            className="rounded-lg border border-border overflow-hidden"
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

const ruleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  rule_text: z.string().min(1, 'Rule text is required'),
  scope_type: z.enum(['global', 'table', 'user']),
  scope_value: z.string().optional(),
});

type RuleFormValues = z.infer<typeof ruleSchema>;

interface RuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectionId: string;
  companyId?: string;
  editRule?: BusinessRule | null;
}

function RuleDialog({
  open,
  onOpenChange,
  connectionId,
  companyId,
  editRule,
}: RuleDialogProps) {
  const createRule = useCreateBusinessRule(connectionId, companyId);
  const updateRule = useUpdateBusinessRule(connectionId, companyId);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RuleFormValues>({
    resolver: zodResolver(ruleSchema),
    defaultValues: editRule
      ? {
          name: editRule.name,
          rule_text: editRule.rule_text,
          scope_type: editRule.scope_type,
          scope_value: editRule.scope_value ?? '',
        }
      : { name: '', rule_text: '', scope_type: 'global', scope_value: '' },
  });

  async function onSubmit(data: RuleFormValues) {
    try {
      if (editRule) {
        await updateRule.mutateAsync({ ruleId: editRule.id, data });
        toast.success('Rule updated');
      } else {
        await createRule.mutateAsync(data);
        toast.success('Rule created');
      }
      reset();
      onOpenChange(false);
    } catch {
      toast.error('Failed to save rule');
    }
  }

  function handleClose() {
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[min(calc(100vw-2rem),32rem)] max-w-none gap-0 p-6"
      >
        <DialogHeader className="gap-1">
          <DialogTitle className="font-sans text-title font-semibold tracking-[-0.11px] text-foreground">
            {editRule ? 'Edit Rule' : 'Add Rule'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 flex flex-col gap-4" noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="rule-name">Name</FieldLabel>
              <Input
                {...register('name')}
                id="rule-name"
                placeholder="e.g. Exclude test data"
                aria-invalid={!!errors.name}
              />
              {errors.name && <FieldError errors={[errors.name]} />}
            </Field>

            <Controller
              control={control}
              name="scope_type"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="rule-scope">Scope</FieldLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="rule-scope">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Global</SelectItem>
                      <SelectItem value="table">Table</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            <Field data-invalid={!!errors.rule_text}>
              <FieldLabel htmlFor="rule-text">Rule Text</FieldLabel>
              <Textarea
                {...register('rule_text')}
                id="rule-text"
                rows={4}
                placeholder="Describe the business rule in plain language…"
                aria-invalid={!!errors.rule_text}
              />
              {errors.rule_text && <FieldError errors={[errors.rule_text]} />}
            </Field>
          </FieldGroup>

          <div className="mt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editRule ? 'Update Rule' : 'Add Rule'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
        <button
          type="button"
          onClick={() => {
            setEditingRule(null);
            setRuleDialogOpen(true);
          }}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2',
            'font-sans text-button text-white bg-accent',
            'transition-colors hover:opacity-90',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-medium',
          )}
        >
          <span aria-hidden>+</span> Add Rule
        </button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse h-16 rounded-lg border border-border bg-surface-300"
              aria-hidden="true"
            />
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
              className="rounded-lg border border-border bg-background px-4 py-3"
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
                  <button
                    type="button"
                    onClick={() => handleEdit(rule)}
                    className={cn(
                      'rounded-md px-2.5 py-1 font-sans text-caption text-foreground',
                      'border border-border bg-transparent',
                      'transition-colors hover:bg-surface-300',
                      'focus-visible:outline-none focus-visible:border-border-medium',
                    )}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteRuleId(rule.id)}
                    className={cn(
                      'rounded-md px-2.5 py-1 font-sans text-caption text-error',
                      'border border-border bg-transparent',
                      'transition-colors hover:bg-surface-300',
                      'focus-visible:outline-none focus-visible:border-border-medium',
                    )}
                  >
                    Delete
                  </button>
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
  const router = useRouter();
  const companyId = useCurrentCompanyId();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const { data: connection, isLoading } = useDbConnection(id, companyId);

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-6 flex items-center gap-2">
          <div className="animate-pulse h-4 w-24 rounded bg-surface-300" />
          <ChevronRight aria-hidden size={14} className="text-muted" />
          <div className="animate-pulse h-4 w-32 rounded bg-surface-300" />
        </div>
        <div className="animate-pulse h-8 w-48 rounded bg-surface-300" />
        <div className="mt-6 animate-pulse h-64 rounded-lg bg-surface-300" />
      </div>
    );
  }

  if (!connection) {
    return (
      <div className="p-6 lg:p-8">
        <p className="font-sans text-[15px] text-muted">Connection not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => router.push('/db-connections')}
          className="flex items-center gap-1 font-sans text-button text-muted transition-colors hover:text-foreground focus-visible:outline-none"
        >
          <ChevronLeft aria-hidden size={13} strokeWidth={2} />
          Databases
        </button>
        <span aria-hidden className="font-sans text-button text-muted">
          /
        </span>
        <span className="font-sans text-button text-foreground">{connection.name}</span>
      </nav>

      {/* Page title */}
      <h1 className="font-sans text-title font-normal text-foreground">
        {connection.name}
      </h1>
      <p className="mt-0.5 font-mono text-caption text-muted">
        {connection.database_type} · {connection.host}:{connection.port}
      </p>

      {/* Tabs */}
      <div className="mt-6 border-b border-border">
        <div role="tablist" aria-label="Connection details" className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2.5 font-sans text-button transition-colors',
                'border-b-2 -mb-px focus-visible:outline-none',
                activeTab === tab.id
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted hover:text-foreground',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <OverviewTab connection={connection} companyId={companyId} />
        )}
        {activeTab === 'schema' && (
          <SchemaExplorerTab connectionId={id} />
        )}
        {activeTab === 'rules' && (
          <BusinessRulesTab connectionId={id} companyId={companyId} />
        )}
      </div>
    </div>
  );
}
