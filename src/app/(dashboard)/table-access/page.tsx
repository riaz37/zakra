'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Table } from 'lucide-react';

import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import {
  useManagedTables,
  useTablePermissions,
  useBulkGrantPermissions,
} from '@/hooks/useTableAccess';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { PermissionMatrix } from '@/components/shared/permission-matrix';
import type { ColumnPermissionRow } from '@/components/shared/permission-matrix';
import { cn } from '@/lib/utils';
import type { ManagedTable, ColumnPermission, MaskPattern, ColumnPermissionGrant } from '@/types';

// ── Table List Panel ──────────────────────────────────────────────────────────

interface TableListPanelProps {
  tables: ManagedTable[];
  selectedTableName: string | null;
  onSelect: (tableName: string) => void;
}

function TableListPanel({
  tables,
  selectedTableName,
  onSelect,
}: TableListPanelProps) {
  return (
    <aside className="w-60 shrink-0 rounded-lg border border-border bg-background overflow-hidden">
      <div className="border-b border-border px-3 py-2.5">
        <p className="font-sans text-[11px] font-medium uppercase tracking-wide text-muted">
          Tables
        </p>
      </div>
      <ul role="listbox" aria-label="Managed tables">
        {tables.map((table) => (
          <li key={table.table_name} role="option" aria-selected={selectedTableName === table.table_name}>
            <button
              type="button"
              onClick={() => onSelect(table.table_name)}
              className={cn(
                'flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left',
                'transition-colors focus-visible:outline-none focus-visible:bg-surface-300',
                selectedTableName === table.table_name
                  ? 'bg-surface-300 text-foreground'
                  : 'text-muted hover:bg-surface-200 hover:text-foreground',
              )}
            >
              <span
                className="font-mono text-[12px] font-medium"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {table.table_name}
              </span>
              {table.display_name && table.display_name !== table.table_name && (
                <span className="font-sans text-[11px] text-muted">{table.display_name}</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

// ── Permissions Panel ─────────────────────────────────────────────────────────

interface PermissionsPanelProps {
  table: ManagedTable;
}

function PermissionsPanel({ table }: PermissionsPanelProps) {
  const { data: permissionsData, isLoading } = useTablePermissions(
    table.table_name,
    table.schema_name,
  );

  const bulkGrant = useBulkGrantPermissions(table.table_name, table.schema_name);

  // Build initial permissions map from existing grants
  type PermissionMap = Record<
    string,
    { permission: ColumnPermission; maskPattern?: MaskPattern | null }
  >;

  const grants: ColumnPermissionGrant[] = Array.isArray(permissionsData) ? permissionsData : [];

  const initialPermissions: PermissionMap = {};
  for (const grant of grants) {
    initialPermissions[grant.column_name] = {
      permission: grant.permission,
      maskPattern: grant.mask_pattern,
    };
  }

  async function handleSave(rows: ColumnPermissionRow[]) {
    try {
      await bulkGrant.mutateAsync({
        grants: rows.map((row) => ({
          column_name: row.columnName,
          grantee_type: 'role' as const,
          grantee_id: 'default',
          permission: row.permission,
          ...(row.maskPattern ? { mask_pattern: row.maskPattern } : {}),
        })),
      });
      toast.success('Permissions saved');
    } catch {
      toast.error('Failed to save permissions');
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1">
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-10 rounded-lg border border-border bg-surface-300"
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0">
      <div className="mb-4 flex items-baseline gap-2">
        <h2 className="font-sans text-[15px] font-medium text-foreground">
          {table.display_name || table.table_name}
        </h2>
        <span
          className="font-mono text-[12px] text-muted"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {table.schema_name}.{table.table_name}
        </span>
      </div>
      {table.columns.length === 0 ? (
        <p className="font-serif text-[14px] text-muted">
          No columns discovered for this table.
        </p>
      ) : (
        <PermissionMatrix
          columns={table.columns}
          initialPermissions={initialPermissions}
          onSave={handleSave}
          isSaving={bulkGrant.isPending}
        />
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TableAccessPage() {
  const companyId = useCurrentCompanyId();
  const [selectedTableName, setSelectedTableName] = useState<string | null>(null);

  const { data, isLoading } = useManagedTables(
    companyId ? { company_id: companyId } : undefined,
  );

  const tables: ManagedTable[] = data?.items ?? [];

  const selectedTable = tables.find((t) => t.table_name === selectedTableName) ?? null;

  // Auto-select first table when data loads
  if (!selectedTableName && tables.length > 0) {
    setSelectedTableName(tables[0].table_name);
  }

  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Table Access" />

      {isLoading && (
        <div className="flex gap-4">
          <div className="animate-pulse w-60 shrink-0 rounded-lg border border-border bg-surface-300 h-64" />
          <div className="flex-1 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse h-10 rounded-lg border border-border bg-surface-300"
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      )}

      {!isLoading && tables.length === 0 && (
        <EmptyState
          icon={Table}
          title="No managed tables"
          description="Enable column-level access control for your connected database tables."
        />
      )}

      {!isLoading && tables.length > 0 && (
        <div className="flex gap-4 items-start">
          <TableListPanel
            tables={tables}
            selectedTableName={selectedTableName}
            onSelect={setSelectedTableName}
          />

          {selectedTable ? (
            <PermissionsPanel
              key={selectedTable.table_name}
              table={selectedTable}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center py-16">
              <p className="font-serif text-[15px] text-muted">
                Select a table to manage column permissions.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
