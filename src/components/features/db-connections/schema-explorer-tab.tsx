'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Columns,
  Database,
  GraduationCap,
  RefreshCw,
  Search,
  Table2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  useConnectionSchema,
  useDiscoverTablesQuery,
  useLearnSchema,
  useResumeAiSync,
  useSchemaProgress,
  useUnlearnTables,
} from '@/hooks/useDbConnections';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { SearchInput } from '@/components/shared/search-input';
import { Skeleton } from '@/components/shared/skeleton';
import type { ColumnDef } from '@tanstack/react-table';
import type { ColumnSchema, TableSchema } from '@/types';
import { useBackgroundTasksStore } from '@/store/backgroundTasksStore';
import { cn } from '@/lib/utils';
import { DataTable } from '@/components/shared/data-table';
import { getSchemaColumns } from './schema-columns';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SchemaExplorerTabProps {
  connectionId: string;
  companyId?: string;
  connectionName?: string;
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

// ── DiscoverDialog ────────────────────────────────────────────────────────────

interface DiscoverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectionId: string;
  companyId?: string;
  learnedKeys: Set<string>;
  onLearn: (tableNames: string[]) => Promise<void>;
  isLearning: boolean;
}

function DiscoverDialog({
  open,
  onOpenChange,
  connectionId,
  companyId,
  learnedKeys,
  onLearn,
  isLearning,
}: DiscoverDialogProps) {
  const { data, isLoading } = useDiscoverTablesQuery(
    open ? connectionId : undefined,
    companyId,
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!open) {
      setSelected(new Set());
      setFilter('');
    }
  }, [open]);

  const unlearned = useMemo(() => {
    const list = data ?? [];
    return list.filter(
      (t) => !learnedKeys.has(`${t.schema_name}.${t.table_name}`),
    );
  }, [data, learnedKeys]);

  const filtered = useMemo(() => {
    if (!filter.trim()) return unlearned;
    const q = filter.toLowerCase();
    return unlearned.filter(
      (t) =>
        t.table_name.toLowerCase().includes(q) ||
        t.schema_name.toLowerCase().includes(q),
    );
  }, [unlearned, filter]);

  const allSelected =
    filtered.length > 0 && filtered.every((t) => selected.has(`${t.schema_name}.${t.table_name}`));
  const someSelected = selected.size > 0;

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        for (const t of filtered) next.delete(`${t.schema_name}.${t.table_name}`);
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        for (const t of filtered) next.add(`${t.schema_name}.${t.table_name}`);
        return next;
      });
    }
  }

  async function handleSync() {
    if (selected.size === 0) return;
    try {
      await onLearn(Array.from(selected));
      onOpenChange(false);
    } catch {
      // toast handled upstream
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add tables</DialogTitle>
          <p className="font-sans text-body text-fg-muted">
            Pick tables you want the AI to learn. Already-learned tables are hidden.
          </p>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <SearchInput
                value={filter}
                onChange={setFilter}
                placeholder="Filter discovered tables…"
                ariaLabel="Filter discovered tables"
              />
            </div>
            {filtered.length > 0 && (
              <button
                type="button"
                onClick={toggleAll}
                className="font-mono text-mono-sm text-fg-muted transition-colors hover:text-foreground"
              >
                {allSelected ? 'Clear' : 'Select all'}
              </button>
            )}
          </div>

          <div className="flex max-h-80 flex-col overflow-y-auto rounded-lg border border-border bg-surface-100">
            {isLoading ? (
              <div className="flex flex-col gap-1 p-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-8" rounded="md" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-4 py-10 text-center font-sans text-body text-fg-muted">
                {(data ?? []).length === 0
                  ? 'No tables discovered yet.'
                  : 'All discovered tables are already learned.'}
              </div>
            ) : (
              <ul role="list" className="divide-y divide-border">
                {filtered.map((t) => {
                  const key = `${t.schema_name}.${t.table_name}`;
                  const isSelected = selected.has(key);
                  return (
                    <li key={key}>
                      <label
                        className={cn(
                          'flex cursor-pointer items-center gap-3 px-3 py-2 transition-colors',
                          isSelected
                            ? 'bg-accent/8'
                            : 'hover:bg-surface-300',
                        )}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggle(key)}
                          aria-label={`Select ${key}`}
                        />
                        <Table2
                          aria-hidden
                          size={13}
                          strokeWidth={1.75}
                          className="shrink-0 text-fg-subtle"
                        />
                        <span className="min-w-0 flex-1 truncate font-mono text-mono-sm text-foreground">
                          {t.table_name}
                        </span>
                        <span className="shrink-0 font-mono text-micro text-fg-subtle">
                          {t.schema_name}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLearning}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleSync}
            disabled={!someSelected || isLearning}
            isLoading={isLearning}
          >
            Sync selected
            {someSelected ? ` (${selected.size})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
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
      <div className="border-b border-border px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="font-sans text-micro font-medium uppercase tracking-wide text-fg-muted">
            Tables
            <span className="ml-1.5 font-mono text-micro text-fg-subtle">
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

        <label className="mt-2 flex cursor-pointer items-center gap-2 select-none">
          <Switch
            size="sm"
            checked={hideSystem}
            onCheckedChange={onHideSystemChange}
          />
          <span className="font-sans text-body text-fg-muted">
            Hide system
          </span>
        </label>
      </div>

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

      <ul
        role="listbox"
        aria-label="Database tables"
        className="flex-1 overflow-y-auto"
      >
        {totalVisible === 0 ? (
          <li className="px-3 py-4 text-center font-sans text-body text-fg-muted">
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
                    className="shrink-0 text-fg-subtle"
                  />
                  <span className="truncate font-mono text-mono-sm font-medium text-fg-muted">
                    {group.schema}
                  </span>
                  <span className="ml-auto shrink-0 font-mono text-micro text-fg-subtle">
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
                          'flex w-full cursor-pointer items-center gap-2 px-3 py-[7px] text-left',
                          'border-l-2 transition-colors',
                          'focus-visible:bg-surface-400 focus-visible:outline-none',
                          isActive
                            ? 'border-l-accent bg-surface-400 text-foreground'
                            : columnMatchOnly
                            ? 'border-l-accent/40 text-fg-muted hover:bg-surface-300 hover:text-foreground'
                            : 'border-l-transparent text-fg-muted hover:bg-surface-300 hover:text-foreground',
                        )}
                      >
                        <Table2
                          aria-hidden
                          size={13}
                          strokeWidth={1.75}
                          className={cn(
                            'shrink-0',
                            isActive
                              ? 'text-fg-muted'
                              : isSys
                              ? 'text-fg-subtle'
                              : 'text-fg-muted',
                          )}
                        />
                        <span
                          className={cn(
                            'min-w-0 flex-1 truncate font-mono text-mono-sm',
                            isActive ? 'font-medium text-foreground' : '',
                            isSys && !isActive ? 'text-fg-muted' : '',
                          )}
                        >
                          {table.table_name}
                        </span>
                        <span
                          className={cn(
                            'shrink-0 font-mono text-micro tabular-nums',
                            isActive ? 'text-fg-muted' : 'text-fg-subtle',
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
  onUnlearn: () => void;
  isUnlearning: boolean;
  learningActive: boolean;
}

const SCHEMA_COL_PAGE_SIZE = 20;

function TableDetailPanel({
  table,
  onUnlearn,
  isUnlearning,
  learningActive,
}: TableDetailPanelProps) {
  const [colSearch, setColSearch] = useState('');
  const [colPage, setColPage] = useState(0);
  const [confirmUnlearn, setConfirmUnlearn] = useState(false);

  const columns = useMemo<ColumnDef<ColumnSchema>[]>(() => getSchemaColumns(), []);

  const filteredColumns = useMemo(() => {
    if (!colSearch.trim()) return table.columns;
    const term = colSearch.toLowerCase();
    return table.columns.filter((c) =>
      c.name.toLowerCase().includes(term) ||
      c.data_type.toLowerCase().includes(term)
    );
  }, [table.columns, colSearch]);

  const colTotalCount = filteredColumns.length;
  const colTotalPages = Math.max(1, Math.ceil(colTotalCount / SCHEMA_COL_PAGE_SIZE));
  const pagedColumns = filteredColumns.slice(
    colPage * SCHEMA_COL_PAGE_SIZE,
    (colPage + 1) * SCHEMA_COL_PAGE_SIZE,
  );

  function handleColSearch(value: string) {
    setColSearch(value);
    setColPage(0);
  }

  function handleUnlearnClick() {
    setConfirmUnlearn(true);
  }

  return (
    <div className="min-w-0 flex-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <h2 className="font-sans text-heading font-semibold tracking-tight text-foreground">
                {table.display_name || table.table_name}
              </h2>
              <span className="font-mono text-body text-fg-muted">
                {table.schema_name}.{table.table_name}
              </span>
            </div>
            {table.description ? (
              <p className="max-w-2xl font-sans text-body text-fg-muted">
                {table.description}
              </p>
            ) : (
              <p className="font-sans text-body italic text-fg-subtle">
                No description provided for this table.
              </p>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleUnlearnClick}
            isLoading={isUnlearning}
            disabled={isUnlearning || learningActive}
            title={
              learningActive
                ? 'Cannot unlearn while learning is in progress'
                : undefined
            }
            className="text-error hover:bg-error/10 hover:text-error disabled:opacity-40"
          >
            <Trash2 aria-hidden size={13} strokeWidth={1.75} className="mr-1.5" />
            Unlearn
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-pill bg-surface-300 px-2.5 py-1 font-sans text-micro font-medium text-muted-strong shadow-sm ring-1 ring-border">
            <Columns size={12} strokeWidth={1.75} className="text-fg-muted" />
            {table.columns.length} {table.columns.length === 1 ? 'column' : 'columns'}
          </div>

          {table.row_count != null && (
            <div className="flex items-center gap-1.5 rounded-pill bg-surface-300 px-2.5 py-1 font-sans text-micro font-medium text-muted-strong shadow-sm ring-1 ring-border">
              <span className="font-mono">{formatRowCount(table.row_count)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="w-full max-w-sm">
          <SearchInput
            value={colSearch}
            onChange={handleColSearch}
            placeholder="Search columns by name or type…"
            ariaLabel="Search table columns"
          />
        </div>
      </div>

      <div className="w-full">
        <DataTable
          columns={columns}
          data={pagedColumns}
          caption={`${table.table_name} columns definition`}
          emptyMessage="No columns found matching your search."
          pageIndex={colPage}
          pageCount={colTotalPages}
          onPageChange={setColPage}
          totalCount={colTotalCount}
        />
      </div>

      <ConfirmDialog
        open={confirmUnlearn}
        onOpenChange={setConfirmUnlearn}
        title="Unlearn table"
        description={`Remove "${table.schema_name}.${table.table_name}" from AI context? It will no longer be available for natural-language queries until re-learned.`}
        confirmLabel="Unlearn"
        variant="destructive"
        onConfirm={onUnlearn}
        isLoading={isUnlearning}
      />
    </div>
  );
}

// ── SchemaExplorerTab ─────────────────────────────────────────────────────────

export function SchemaExplorerTab({ connectionId, companyId, connectionName }: SchemaExplorerTabProps) {
  const { data, isLoading } = useConnectionSchema(connectionId);
  const learnSchema = useLearnSchema(connectionId);
  const unlearnTables = useUnlearnTables(connectionId, companyId);
  const resumeAiSync = useResumeAiSync(connectionId);
  const startSchemaLearning = useBackgroundTasksStore(
    (s) => s.startSchemaLearning,
  );
  const queryClient = useQueryClient();

  const [selectedTableKey, setSelectedTableKey] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [hideSystem, setHideSystem] = useState(true);
  const [discoverOpen, setDiscoverOpen] = useState(false);

  // Poll progress while learning OR while AI sync is in_progress on the server
  const [pollingProgress, setPollingProgress] = useState(false);
  const polling = learnSchema.isPending || pollingProgress;
  const { data: progress } = useSchemaProgress(connectionId, polling);

  // Drive polling from server-side AI-sync state so we keep showing the bar
  // even after the mutation resolves.
  useEffect(() => {
    if (!progress) return;
    const aiStatus = progress.ai_sync?.status;
    const basicStatus = progress.basic_extraction?.status;
    const stillRunning =
      aiStatus === 'in_progress' || basicStatus === 'in_progress';
    if (stillRunning) {
      setPollingProgress(true);
    } else if (!learnSchema.isPending) {
      setPollingProgress(false);
    }
  }, [progress, learnSchema.isPending]);

  async function handleLearnAll() {
    try {
      setPollingProgress(true);
      await learnSchema.mutateAsync(undefined);
      // POST resolves once basic_extraction is done; ai_sync may still be running
      startSchemaLearning(connectionId, connectionName ?? connectionId);
    } catch {
      setPollingProgress(false);
      toast.error('Failed to start schema learning');
    }
  }

  async function handleLearnSelected(tableNames: string[]) {
    try {
      setPollingProgress(true);
      await learnSchema.mutateAsync(tableNames);
      startSchemaLearning(connectionId, connectionName ?? connectionId);
    } catch {
      setPollingProgress(false);
      toast.error('Failed to queue tables for learning');
      throw new Error('learn failed');
    }
  }

  async function handleUnlearn(tableName: string) {
    try {
      await unlearnTables.mutateAsync([tableName]);
      toast.success('Table unlearned');
      setSelectedTableKey(null);
    } catch {
      toast.error('Failed to unlearn table');
    }
  }

  const handleRefreshView = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['db-connections', connectionId, 'schema'] });
  }, [queryClient, connectionId]);

  async function handleResume() {
    try {
      await resumeAiSync.mutateAsync();
      setPollingProgress(true);
      startSchemaLearning(connectionId, connectionName ?? connectionId);
    } catch {
      toast.error('Failed to resume AI sync');
    }
  }

  const allTables: TableSchema[] = useMemo(
    () => (Array.isArray(data) ? data : []),
    [data],
  );

  const learnedKeys = useMemo(
    () =>
      new Set(allTables.map((t) => `${t.schema_name}.${t.table_name}`)),
    [allTables],
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

  useEffect(() => {
    if (!selectedTableKey && filtered.length > 0) {
      const first = filtered[0].table;
      setSelectedTableKey(`${first.schema_name}.${first.table_name}`);
    }
  }, [filtered, selectedTableKey]);

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

  // ── Progress derived state ──
  const aiSync = progress?.ai_sync;
  const basicExtraction = progress?.basic_extraction;
  const isProgressActive =
    aiSync?.status === 'in_progress' ||
    basicExtraction?.status === 'in_progress' ||
    learnSchema.isPending;

  const needsResume =
    !!progress &&
    !isProgressActive &&
    !resumeAiSync.isPending &&
    progress.schema_learned &&
    aiSync !== undefined &&
    aiSync.status !== 'completed' &&
    (aiSync.pending > 0 || aiSync.failed > 0);

  // Loading state (initial)
  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-10 w-full" rounded="lg" />
        <div className="flex gap-5">
          <Skeleton className="h-64 w-56 shrink-0" rounded="xl" />
          <div className="flex-1 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9" rounded="lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state — no tables learned yet
  if (allTables.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        {needsResume && (
          <ResumeBanner onResume={handleResume} isLoading={resumeAiSync.isPending} />
        )}
        <EmptyState
          icon={Database}
          title="No tables learned yet"
          description="Run schema discovery to introspect this database. Learned tables become available to the AI for natural-language queries."
          primaryAction={{
            label: 'Sync schema',
            onClick: handleLearnAll,
            isLoading: learnSchema.isPending,
          }}
          secondaryAction={{
            label: 'Add tables',
            onClick: () => setDiscoverOpen(true),
          }}
        />
        <DiscoverDialog
          open={discoverOpen}
          onOpenChange={setDiscoverOpen}
          connectionId={connectionId}
          companyId={companyId}
          learnedKeys={learnedKeys}
          onLearn={handleLearnSelected}
          isLearning={learnSchema.isPending}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface-200 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-mono-sm text-fg-subtle">Synced</span>
          <span className="rounded-[3px] bg-surface-300 px-1.5 py-0.5 font-mono text-mono-sm font-medium tabular-nums text-foreground">
            {allTables.length}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDiscoverOpen(true)}
          >
            Add tables
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleLearnAll}
            isLoading={learnSchema.isPending}
            disabled={learnSchema.isPending}
          >
            Sync schema
          </Button>
        </div>
      </div>

      {/* Resume banner */}
      {needsResume && (
        <ResumeBanner onResume={handleResume} isLoading={resumeAiSync.isPending} />
      )}

      {/* Main split */}
      <div className="flex items-start gap-5">
        <SchemaTreePanel
          groups={groups}
          allTablesCount={visibleTables.length}
          selectedTableKey={selectedTableKey}
          onSelect={setSelectedTableKey}
          hideSystem={hideSystem}
          onHideSystemChange={setHideSystem}
          onRefresh={handleRefreshView}
          isRefreshing={isLoading}
          query={query}
          onQueryChange={setQuery}
          showGroupHeaders={showGroupHeaders}
          matchInfoByKey={matchInfoByKey}
          isFiltering={isFiltering}
          filteredCount={filtered.length}
        />

        {selectedTable ? (
          <TableDetailPanel
            key={`${selectedTable.schema_name}.${selectedTable.table_name}`}
            table={selectedTable}
            onUnlearn={() =>
              handleUnlearn(`${selectedTable.schema_name}.${selectedTable.table_name}`)
            }
            isUnlearning={unlearnTables.isPending}
            learningActive={isProgressActive}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center py-16">
            <p className="font-sans text-body text-fg-muted">
              Select a table to view its columns.
            </p>
          </div>
        )}
      </div>

      <DiscoverDialog
        open={discoverOpen}
        onOpenChange={setDiscoverOpen}
        connectionId={connectionId}
        companyId={companyId}
        learnedKeys={learnedKeys}
        onLearn={handleLearnSelected}
        isLearning={learnSchema.isPending}
      />
    </div>
  );
}

// ── ResumeBanner ──────────────────────────────────────────────────────────────

interface ResumeBannerProps {
  onResume: () => void;
  isLoading: boolean;
}

function ResumeBanner({ onResume, isLoading }: ResumeBannerProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-warning-border bg-warning-bg px-4 py-3">
      <div className="flex items-center gap-2.5">
        <AlertTriangle
          aria-hidden
          size={14}
          strokeWidth={1.75}
          className="shrink-0 text-warning"
        />
        <div className="flex flex-col gap-0.5">
          <p className="font-sans text-body font-medium text-warning">
            AI sync was interrupted
          </p>
          <p className="font-sans text-micro text-warning/80">
            Some tables still need AI descriptions and embeddings.
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="warning"
        size="sm"
        onClick={onResume}
        isLoading={isLoading}
      >
        Resume AI sync
      </Button>
    </div>
  );
}
