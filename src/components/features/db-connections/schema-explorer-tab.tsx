'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  Columns,
  Database,
  Key,
  Link2,
  RefreshCw,
  Table2,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  useConnectionSchema,
  useLearnSchema,
} from '@/hooks/useDbConnections';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { EmptyState } from '@/components/shared/empty-state';
import { SearchInput } from '@/components/shared/search-input';
import { Skeleton } from '@/components/shared/skeleton';
import type { ColumnSchema, TableSchema } from '@/types';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SchemaExplorerTabProps {
  connectionId: string;
}

interface SchemaGroup {
  schema: string;
  tables: TableSchema[];
}

interface MatchInfo {
  matchesName: boolean;
  matchesColumn: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRowCount(n: number | null | undefined): string {
  if (n == null || n === 0) return '—';
  const formatted = n.toLocaleString('en-US');
  return n < 1000 ? `${n} rows` : `${formatted} rows`;
}

function isSystemTable(name: string): boolean {
  const lower = name.toLowerCase();
  return (
    lower.startsWith('__') ||
    lower.startsWith('sys') ||
    lower.startsWith('#')
  );
}

function matchTable(table: TableSchema, query: string): MatchInfo | null {
  if (!query) return { matchesName: true, matchesColumn: false };
  const q = query.toLowerCase();
  const matchesName =
    table.table_name.toLowerCase().includes(q) ||
    table.schema_name.toLowerCase().includes(q) ||
    (table.display_name?.toLowerCase().includes(q) ?? false);
  const matchesColumn = table.columns.some((c) =>
    c.name.toLowerCase().includes(q),
  );
  if (matchesName || matchesColumn) {
    return { matchesName, matchesColumn };
  }
  return null;
}

// ── SchemaTreePanel ───────────────────────────────────────────────────────────

interface SchemaTreePanelProps {
  groups: SchemaGroup[];
  allTablesCount: number;
  selectedTableKey: string | null;
  onSelect: (key: string) => void;
  hideSystem: boolean;
  onHideSystemChange: (value: boolean) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  showGroupHeaders: boolean;
  matchInfoByKey: Map<string, MatchInfo>;
  isFiltering: boolean;
  filteredCount: number;
}

function SchemaTreePanel({
  groups,
  allTablesCount,
  selectedTableKey,
  onSelect,
  hideSystem,
  onHideSystemChange,
  onRefresh,
  isRefreshing,
  query,
  onQueryChange,
  showGroupHeaders,
  matchInfoByKey,
  isFiltering,
  filteredCount,
}: SchemaTreePanelProps) {
  const totalVisible = groups.reduce((sum, g) => sum + g.tables.length, 0);

  return (
    <aside className="sticky top-6 lg:top-8 flex w-56 shrink-0 flex-col overflow-hidden rounded-card border border-border bg-surface-200 max-h-[calc(100dvh-3rem)] lg:max-h-[calc(100dvh-4rem)]">
      {/* Panel header */}
      <div className="border-b border-border px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="font-sans text-caption font-medium uppercase tracking-wide text-muted">
            Tables
            <span className="ml-1.5 font-mono text-micro text-subtle">
              {isFiltering ? `${filteredCount}/${allTablesCount}` : allTablesCount}
            </span>
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onRefresh}
            isLoading={isRefreshing}
            title="Refresh schema"
          >
            <RefreshCw aria-hidden size={12} strokeWidth={1.75} />
          </Button>
        </div>

        {/* Hide system tables toggle */}
        <label className="mt-2 flex cursor-pointer items-center gap-2 select-none">
          <Switch
            size="sm"
            checked={hideSystem}
            onCheckedChange={onHideSystemChange}
          />
          <span className="font-sans text-caption text-muted">
            Hide system
          </span>
        </label>
      </div>

      {/* Search */}
      {allTablesCount > 5 && (
        <div className="border-b border-border p-2">
          <SearchInput
            value={query}
            onChange={onQueryChange}
            placeholder="Filter tables…"
            ariaLabel="Search schema"
            debounceMs={150}
          />
        </div>
      )}

      {/* Tree */}
      <ul
        role="listbox"
        aria-label="Database tables"
        className="flex-1 overflow-y-auto"
      >
        {totalVisible === 0 ? (
          <li className="px-3 py-4 text-center font-sans text-caption text-muted">
            No tables match
          </li>
        ) : (
          groups.map((group) => (
            <li key={group.schema}>
              {showGroupHeaders && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-border bg-surface-300">
                  <Table2
                    aria-hidden
                    size={11}
                    strokeWidth={1.75}
                    className="shrink-0 text-subtle"
                  />
                  <span className="truncate font-mono text-mono-sm font-medium text-muted">
                    {group.schema}
                  </span>
                  <span className="ml-auto shrink-0 font-mono text-micro text-subtle">
                    {group.tables.length}
                  </span>
                </div>
              )}

              <ul role="group">
                {group.tables.map((table) => {
                  const key = `${table.schema_name}.${table.table_name}`;
                  const isActive = selectedTableKey === key;
                  const isSys = isSystemTable(table.table_name);
                  const match = matchInfoByKey.get(key);
                  const columnMatchOnly =
                    isFiltering &&
                    match !== undefined &&
                    !match.matchesName &&
                    match.matchesColumn;

                  return (
                    <li key={key} role="option" aria-selected={isActive}>
                      <button
                        type="button"
                        onClick={() => onSelect(key)}
                        className={cn(
                          'flex w-full items-center gap-2 px-3 py-[7px] text-left',
                          'border-l-2 transition-colors',
                          'focus-visible:bg-surface-400 focus-visible:outline-none',
                          isActive
                            ? 'border-l-accent bg-surface-400 text-foreground'
                            : columnMatchOnly
                            ? 'border-l-accent/40 text-muted hover:bg-surface-300 hover:text-foreground'
                            : 'border-l-transparent text-muted hover:bg-surface-300 hover:text-foreground',
                        )}
                      >
                        <Table2
                          aria-hidden
                          size={13}
                          strokeWidth={1.75}
                          className={cn(
                            'shrink-0',
                            isActive
                              ? 'text-muted'
                              : isSys
                              ? 'text-subtle'
                              : 'text-muted',
                          )}
                        />
                        <span
                          className={cn(
                            'min-w-0 flex-1 truncate font-mono text-mono-sm',
                            isActive ? 'font-medium text-foreground' : '',
                            isSys && !isActive ? 'text-muted' : '',
                          )}
                        >
                          {table.table_name}
                        </span>
                        <span
                          className={cn(
                            'shrink-0 font-mono text-micro tabular-nums',
                            isActive ? 'text-muted' : 'text-subtle',
                          )}
                        >
                          {table.columns.length}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))
        )}
      </ul>
    </aside>
  );
}

// ── TableDetailPanel ──────────────────────────────────────────────────────────

interface TableDetailPanelProps {
  table: TableSchema;
  query: string;
}

function TableDetailPanel({ table, query }: TableDetailPanelProps) {
  return (
    <div className="min-w-0 flex-1">
      {/* Detail header */}
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
          {table.description ? (
            <p className="font-sans text-button text-muted">{table.description}</p>
          ) : null}

          <div className="flex items-center gap-1 font-sans text-caption text-muted">
            <Columns size={12} strokeWidth={1.75} aria-hidden />
            {table.columns.length} {table.columns.length === 1 ? 'column' : 'columns'}
          </div>

          {table.row_count != null && table.row_count > 0 ? (
            <span className="font-mono text-caption tabular-nums text-muted">
              {formatRowCount(table.row_count)}
            </span>
          ) : null}
        </div>
      </div>

      {/* Column list */}
      {table.columns.length === 0 ? (
        <p className="font-sans text-button text-muted">
          No columns discovered for this table.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface-200">
          {table.columns.map((col) => (
            <ColumnRow key={col.name} column={col} query={query} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── ColumnRow ─────────────────────────────────────────────────────────────────

interface ColumnRowProps {
  column: ColumnSchema;
  query: string;
}

function ColumnRow({ column, query }: ColumnRowProps) {
  const Icon = column.is_primary_key
    ? Key
    : column.is_foreign_key
    ? Link2
    : Columns;
  const iconClass = column.is_primary_key
    ? 'text-accent'
    : column.is_foreign_key
    ? 'text-muted'
    : 'text-subtle';

  const isMatch =
    query.length > 0 &&
    column.name.toLowerCase().includes(query.toLowerCase());

  const hasDescription = !!column.description?.trim();

  return (
    <div
      className={cn(
        'flex flex-col gap-1 border-b border-border px-4 py-2 last:border-0',
        'transition-colors hover:bg-surface-300',
        isMatch && 'bg-accent/[0.04]',
      )}
    >
      <div className="flex items-center gap-2.5">
        <Icon
          aria-hidden
          size={12}
          strokeWidth={1.75}
          className={cn('shrink-0', iconClass)}
        />

        <span className="truncate font-mono text-mono-sm text-foreground">
          {column.name}
        </span>

        {column.is_primary_key ? (
          <span className="shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-accent">
            PK
          </span>
        ) : null}

        {column.is_foreign_key && column.references ? (
          <span
            title={`References ${column.references}`}
            className="min-w-0 max-w-[40%] truncate font-mono text-[10px] text-subtle"
          >
            → {column.references}
          </span>
        ) : null}

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <span className="rounded-[3px] bg-surface-300 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.04em] text-muted-strong">
            {column.data_type}
          </span>

          <span
            title={column.is_nullable ? 'Nullable' : 'Required'}
            aria-label={column.is_nullable ? 'Nullable' : 'Required'}
            className={cn(
              'inline-block size-1.5 rounded-full',
              column.is_nullable ? 'bg-subtle' : 'bg-accent',
            )}
          />
        </div>
      </div>

      {hasDescription ? (
        <p className="pl-[22px] font-sans text-caption italic text-subtle">
          {column.description}
        </p>
      ) : null}
    </div>
  );
}

// ── SchemaExplorerTab ─────────────────────────────────────────────────────────

export function SchemaExplorerTab({ connectionId }: SchemaExplorerTabProps) {
  const { data, isLoading } = useConnectionSchema(connectionId);
  const learnSchema = useLearnSchema(connectionId);

  const [selectedTableKey, setSelectedTableKey] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [hideSystem, setHideSystem] = useState(true);

  async function handleRefresh() {
    try {
      await learnSchema.mutateAsync(undefined);
      toast.success('Schema refresh started');
    } catch {
      toast.error('Failed to start schema refresh');
    }
  }

  const allTables: TableSchema[] = useMemo(
    () => (Array.isArray(data) ? data : []),
    [data],
  );

  const visibleTables = useMemo(
    () => allTables.filter((t) => !hideSystem || !isSystemTable(t.table_name)),
    [allTables, hideSystem],
  );

  const filtered = useMemo(
    () =>
      visibleTables
        .map((table) => {
          const match = matchTable(table, query);
          return match ? { table, match } : null;
        })
        .filter(
          (x): x is { table: TableSchema; match: MatchInfo } => x !== null,
        ),
    [visibleTables, query],
  );

  const groups: SchemaGroup[] = useMemo(() => {
    const map = new Map<string, TableSchema[]>();
    for (const { table } of filtered) {
      const list = map.get(table.schema_name) ?? [];
      list.push(table);
      map.set(table.schema_name, list);
    }
    return Array.from(map.entries())
      .map(([schema, tables]) => ({ schema, tables }))
      .sort((a, b) => a.schema.localeCompare(b.schema));
  }, [filtered]);

  const matchInfoByKey = useMemo(() => {
    const m = new Map<string, MatchInfo>();
    for (const { table, match } of filtered) {
      m.set(`${table.schema_name}.${table.table_name}`, match);
    }
    return m;
  }, [filtered]);

  const showGroupHeaders = groups.length > 1;
  const isFiltering = query.length > 0;

  // Auto-select first table once data arrives
  useEffect(() => {
    if (!selectedTableKey && filtered.length > 0) {
      const first = filtered[0].table;
      setSelectedTableKey(`${first.schema_name}.${first.table_name}`);
    }
  }, [filtered, selectedTableKey]);

  // Find selected table object
  const selectedTable = useMemo(() => {
    if (!selectedTableKey) return null;
    const [schemaName, ...rest] = selectedTableKey.split('.');
    const tableName = rest.join('.');
    return (
      allTables.find(
        (t) => t.schema_name === schemaName && t.table_name === tableName,
      ) ?? null
    );
  }, [selectedTableKey, allTables]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex gap-5">
        <Skeleton className="h-64 w-56 shrink-0" rounded="xl" />
        <div className="flex-1 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9" rounded="lg" />
          ))}
        </div>
      </div>
    );
  }

  // Empty state — no tables learned yet
  if (allTables.length === 0) {
    return (
      <EmptyState
        icon={Database}
        title="No tables learned yet"
        description="Run schema discovery to introspect this database. Learned tables become available to the AI for natural-language queries."
        primaryAction={{
          label: 'Refresh schema',
          onClick: handleRefresh,
          isLoading: learnSchema.isPending,
        }}
      />
    );
  }

  return (
    <div className="flex items-start gap-5">
      <SchemaTreePanel
        groups={groups}
        allTablesCount={visibleTables.length}
        selectedTableKey={selectedTableKey}
        onSelect={setSelectedTableKey}
        hideSystem={hideSystem}
        onHideSystemChange={setHideSystem}
        onRefresh={handleRefresh}
        isRefreshing={learnSchema.isPending}
        query={query}
        onQueryChange={setQuery}
        showGroupHeaders={showGroupHeaders}
        matchInfoByKey={matchInfoByKey}
        isFiltering={isFiltering}
        filteredCount={filtered.length}
      />

      {selectedTable ? (
        <TableDetailPanel
          key={selectedTable.table_name}
          table={selectedTable}
          query={query}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center py-16">
          <p className="font-sans text-button text-muted">
            Select a table to view its columns.
          </p>
        </div>
      )}
    </div>
  );
}
