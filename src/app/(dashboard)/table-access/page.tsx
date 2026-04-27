'use client';

import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { Columns, Table } from 'lucide-react';

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
import { SearchInput } from '@/components/shared/search-input';
import { cn } from '@/lib/utils';
import type { ManagedTable, ColumnPermission, MaskPattern, ColumnPermissionGrant } from '@/types';

// ── Table List Panel ──────────────────────────────────────────────────────────

interface TableListPanelProps {
  tables: ManagedTable[];
  selectedTableName: string | null;
  onSelect: (tableName: string) => void;
}

function TableListPanel({ tables, selectedTableName, onSelect }: TableListPanelProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return tables;
    const q = search.toLowerCase();
    return tables.filter(
      (t) =>
        t.table_name.toLowerCase().includes(q) ||
        t.display_name?.toLowerCase().includes(q),
    );
  }, [tables, search]);

  return (
    <aside className="sticky top-6 lg:top-8 flex w-56 shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-surface-200 max-h-[calc(100dvh-3rem)] lg:max-h-[calc(100dvh-4rem)]">
      {/* Header */}
      <div className="border-b border-border px-3 py-2.5">
        <p className="font-sans text-caption font-medium uppercase tracking-wide text-muted">
          Tables
          <span className="ml-1.5 font-mono text-micro text-subtle">{tables.length}</span>
        </p>
      </div>

      {/* Search */}
      {tables.length > 5 && (
        <div className="border-b border-border p-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Filter tables…"
            ariaLabel="Filter tables"
            debounceMs={150}
          />
        </div>
      )}

      {/* Table list */}
      <ul
        role="listbox"
        aria-label="Managed tables"
        className="flex-1 overflow-y-auto"
      >
        {filtered.length === 0 ? (
          <li className="px-3 py-4 text-center font-sans text-caption text-muted">
            No tables match
          </li>
        ) : (
          filtered.map((table) => {
            const isActive = selectedTableName === table.table_name;
            return (
              <li
                key={table.table_name}
                role="option"
                aria-selected={isActive}
              >
                <button
                  type="button"
                  onClick={() => onSelect(table.table_name)}
                  className={cn(
                    'flex w-full items-start justify-between gap-2 px-3 py-2.5 text-left',
                    'transition-colors focus-visible:bg-surface-400 focus-visible:outline-none',
                    isActive
                      ? 'bg-surface-400 text-foreground'
                      : 'text-muted hover:bg-surface-300 hover:text-foreground',
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-caption font-medium">
                      {table.table_name}
                    </span>
                    {table.display_name && table.display_name !== table.table_name && (
                      <span className="mt-0.5 block truncate font-sans text-caption text-muted">
                        {table.display_name}
                      </span>
                    )}
                  </span>
                  {table.columns.length > 0 && (
                    <span
                      className={cn(
                        'mt-0.5 shrink-0 font-mono text-micro',
                        isActive ? 'text-muted' : 'text-subtle',
                      )}
                    >
                      {table.columns.length}
                    </span>
                  )}
                </button>
              </li>
            );
          })
        )}
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

  type PermissionMap = Record<
    string,
    { permission: ColumnPermission; maskPattern?: MaskPattern | null }
  >;

  const grants: ColumnPermissionGrant[] = Array.isArray(permissionsData) ? permissionsData : [];

  const initialPermissions = useMemo<PermissionMap>(() => {
    const map: PermissionMap = {};
    for (const grant of grants) {
      map[grant.column_name] = {
        permission: grant.permission,
        maskPattern: grant.mask_pattern,
      };
    }
    return map;
  // grants reference changes when permissionsData changes; stringify is not needed
  // because TanStack Query returns a stable reference on cache hit
  }, [grants]);

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

  return (
    <div className="min-w-0 flex-1">
      {/* Table header */}
      <div className="mb-5">
        <div className="flex items-baseline gap-2.5">
          <h2 className="font-sans text-[17px] font-semibold tracking-[-0.2px] text-foreground">
            {table.display_name || table.table_name}
          </h2>
          <span className="font-mono text-caption text-muted">
            {table.schema_name}.{table.table_name}
          </span>
        </div>

        <div className="mt-1.5 flex items-center gap-3">
          {table.description && (
            <p className="font-sans text-button text-muted">{table.description}</p>
          )}
          <div className="flex items-center gap-1 font-sans text-caption text-muted">
            <Columns size={12} strokeWidth={1.75} aria-hidden />
            {table.columns.length} column{table.columns.length !== 1 ? 's' : ''}
          </div>
          {!table.is_active && (
            <span className="rounded bg-warning-bg px-1.5 py-0.5 font-sans text-caption text-warning">
              Inactive
            </span>
          )}
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded-lg border border-border bg-surface-300"
              aria-hidden="true"
            />
          ))}
        </div>
      ) : table.columns.length === 0 ? (
        <p className="font-sans text-button text-muted">
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
    companyId ? { company_id: companyId, page_size: 500 } : undefined,
  );

  const tables: ManagedTable[] = data?.items ?? [];
  const selectedTable = tables.find((t) => t.table_name === selectedTableName) ?? null;

  // Auto-select first table once data arrives — must be in useEffect, not render.
  useEffect(() => {
    if (!selectedTableName && tables.length > 0) {
      setSelectedTableName(tables[0].table_name);
    }
  }, [tables, selectedTableName]);

  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Table Access" />

      {isLoading && (
        <div className="flex gap-4">
          <div className="h-64 w-56 shrink-0 animate-pulse rounded-xl border border-border bg-surface-300" />
          <div className="flex-1 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded-lg border border-border bg-surface-300"
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
        <div className="flex items-start gap-5">
          <TableListPanel
            tables={tables}
            selectedTableName={selectedTableName}
            onSelect={setSelectedTableName}
          />

          {selectedTable ? (
            <PermissionsPanel key={selectedTable.table_name} table={selectedTable} />
          ) : (
            <div className="flex flex-1 items-center justify-center py-16">
              <p className="font-sans text-button text-muted">
                Select a table to manage column permissions.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
