'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Columns, Key, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ColumnSchema } from '@/types';

export interface SchemaColumnActions {
  // Add actions here if needed later (e.g., edit business rule)
}

export function getSchemaColumns(): ColumnDef<ColumnSchema>[] {
  return [
    {
      id: 'icon',
      header: '',
      accessorKey: 'name',
      cell: ({ row }) => {
        const col = row.original;
        const Icon = col.is_primary_key
          ? Key
          : col.is_foreign_key
          ? Link2
          : Columns;
        const iconClass = col.is_primary_key
          ? 'text-accent'
          : col.is_foreign_key
          ? 'text-muted'
          : 'text-subtle';

        return (
          <div className="flex items-center justify-center">
            <Icon
              aria-hidden
              size={12}
              strokeWidth={1.75}
              className={iconClass}
            />
          </div>
        );
      },
      size: 32,
    },
    {
      accessorKey: 'name',
      header: 'Column Name',
      cell: ({ row }) => {
        const col = row.original;
        return (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-mono-sm font-medium text-foreground">
                {col.name}
              </span>
              {col.is_primary_key && (
                <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-accent">
                  PK
                </span>
              )}
            </div>
            {col.is_foreign_key && col.references && (
              <div className="flex items-center gap-1 font-mono text-[10px] text-subtle">
                <Link2 size={10} className="shrink-0" />
                <span className="truncate" title={`References ${col.references}`}>
                  {col.references}
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'data_type',
      header: 'Data Type',
      cell: ({ row }) => (
        <span className="rounded-[3px] bg-surface-300 px-1.5 py-0.5 font-mono text-[10px] tracking-[0.04em] text-muted-strong">
          {row.original.data_type}
        </span>
      ),
    },
    {
      accessorKey: 'is_nullable',
      header: 'Nullable',
      cell: ({ row }) => {
        const isNullable = row.original.is_nullable;
        return (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'size-1.5 rounded-full',
                isNullable ? 'bg-accent' : 'bg-subtle/30',
              )}
            />
            <span className="font-sans text-[11px] text-muted">
              {isNullable ? 'Yes' : 'No'}
            </span>
          </div>
        );
      },
    },
  ];
}
