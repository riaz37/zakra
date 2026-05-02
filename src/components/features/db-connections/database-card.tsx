'use client';

import Link from 'next/link';
import { Database, Server, Loader2, Zap, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DatabaseConnection } from '@/types';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/format-date';

type StatusVariant = 'active' | 'inactive' | 'suspended' | 'pending' | 'completed' | 'failed';

function resolveStatus(connection: DatabaseConnection): {
  status: StatusVariant;
  label: string;
} {
  if (!connection.is_active) return { status: 'inactive', label: 'Inactive' };
  if (connection.last_error) return { status: 'suspended', label: 'Error' };
  if (connection.last_connected_at) return { status: 'active', label: 'Active' };
  return { status: 'pending', label: 'Untested' };
}

function EngineIcon({ engine, className }: { engine: string; className?: string }) {
  // Can expand to specific SVG logos later if needed
  switch (engine.toLowerCase()) {
    case 'postgresql':
    case 'mysql':
    case 'mssql':
      return <Database className={className} />;
    default:
      return <Server className={className} />;
  }
}

interface DatabaseCardProps {
  connection: DatabaseConnection;
  onTest: (connection: DatabaseConnection) => void;
  onEdit: (connection: DatabaseConnection) => void;
  onDelete: (connection: DatabaseConnection) => void;
  isTesting: boolean;
}

export function DatabaseCard({
  connection,
  onTest,
  onEdit,
  onDelete,
  isTesting,
}: DatabaseCardProps) {
  const { status, label } = resolveStatus(connection);

  return (
    <Link
      href={`/db-connections/${connection.id}`}
      className={cn(
        'group relative flex flex-col rounded-xl border border-border bg-surface-100 p-5 transition-all duration-200',
        'hover:border-border-medium hover:bg-surface-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-300 text-muted-strong shadow-sm ring-1 ring-border transition-colors group-hover:text-foreground">
            <EngineIcon engine={connection.database_type} size={20} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-sans text-[15px] font-semibold tracking-tight text-foreground line-clamp-1">
              {connection.name}
            </h3>
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-strong">
              {connection.database_type}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {connection.is_default && (
            <Badge variant="success" size="sm" className="pointer-events-none">
              Default
            </Badge>
          )}
          <StatusBadge status={status} label={label} />
        </div>
      </div>

      {/* Body */}
      <div className="mt-5 grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
        <div>
          <p className="font-sans text-caption text-muted mb-0.5">Host</p>
          <p className="font-mono text-xs text-foreground truncate" title={`${connection.host}:${connection.port}`}>
            {connection.host}<span className="text-subtle">:{connection.port}</span>
          </p>
        </div>
        <div>
          <p className="font-sans text-caption text-muted mb-0.5">Database</p>
          <p className="font-mono text-xs text-foreground truncate" title={connection.database_name}>
            {connection.database_name}
          </p>
        </div>
        <div className="col-span-2">
          <p className="font-sans text-caption text-muted mb-0.5">Last tested</p>
          <p className="font-mono text-xs text-muted-strong">
            {connection.last_connected_at ? formatDate(connection.last_connected_at) : 'Never'}
          </p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-8 gap-1.5 px-3"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onTest(connection);
          }}
          disabled={isTesting}
        >
          {isTesting ? (
            <Loader2 aria-hidden size={14} strokeWidth={2} className="animate-spin text-muted" />
          ) : (
            <Zap aria-hidden size={14} strokeWidth={2} className="text-muted-strong" />
          )}
          <span className="text-muted-strong">{isTesting ? 'Testing...' : 'Test'}</span>
        </Button>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted hover:text-foreground"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(connection);
            }}
            aria-label={`Edit ${connection.name}`}
          >
            <Edit2 size={14} strokeWidth={2} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted hover:text-error"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(connection);
            }}
            aria-label={`Delete ${connection.name}`}
          >
            <Trash2 size={14} strokeWidth={2} />
          </Button>
        </div>
      </div>
    </Link>
  );
}
