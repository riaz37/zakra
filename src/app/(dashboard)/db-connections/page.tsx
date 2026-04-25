'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Database, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { useDbConnections, useTestConnection } from '@/hooks/useDbConnections';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { ConnectionCard } from '@/components/shared/connection-card';
import { cn } from '@/lib/utils';

import { ConnectionCardSkeleton } from '@/components/features/db-connections/connection-card-skeleton';
import { AddConnectionDialog } from '@/components/features/db-connections/add-connection-dialog';

export default function DbConnectionsPage() {
  const companyId = useCurrentCompanyId();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  const { data, isLoading } = useDbConnections(
    companyId ? { company_id: companyId } : undefined,
  );

  const testConnection = useTestConnection(companyId);

  const connections = data?.items ?? [];

  async function handleTest(id: string) {
    setTestingId(id);
    try {
      const result = await testConnection.mutateAsync(id);
      if (result.success) {
        toast.success(`Connection successful${result.latency_ms != null ? ` (${result.latency_ms}ms)` : ''}`);
      } else {
        toast.error(result.message || 'Connection test failed');
      }
    } catch {
      toast.error('Connection test failed');
    } finally {
      setTestingId(null);
    }
  }

  return (
    <div className="px-6 py-8">
      <PageHeader
        title="Databases"
        action={
          <Button
            onClick={() => setDialogOpen(true)}
            className="h-9 px-4"
          >
            <Plus aria-hidden size={15} strokeWidth={2} />
            Add Connection
          </Button>
        }
      />

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <ConnectionCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!isLoading && connections.length === 0 && (
        <EmptyState
          icon={Database}
          title="No databases connected"
          description="Connect a database to enable natural language queries and reports."
          action={
            <Button
              onClick={() => setDialogOpen(true)}
              className="h-9 px-4"
            >
              <Plus aria-hidden size={15} strokeWidth={2} />
              Add Connection
            </Button>
          }
        />
      )}

      {!isLoading && connections.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {connections.map((connection) => (
            <ConnectionCard
              key={connection.id}
              connection={connection}
              onTest={handleTest}
              isTesting={testingId === connection.id}
            />
          ))}
        </div>
      )}

      <AddConnectionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        companyId={companyId}
      />
    </div>
  );
}
