'use client';

import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { Columns, Table } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import {
  useManagedTables,
  useUserTableColumnPermissions,
  useBulkGrantPermissions,
} from '@/hooks/useTableAccess';
import { useUsers } from '@/hooks/useUsers';
import { PageHeader } from '@/components/shared/page-header';
import {
  ScaffoldContainer,
  ScaffoldFilterAndContent,
} from '@/components/shared/scaffold';
import { EmptyState } from '@/components/shared/empty-state';
import { PermissionMatrix, PermissionMatrixSkeleton } from '@/components/shared/permission-matrix';
import type { ColumnPermissionRow } from '@/components/shared/permission-matrix';
import { SearchInput } from '@/components/shared/search-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/shared/skeleton';
import type { ManagedTable, ColumnPermission, MaskPattern } from '@/types';
import { AnimatedPage } from '@/components/shared/animated-container';
import { fadeUp, staggerContainer, staggerItem } from '@/lib/motion';

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
    <aside className="sticky top-6 lg:top-8 flex w-56 shrink-0 flex-col overflow-hidden rounded-card border border-border bg-surface-200 max-h-[calc(100dvh-3rem)] lg:max-h-[calc(100dvh-4rem)]">
      {/* Header */}
      <div className="border-b border-border px-3 py-2.5">
        <p className="font-sans text-micro font-medium uppercase tracking-wide text-fg-muted">
          Tables
          <span className="ml-1.5 font-mono text-micro text-fg-subtle">{tables.length}</span>
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
      <motion.ul
        role="listbox"
        aria-label="Managed tables"
        className="flex-1 overflow-y-auto"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {filtered.length === 0 ? (
          <li className="px-3 py-4 text-center font-sans text-body text-fg-muted">
            No tables match
          </li>
        ) : (
          filtered.slice(0, 50).map((table) => {
            const isActive = selectedTableName === table.table_name;
            return (
              <motion.li
                key={table.table_name}
                role="option"
                aria-selected={isActive}
                variants={staggerItem}
              >
                <button
                  type="button"
                  onClick={() => onSelect(table.table_name)}
                  className={cn(
                    'flex w-full items-start justify-between gap-2 px-3 py-2.5 text-left',
                    'transition-colors focus-visible:bg-surface-400 focus-visible:outline-none',
                    isActive
                      ? 'bg-surface-400 text-foreground'
                      : 'text-fg-muted hover:bg-surface-300 hover:text-foreground',
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-body font-medium">
                      {table.table_name}
                    </span>
                    {table.display_name && table.display_name !== table.table_name && (
                      <span className="mt-0.5 block truncate font-sans text-caption text-fg-muted">
                        {table.display_name}
                      </span>
                    )}
                  </span>
                  {table.columns.length > 0 && (
                    <span
                      className={cn(
                        'mt-0.5 shrink-0 font-mono text-micro',
                        isActive ? 'text-fg-muted' : 'text-fg-subtle',
                      )}
                    >
                      {table.columns.length}
                    </span>
                  )}
                </button>
              </motion.li>
            );
          })
        )}
      </motion.ul>
    </aside>
  );
}

// ── Permissions Panel ─────────────────────────────────────────────────────────

interface PermissionsPanelProps {
  table: ManagedTable;
  userId: string;
  companyId?: string;
}

function PermissionsPanel({ table, userId, companyId }: PermissionsPanelProps) {
  // Uses GET /data/tables/{name}/user-permissions/{user_id}
  // Returns Record<string, string> e.g. { "firstName": "write", "email": "read_masked" }
  const { data: permissionsMap, isLoading } = useUserTableColumnPermissions(
    table.table_name,
    userId,
    table.schema_name,
    companyId,
  );

  const bulkGrant = useBulkGrantPermissions(table.table_name, table.schema_name);

  type PermissionMap = Record<
    string,
    { permission: ColumnPermission; maskPattern?: MaskPattern | null }
  >;

  const initialPermissions = useMemo<PermissionMap>(() => {
    const map: PermissionMap = {};
    if (permissionsMap && typeof permissionsMap === 'object') {
      for (const [colName, perm] of Object.entries(permissionsMap)) {
        map[colName] = {
          permission: perm as ColumnPermission,
          maskPattern: null,
        };
      }
    }
    return map;
  }, [permissionsMap]);

  async function handleSave(rows: ColumnPermissionRow[]) {
    try {
      const permissionsMap = rows.reduce((acc, row) => {
        // Backend bulk endpoint throws 500 on read_masked mixed with other values — downgrade to read until fixed
        acc[row.columnName] = row.permission === 'read_masked' ? 'read' : row.permission;
        return acc;
      }, {} as Record<string, string>);

      await bulkGrant.mutateAsync({
        grantee_type: 'user',
        grantee_id: userId,
        permissions: permissionsMap,
      });
      toast.success('Permissions saved');
    } catch (err: any) {
      console.error('Save error:', err);
      const serverMsg = err.response?.data?.detail || err.response?.data?.message;
      const msg = serverMsg
        ? (typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg))
        : 'Server unavailable — please try again';
      toast.error('Failed to save permissions', { description: msg });
    }
  }

  return (
    <div className="min-w-0 flex-1">
      {/* Table header */}
      <div className="mb-5">
        <div className="flex items-baseline gap-2.5">
          <h2 className="font-sans text-heading font-semibold tracking-[-0.2px] text-foreground">
            {table.display_name || table.table_name}
          </h2>
          <span className="font-mono text-body text-fg-muted">
            {table.schema_name}.{table.table_name}
          </span>
        </div>

        <div className="mt-1.5 flex items-center gap-3">
          {table.description && (
            <p className="font-sans text-body text-fg-muted">{table.description}</p>
          )}
          <div className="flex items-center gap-1 font-sans text-body text-fg-muted">
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
        <PermissionMatrixSkeleton />
      ) : table.columns.length === 0 ? (
        <p className="font-sans text-body text-fg-muted">
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

// ── helpers ───────────────────────────────────────────────────────────────────

function userDisplayName(user: { first_name: string | null; last_name: string | null; email: string }): string {
  const parts = [user.first_name, user.last_name].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : user.email;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TableAccessPage() {
  const companyId = useCurrentCompanyId();
  const [selectedTableName, setSelectedTableName] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data, isLoading } = useManagedTables(
    companyId ? { company_id: companyId, page_size: 500 } : undefined,
  );
  const { data: usersData, isLoading: usersLoading } = useUsers(
    companyId ? { company_id: companyId, page_size: 200 } : { page_size: 200 },
  );

  const tables: ManagedTable[] = data?.items ?? [];
  const users = usersData?.items ?? [];
  const selectedTable = tables.find((t) => t.table_name === selectedTableName) ?? null;

  // Reset selections when company changes
  useEffect(() => {
    setSelectedTableName(null);
    setSelectedUserId(null);
  }, [companyId]);

  useEffect(() => {
    if (!selectedTableName && tables.length > 0) {
      setSelectedTableName(tables[0].table_name);
    }
  }, [tables, selectedTableName]);

  useEffect(() => {
    if (!selectedUserId && users.length > 0) {
      setSelectedUserId(users[0].id);
    }
  }, [users, selectedUserId]);

  return (
    <ScaffoldContainer size="large">
      <PageHeader
        title="Table Access"
        subtitle="Control which columns each user can read, mask, or modify."
      />

      <AnimatedPage>
        <ScaffoldFilterAndContent>
          {/* User selector */}
          <div className="mb-5 flex items-center gap-3">
            <span className="font-sans text-body text-fg-muted">User</span>
            {usersLoading ? (
              <Skeleton className="h-8 w-56" rounded="lg" />
            ) : (
              <Select
                value={selectedUserId ?? ''}
                onValueChange={setSelectedUserId}
                disabled={users.length === 0}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a user…">
                    {selectedUserId
                      ? userDisplayName(users.find((u) => u.id === selectedUserId) ?? { first_name: null, last_name: null, email: selectedUserId })
                      : 'Select a user…'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false} align="start" className="w-72">
                  {users.map((user) => {
                    const name = userDisplayName(user);
                    const showEmail = name !== user.email;
                    return (
                      <SelectItem key={user.id} value={user.id} label={name} className="py-1.5">
                        <span className="flex flex-col gap-0.5 min-w-0">
                          <span className="truncate">{name}</span>
                          {showEmail && (
                            <span className="truncate text-fg-muted text-caption">{user.email}</span>
                          )}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          </div>

          {(isLoading || usersLoading) && (
            <div className="flex gap-4">
              <Skeleton className="h-64 w-56 shrink-0" rounded="xl" />
              <div className="flex-1 space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10" rounded="lg" />
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

              <AnimatePresence mode="wait">
                {selectedTable && selectedUserId ? (
                  <motion.div
                    key={`${selectedTable.table_name}-${selectedUserId}`}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="min-w-0 flex-1"
                  >
                    <PermissionsPanel
                      table={selectedTable}
                      userId={selectedUserId}
                      companyId={companyId ?? undefined}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-1 items-center justify-center py-16"
                  >
                    <p className="font-sans text-body text-fg-muted">
                      Select a table to manage column permissions.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </ScaffoldFilterAndContent>
      </AnimatedPage>
    </ScaffoldContainer>
  );
}
