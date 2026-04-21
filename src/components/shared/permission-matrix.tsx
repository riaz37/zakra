'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { ManagedColumn, ColumnPermission, MaskPattern } from '@/types';
import { COLUMN_PERMISSIONS, MASK_PATTERNS } from '@/utils/constants';

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

// These colors encode semantic data access levels — intentionally bypassing
// the design token system per design spec.
const PERMISSION_COLORS: Record<ColumnPermission, string | undefined> = {
  none: undefined,
  read: '#9fbbe0',
  read_masked: '#c0a8dd',
  write: '#9fc9a2',
};

const MASK_PATTERN_OPTIONS = Object.values(MASK_PATTERNS) as MaskPattern[];

export interface ColumnPermissionRow {
  columnName: string;
  permission: ColumnPermission;
  maskPattern?: MaskPattern | null;
}

export interface PermissionMatrixProps {
  columns: ManagedColumn[];
  /** Initial permission state for each column. Keyed by column name. */
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

  // Sync when columns or initial permissions change (table switch)
  useEffect(() => {
    setRows(
      columns.map((col) => ({
        columnName: col.name,
        permission: initialPermissions[col.name]?.permission ?? 'none',
        maskPattern: initialPermissions[col.name]?.maskPattern ?? null,
      }))
    );
    setIsDirty(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns]);

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

  function handleSave() {
    onSave(rows);
    setIsDirty(false);
  }

  if (columns.length === 0) {
    return (
      <p className="font-sans text-[14px] text-muted">No columns available.</p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[520px] border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-300">
              <th className="px-4 py-2.5 text-left font-sans text-[11px] font-medium uppercase tracking-wide text-muted">
                Column
              </th>
              {PERMISSION_LEVELS.map((level) => {
                const color = PERMISSION_COLORS[level];
                return (
                  <th
                    key={level}
                    className="w-24 px-2 py-2.5 text-center font-sans text-[11px] font-medium uppercase tracking-wide"
                    style={color ? { color } : { color: 'var(--color-muted)' }}
                  >
                    {PERMISSION_LABELS[level]}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const isLast = idx === rows.length - 1;
              return (
                <React.Fragment key={row.columnName}>
                  <tr
                    className={cn(
                      'hover:bg-surface-300/40 transition-colors',
                      !isLast && row.permission !== 'read_masked'
                        ? 'border-b border-border'
                        : null,
                    )}
                  >
                    <td className="px-4 py-2.5">
                      <span
                        className="font-mono text-[12px] text-foreground"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        {row.columnName}
                      </span>
                    </td>
                    {PERMISSION_LEVELS.map((level) => {
                      const isSelected = row.permission === level;
                      const color = PERMISSION_COLORS[level];
                      return (
                        <td
                          key={level}
                          className="px-2 py-2.5 text-center"
                        >
                          <button
                            type="button"
                            onClick={() => handlePermissionChange(row.columnName, level)}
                            aria-label={`Set ${row.columnName} to ${PERMISSION_LABELS[level]}`}
                            aria-pressed={isSelected}
                            className={cn(
                              'mx-auto flex h-5 w-5 items-center justify-center rounded-full',
                              'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-medium',
                              isSelected ? 'border-0' : 'border border-border bg-transparent',
                            )}
                            style={
                              isSelected && color
                                ? { backgroundColor: color }
                                : isSelected
                                  ? { backgroundColor: 'var(--color-muted)' }
                                  : undefined
                            }
                          >
                            {isSelected && (
                              <span
                                className="block h-2 w-2 rounded-full bg-white/80"
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
                      key={`${row.columnName}-mask`}
                      className={cn(
                        !isLast ? 'border-b border-border' : null,
                        'bg-surface-100',
                      )}
                    >
                      <td colSpan={5} className="px-4 pb-2.5 pt-1">
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor={`mask-${row.columnName}`}
                            className="font-sans text-[12px] text-muted shrink-0"
                          >
                            Mask pattern:
                          </label>
                          <select
                            id={`mask-${row.columnName}`}
                            value={row.maskPattern ?? 'PARTIAL'}
                            onChange={(e) =>
                              handleMaskPatternChange(
                                row.columnName,
                                e.target.value as MaskPattern,
                              )
                            }
                            className={cn(
                              'rounded-md border border-border bg-background px-2 py-1',
                              'font-mono text-[12px] text-foreground',
                              'focus:outline-none focus:border-border-medium',
                            )}
                            style={{ fontFamily: 'var(--font-mono)' }}
                          >
                            {MASK_PATTERN_OPTIONS.map((pattern) => (
                              <option key={pattern} value={pattern}>
                                {pattern}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className={cn(
            'inline-flex items-center justify-center rounded-lg px-4 py-2',
            'font-sans text-[14px] text-white',
            'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-medium',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          {isSaving ? 'Saving…' : 'Save permissions'}
        </button>
      </div>
    </div>
  );
}
