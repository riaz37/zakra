'use client';


import type { ColumnDef } from '@tanstack/react-table';
import { Database, Server, Edit2, Trash2, Zap, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { DatabaseConnection } from '@/types';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/format-date';

export interface DatabaseColumnActions {
  onTest: (connection: DatabaseConnection) => void;
  onEdit: (connection: DatabaseConnection) => void;
  onDelete: (connection: DatabaseConnection) => void;
  isTestingId: string | null;
}

function resolveStatus(connection: DatabaseConnection): {
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  label: string;
} {
  if (!connection.is_active) return { status: 'inactive', label: 'Inactive' };
  if (connection.last_error) return { status: 'suspended', label: 'Error' };
  if (connection.last_connected_at) return { status: 'active', label: 'Active' };
  return { status: 'pending', label: 'Untested' };
}

function EngineIcon({ engine, className }: { engine: string; className?: string }) {
  switch (engine.toLowerCase()) {
    case 'postgresql':
    case 'mssql':
      return <Database className={className} />;
    default:
      return <Server className={className} />;
  }
}

export function getDatabaseColumns(actions: DatabaseColumnActions): ColumnDef<DatabaseConnection>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Connection Name',
      cell: ({ row }) => {
        const connection = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded bg-surface-300 text-muted-strong shadow-sm ring-1 ring-border group-hover:text-foreground">
              <EngineIcon engine={connection.database_type} className="size-4" />
            </div>
            <div className="flex flex-col">
              <Link 
                href={`/db-connections/${connection.id}`}
                className="font-sans text-[13px] font-semibold tracking-tight text-foreground hover:text-accent hover:underline line-clamp-1"
              >
                {connection.name}
              </Link>
              {connection.is_default && (
                <div className="mt-0.5">
                  <Badge variant="success" size="sm" className="h-4 px-1 text-[9px]">
                    Default
                  </Badge>
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'database_type',
      header: 'Engine',
      cell: ({ row }) => (
        <span className="font-mono text-xs uppercase tracking-wider text-muted-strong">
          {row.original.database_type}
        </span>
      ),
    },
    {
      id: 'host',
      header: 'Host',
      cell: ({ row }) => {
        const connection = row.original;
        return (
          <div className="font-mono text-xs text-foreground truncate max-w-[200px]" title={`${connection.host}:${connection.port}`}>
            {connection.host}<span className="text-subtle">:{connection.port}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'database_name',
      header: 'Database',
      cell: ({ row }) => (
        <div className="font-mono text-xs text-foreground truncate max-w-[150px]" title={row.original.database_name}>
          {row.original.database_name}
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const { status, label } = resolveStatus(row.original);
        return <StatusBadge status={status as any} label={label} />;
      },
    },
    {
      accessorKey: 'last_connected_at',
      header: 'Last Tested',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-strong">
          {row.original.last_connected_at ? formatDate(row.original.last_connected_at) : 'Never'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const connection = row.original;
        const isTesting = actions.isTestingId === connection.id;

        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              className="h-8 w-8"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                actions.onTest(connection);
              }}
              disabled={isTesting}
              title="Test connection"
            >
              {isTesting ? (
                <Loader2 aria-hidden size={14} className="animate-spin text-muted" />
              ) : (
                <Zap aria-hidden size={14} className="text-muted-strong" />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8 text-muted hover:text-foreground"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                actions.onEdit(connection);
              }}
              aria-label={`Edit ${connection.name}`}
            >
              <Edit2 size={14} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8 text-muted hover:text-error"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                actions.onDelete(connection);
              }}
              aria-label={`Delete ${connection.name}`}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        );
      },
      size: 120,
    },
  ];
}
