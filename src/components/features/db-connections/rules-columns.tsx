'use client';

import { type ColumnDef } from '@tanstack/react-table';

import type { BusinessRule } from '@/types';
import { RowActions } from '@/components/shared/row-actions';
import { StatusBadge } from '@/components/shared/status-badge';
import { cn } from '@/lib/utils';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function formatScopeValue(value: string): { display: string; title?: string } {
  if (UUID_RE.test(value)) {
    return { display: value.slice(0, 8) + '…', title: value };
  }
  return { display: value };
}

interface GetRulesColumnsArgs {
  onEdit: (rule: BusinessRule) => void;
  onDelete: (rule: BusinessRule) => void;
  onToggleActive?: (rule: BusinessRule) => void;
}

export function getRulesColumns({
  onEdit,
  onDelete,
  onToggleActive,
}: GetRulesColumnsArgs): ColumnDef<BusinessRule>[] {
  return [
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <span className={cn(
          'font-sans text-button font-medium',
          row.original.is_active ? 'text-foreground' : 'text-muted line-through',
        )}>
          {row.original.name}
        </span>
      ),
    },
    {
      id: 'scope',
      header: 'Scope',
      cell: ({ row }) => {
        const { scope_type, scope_value } = row.original;
        const formatted = scope_value ? formatScopeValue(scope_value) : null;
        return (
          <span
            className="inline-flex items-center gap-1 rounded-[3px] bg-surface-300 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-strong"
            title={formatted?.title}
          >
            {scope_type}
            {formatted ? (
              <>
                <span className="text-subtle">·</span>
                <span className="text-muted normal-case">{formatted.display}</span>
              </>
            ) : null}
          </span>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleActive?.(row.original); }}
          className={cn('cursor-pointer', !onToggleActive && 'pointer-events-none')}
          title={row.original.is_active ? 'Click to disable' : 'Click to enable'}
          aria-label={row.original.is_active ? 'Disable rule' : 'Enable rule'}
        >
          <StatusBadge status={row.original.is_active ? 'active' : 'inactive'} />
        </button>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div
          className="flex items-center justify-end"
          onClick={(e) => e.stopPropagation()}
        >
          <RowActions
            onEdit={(e) => {
              e.stopPropagation();
              onEdit(row.original);
            }}
            onDelete={(e) => {
              e.stopPropagation();
              onDelete(row.original);
            }}
            editLabel={`Edit ${row.original.name}`}
            deleteLabel={`Delete ${row.original.name}`}
          />
        </div>
      ),
    },
  ];
}
