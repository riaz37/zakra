'use client';

import Link from 'next/link';
import { type ColumnDef } from '@tanstack/react-table';
import { Loader2, Zap } from 'lucide-react';

import type { DatabaseConnection } from '@/types';
import { StatusBadge } from '@/components/shared/status-badge';
import { RowActions } from '@/components/shared/row-actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/format-date';

import type { StatusVariant } from '@/components/shared/status-badge';

function resolveStatus(connection: DatabaseConnection): {
  status: StatusVariant;
  label: string;
} {
  if (!connection.is_active) return { status: 'inactive', label: 'Inactive' };
  if (connection.last_error) return { status: 'suspended', label: 'Error' };
  if (connection.last_connected_at) return { status: 'active', label: 'Active' };
  return { status: 'pending', label: 'Untested' };
}

interface GetConnectionsColumnsArgs {
  onTest: (connection: DatabaseConnection) => void;
  onEdit: (connection: DatabaseConnection) => void;
  onDelete: (connection: DatabaseConnection) => void;
  testingId: string | null;
}

export function getConnectionsColumns({
  onTest,
  onEdit,
  onDelete,
  testingId,
}: GetConnectionsColumnsArgs): ColumnDef<DatabaseConnection>[] {
  return [
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <Link
          href={`/db-connections/${row.original.id}`}
          onClick={(e) => e.stopPropagation()}
          className="font-sans text-button font-medium text-foreground transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline-none"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      id: 'engine',
      header: 'Engine',
      cell: ({ row }) => (
        <span className="font-mono text-mono-sm uppercase tracking-[0.06em] text-muted-strong">
          {row.original.database_type}
        </span>
      ),
    },
    {
      id: 'host',
      header: 'Host',
      cell: ({ row }) => (
        <span className="font-mono text-mono-sm text-muted">
          {row.original.host}
          <span className="text-subtle">:</span>
          {row.original.port}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const { status, label } = resolveStatus(row.original);
        return <StatusBadge status={status} label={label} />;
      },
    },
    {
      id: 'last_tested',
      header: 'Last tested',
      cell: ({ row }) => (
        <span className="font-mono text-mono text-muted">
          {row.original.last_connected_at
            ? formatDate(row.original.last_connected_at)
            : 'Never'}
        </span>
      ),
    },
    {
      id: 'default',
      header: 'Default',
      cell: ({ row }) =>
        row.original.is_default ? (
          <Badge variant="success" size="sm">
            Default
          </Badge>
        ) : (
          <span aria-hidden className="text-subtle">
            —
          </span>
        ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const isTesting = testingId === row.original.id;
        return (
          <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onTest(row.original);
              }}
              disabled={isTesting}
              aria-label={`Test ${row.original.name}`}
              className="text-muted hover:text-accent"
            >
              {isTesting ? (
                <Loader2
                  aria-hidden
                  size={13}
                  strokeWidth={1.75}
                  className="animate-spin"
                />
              ) : (
                <Zap aria-hidden size={13} strokeWidth={1.75} />
              )}
            </Button>
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
        );
      },
    },
  ];
}
