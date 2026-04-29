'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Zap, Trash2 } from 'lucide-react';

import {
  useTestConnection,
  useDeleteConnection,
} from '@/hooks/useDbConnections';
import type { DatabaseConnection } from '@/types';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/format-date';
import { cn } from '@/lib/utils';

interface OverviewTabProps {
  connection: DatabaseConnection;
  companyId?: string;
}

interface DetailItem {
  label: string;
  value: React.ReactNode;
}

export function OverviewTab({
  connection,
  companyId,
}: OverviewTabProps) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const testConnection = useTestConnection(companyId);
  const deleteConnection = useDeleteConnection(companyId);

  async function handleTest() {
    try {
      const result = await testConnection.mutateAsync(connection.id);
      if (result.success) {
        toast.success(
          `Connection successful${
            result.latency_ms != null ? ` (${result.latency_ms}ms)` : ''
          }`,
        );
      } else {
        toast.error(result.message || 'Connection test failed');
      }
    } catch {
      toast.error('Connection test failed');
    }
  }

  async function handleDelete() {
    try {
      await deleteConnection.mutateAsync(connection.id);
      toast.success('Connection deleted');
      router.push('/db-connections');
    } catch {
      toast.error('Failed to delete connection');
    }
  }

  const details: DetailItem[] = [
    {
      label: 'Engine',
      value: (
        <span className="font-mono text-mono-sm uppercase tracking-[0.06em]">
          {connection.database_type}
        </span>
      ),
    },
    {
      label: 'Host',
      value: <span className="font-mono text-mono-sm">{connection.host}</span>,
    },
    {
      label: 'Port',
      value: <span className="font-mono text-mono-sm">{connection.port}</span>,
    },
    {
      label: 'Database',
      value: (
        <span className="font-mono text-mono-sm">
          {connection.database_name}
        </span>
      ),
    },
    {
      label: 'Username',
      value: (
        <span className="font-mono text-mono-sm">{connection.username}</span>
      ),
    },
    {
      label: 'Default',
      value: connection.is_default ? (
        <Badge variant="success" size="sm">
          Default
        </Badge>
      ) : (
        <span className="text-muted">No</span>
      ),
    },
    {
      label: 'Last tested',
      value: connection.last_connected_at
        ? formatDateTime(connection.last_connected_at)
        : 'Never',
    },
    {
      label: 'Created',
      value: connection.created_at
        ? formatDateTime(connection.created_at)
        : '—',
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {connection.last_error ? (
        <div
          role="alert"
          className={cn(
            'rounded-lg border border-error-border bg-error-bg px-4 py-3',
          )}
        >
          <p className="font-sans text-micro uppercase tracking-[0.048px] text-error">
            Last error
          </p>
          <p className="mt-1.5 font-mono text-mono-sm leading-[1.5] text-error/90">
            {connection.last_error}
          </p>
        </div>
      ) : null}

      <dl className="grid grid-cols-1 gap-x-12 gap-y-5 md:grid-cols-2">
        {details.map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-1.5">
            <dt className="font-sans text-caption font-medium uppercase tracking-[0.06em] text-muted">
              {label}
            </dt>
            <dd className="font-sans text-button font-medium text-foreground">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap items-center gap-2 pt-2">
        <Button
          type="button"
          onClick={handleTest}
          isLoading={testConnection.isPending}
        >
          <Zap aria-hidden size={14} strokeWidth={1.75} />
          Test connection
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setConfirmDelete(true)}
          className="text-error hover:bg-error/8 hover:text-error"
        >
          <Trash2 aria-hidden size={14} strokeWidth={1.75} />
          Delete connection
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete connection"
        description={`This will permanently remove "${connection.name}" and all of its business rules. This action cannot be undone.`}
        confirmLabel="Delete permanently"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteConnection.isPending}
      />
    </div>
  );
}
