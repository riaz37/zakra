'use client';

import { Database, Leaf, Server } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { DatabaseConnection } from '@/types';
import { StatusBadge } from '@/components/shared/status-badge';
import type { StatusVariant } from '@/components/shared/status-badge';
import { cn } from '@/lib/utils';

function formatTimestamp(iso: string | null): string {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function DbTypeIcon({ type }: { type: DatabaseConnection['database_type'] }) {
  if (type === 'postgresql') {
    return (
      <Database
        aria-hidden="true"
        size={18}
        strokeWidth={1.5}
        className="text-muted"
      />
    );
  }
  if (type === 'mssql') {
    return (
      <Server
        aria-hidden="true"
        size={18}
        strokeWidth={1.5}
        className="text-muted"
      />
    );
  }
  return (
    <Leaf
      aria-hidden="true"
      size={18}
      strokeWidth={1.5}
      className="text-muted"
    />
  );
}

function resolveStatus(connection: DatabaseConnection): StatusVariant {
  if (!connection.is_active) return 'inactive';
  if (connection.last_error) return 'suspended';
  if (connection.last_connected_at) return 'active';
  return 'pending';
}

interface ConnectionCardProps {
  connection: DatabaseConnection;
  onTest: (id: string) => void;
  isTesting?: boolean;
}

export function ConnectionCard({
  connection,
  onTest,
  isTesting = false,
}: ConnectionCardProps) {
  const router = useRouter();
  const status = resolveStatus(connection);

  function handleCardClick() {
    router.push(`/db-connections/${connection.id}`);
  }

  function handleTestClick(e: React.MouseEvent) {
    e.stopPropagation();
    onTest(connection.id);
  }

  return (
    <article
      onClick={handleCardClick}
      className={cn(
        'bg-background border border-border rounded-lg p-4',
        'hover:bg-surface-200 cursor-pointer transition-colors',
      )}
      aria-label={`Database connection: ${connection.name}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-300">
            <DbTypeIcon type={connection.database_type} />
          </div>
          <div className="min-w-0">
            <p className="font-sans text-[15px] font-medium text-foreground truncate">
              {connection.name}
            </p>
            <p
              className="font-mono text-caption text-muted truncate"
            >
              {connection.host}:{connection.port}
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <StatusBadge
            status={status}
            label={
              status === 'suspended'
                ? 'Error'
                : status === 'pending'
                  ? 'Untested'
                  : undefined
            }
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="font-sans text-caption text-muted">
          Tested: {formatTimestamp(connection.last_connected_at)}
        </p>
        <button
          type="button"
          onClick={handleTestClick}
          disabled={isTesting}
          aria-label={`Test connection for ${connection.name}`}
          className={cn(
            'inline-flex items-center justify-center rounded-md px-2.5 py-1',
            'font-sans text-caption text-foreground border border-border bg-transparent',
            'transition-colors hover:bg-surface-300 hover:text-foreground',
            'focus-visible:outline-none focus-visible:border-border-medium',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          {isTesting ? 'Testing…' : 'Test Connection'}
        </button>
      </div>

      {connection.last_error ? (
        <p className="mt-2 font-mono text-caption text-error truncate" title={connection.last_error}>
          {connection.last_error}
        </p>
      ) : null}
    </article>
  );
}
