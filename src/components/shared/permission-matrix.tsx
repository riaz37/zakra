'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ManagedColumn, ColumnPermission, MaskPattern } from '@/types';
import { COLUMN_PERMISSIONS, MASK_PATTERNS } from '@/utils/constants';
import { Search, X } from 'lucide-react';

const PERMISSION_LEVELS: ColumnPermission[] = [
  COLUMN_PERMISSIONS.NONE,
  COLUMN_PERMISSIONS.READ,
  COLUMN_PERMISSIONS.READ_MASKED,
  COLUMN_PERMISSIONS.WRITE,
] as ColumnPermission[];

const PERMISSION_LABELS: Record<ColumnPermission, string> = {
  none: 'None',
  read: 'Read',
  read_masked: 'Masked',
  write: 'Write',
};

const MASK_PATTERN_OPTIONS = Object.values(MASK_PATTERNS) as MaskPattern[];

function headerColorClass(level: ColumnPermission): string {
  switch (level) {
    case 'read': return 'text-read';
    case 'read_masked': return 'text-edit';
    case 'write': return 'text-grep';
    default: return 'text-muted';
  }
}

function selectedBgClass(level: ColumnPermission): string {
  switch (level) {
    case 'read': return 'bg-read';
    case 'read_masked': return 'bg-edit';
    case 'write': return 'bg-grep';
    default: return 'bg-muted/50';
  }
}

function shortType(dataType: string): string {
  return dataType
    .replace('character varying', 'varchar')
    .replace('timestamp without time zone', 'timestamp')
    .replace('timestamp with time zone', 'timestamptz')
    .replace('double precision', 'float8')
    .replace('integer', 'int4');
}

export interface ColumnPermissionRow {
  columnName: string;
  permission: ColumnPermission;
  maskPattern?: MaskPattern | null;
}

export interface PermissionMatrixProps {
  columns: ManagedColumn[];
  initialPermissions?: Record<string, { permission: ColumnPermission; maskPattern?: MaskPattern | null }>;
  onSave: (rows: ColumnPermissionRow[]) => void;
  isSaving?: boolean;
}

export function PermissionMatrix({
  columns,
  initialPermissions = {},
  onSave,
  isSaving = false,
}: PermissionMatrixProps) {
  const [rows, setRows] = useState<ColumnPermissionRow[]>(() =>
    columns.map((col) => ({
      columnName: col.name,
      permission: initialPermissions[col.name]?.permission ?? 'none',
      maskPattern: initialPermissions[col.name]?.maskPattern ?? null,
    }))
  );
  const [isDirty, setIsDirty] = useState(false);
  const [columnSearch, setColumnSearch] = useState('');

  useEffect(() => {
    setRows(
      columns.map((col) => ({
        columnName: col.name,
        permission: initialPermissions[col.name]?.permission ?? 'none',
        maskPattern: initialPermissions[col.name]?.maskPattern ?? null,
      }))
    );
    setIsDirty(false);
    setColumnSearch('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns]);

  // Column metadata map for type/nullable lookup
  const columnMeta = useMemo(
    () => Object.fromEntries(columns.map((c) => [c.name, c])),
    [columns]
  );

  // Pending changes count for the save badge
  const pendingCount = useMemo(() => {
    return rows.filter((row) => {
      const initial = initialPermissions[row.columnName];
      return row.permission !== (initial?.permission ?? 'none');
    }).length;
  }, [rows, initialPermissions]);

  const filteredRows = useMemo(() => {
    if (!columnSearch.trim()) return rows;
    const q = columnSearch.toLowerCase();
    return rows.filter((r) => r.columnName.toLowerCase().includes(q));
  }, [rows, columnSearch]);

  function handlePermissionChange(columnName: string, permission: ColumnPermission) {
    setRows((prev) =>
      prev.map((row) =>
        row.columnName === columnName
          ? {
              ...row,
              permission,
              maskPattern: permission === 'read_masked' ? (row.maskPattern ?? 'PARTIAL') : null,
            }
          : row
      )
    );
    setIsDirty(true);
  }

  function handleMaskPatternChange(columnName: string, maskPattern: MaskPattern) {
    setRows((prev) =>
      prev.map((row) =>
        row.columnName === columnName ? { ...row, maskPattern } : row
      )
    );
    setIsDirty(true);
  }

  function setAllPermissions(permission: ColumnPermission) {
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        permission,
        maskPattern: permission === 'read_masked' ? (row.maskPattern ?? 'PARTIAL') : null,
      }))
    );
    setIsDirty(true);
  }

  function handleSave() {
    onSave(rows);
    setIsDirty(false);
  }

  if (columns.length === 0) {
    return <p className="font-sans text-button text-muted">No columns available.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        {/* Column search */}
        <div className="relative flex-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted/50"
          />
          <input
            type="search"
            value={columnSearch}
            onChange={(e) => setColumnSearch(e.target.value)}
            placeholder="Filter columns…"
            aria-label="Filter columns"
            spellCheck={false}
            className={cn(
              'h-8 w-full rounded-lg border border-border bg-transparent pl-8 pr-8',
              'font-sans text-button text-foreground outline-none placeholder:text-muted/40',
              'transition-colors focus:border-border-medium',
              '[&::-webkit-search-cancel-button]:appearance-none',
            )}
          />
          {columnSearch && (
            <button
              type="button"
              onClick={() => setColumnSearch('')}
              aria-label="Clear filter"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted/50 hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Bulk actions */}
        <div className="flex items-center gap-1.5">
          <span className="font-sans text-caption text-muted/50">All:</span>
          {PERMISSION_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setAllPermissions(level)}
              className={cn(
                'rounded px-2 py-1 font-sans text-caption transition-colors',
                'border border-border text-muted hover:text-foreground hover:border-border-medium',
              )}
            >
              {PERMISSION_LABELS[level]}
            </button>
          ))}
        </div>

        {/* Save action */}
        <div className="flex shrink-0 items-center gap-2">
          {isDirty && pendingCount > 0 && (
            <span className="font-sans text-caption text-muted">
              {pendingCount} {pendingCount === 1 ? 'change' : 'changes'}
            </span>
          )}
          <Button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            size="sm"
          >
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Column filter result count */}
      {columnSearch && (
        <p className="font-sans text-caption text-muted/60">
          {filteredRows.length} of {rows.length} columns
        </p>
      )}

      {/* Matrix table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[560px] border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-300">
              <th className="px-4 py-2.5 text-left font-sans text-caption font-medium text-muted">
                Column
              </th>
              {PERMISSION_LEVELS.map((level) => (
                <th
                  key={level}
                  className={cn(
                    'w-24 px-2 py-2.5 text-center font-sans text-caption font-medium',
                    headerColorClass(level),
                  )}
                >
                  {PERMISSION_LABELS[level]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center font-sans text-button text-muted/60"
                >
                  No columns match &ldquo;{columnSearch}&rdquo;
                </td>
              </tr>
            ) : (
              filteredRows.map((row, idx) => {
                const isLast = idx === filteredRows.length - 1;
                const meta = columnMeta[row.columnName];
                return (
                  <React.Fragment key={row.columnName}>
                    <tr
                      className={cn(
                        'group transition-colors hover:bg-surface-300/40',
                        !isLast && row.permission !== 'read_masked' && 'border-b border-border',
                      )}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-caption text-foreground">
                            {row.columnName}
                          </span>
                          {meta?.data_type && (
                            <span className="rounded bg-surface-400 px-1.5 py-0.5 font-mono text-micro text-muted/60">
                              {shortType(meta.data_type)}
                            </span>
                          )}
                          {meta?.is_nullable === false && (
                            <span
                              aria-label="NOT NULL"
                              title="NOT NULL"
                              className="size-1.5 rounded-full bg-muted/30"
                            />
                          )}
                        </div>
                      </td>
                      {PERMISSION_LEVELS.map((level) => {
                        const isSelected = row.permission === level;
                        return (
                          <td key={level} className="px-2 py-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handlePermissionChange(row.columnName, level)}
                              aria-label={`Set ${row.columnName} to ${PERMISSION_LABELS[level]}`}
                              aria-pressed={isSelected}
                              className={cn(
                                'mx-auto flex h-5 w-5 items-center justify-center rounded-full transition-all',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                                isSelected
                                  ? cn('border-0 scale-110', selectedBgClass(level))
                                  : 'border border-border bg-transparent opacity-40 hover:opacity-100 hover:border-border-medium group-hover:opacity-60',
                              )}
                            >
                              {isSelected && (
                                <span
                                  className="block h-2 w-2 rounded-full bg-background/60"
                                  aria-hidden="true"
                                />
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                    {row.permission === 'read_masked' && (
                      <tr
                        className={cn(
                          'bg-surface-100',
                          !isLast && 'border-b border-border',
                        )}
                      >
                        <td colSpan={5} className="px-4 pb-2.5 pt-1">
                          <div className="flex items-center gap-2.5">
                            <label
                              htmlFor={`mask-${row.columnName}`}
                              className="shrink-0 font-sans text-caption text-muted/70"
                            >
                              Mask pattern
                            </label>
                            <Select
                              value={row.maskPattern ?? 'PARTIAL'}
                              onValueChange={(v) =>
                                handleMaskPatternChange(row.columnName, v as MaskPattern)
                              }
                            >
                              <SelectTrigger id={`mask-${row.columnName}`} size="sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent side="bottom">
                                {MASK_PATTERN_OPTIONS.map((pattern) => (
                                  <SelectItem key={pattern} value={pattern} label={pattern}>
                                    {pattern}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
