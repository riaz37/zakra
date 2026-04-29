'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Database, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import {
  useDbConnections,
  useDeleteConnection,
  useTestConnection,
} from '@/hooks/useDbConnections';
import { useResourceList } from '@/hooks/useResourceList';
import type { DatabaseConnection } from '@/types';

import { PageHeader } from '@/components/shared/page-header';
import {
  ScaffoldContainer,
  ScaffoldFilterAndContent,
  ScaffoldActionsContainer,
} from '@/components/shared/scaffold';
import { SearchInput } from '@/components/shared/search-input';
import { DataTable } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

import { AddConnectionDialog } from '@/components/features/db-connections/add-connection-dialog';
import { getConnectionsColumns } from '@/components/features/db-connections/connections-columns';

export default function DbConnectionsPage() {
  const router = useRouter();
  const companyId = useCurrentCompanyId();
  const { search, searchProps, isEmpty } = useResourceList();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConnection, setEditingConnection] =
    useState<DatabaseConnection | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DatabaseConnection | null>(
    null,
  );
  const [testingId, setTestingId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useDbConnections(
    companyId ? { company_id: companyId } : undefined,
  );

  const testConnection = useTestConnection(companyId);
  const deleteConnection = useDeleteConnection(companyId);

  const connections = data?.items ?? [];

  const filtered = useMemo(() => {
    if (!search) return connections;
    const needle = search.toLowerCase();
    return connections.filter((c) => {
      return (
        c.name.toLowerCase().includes(needle) ||
        c.host.toLowerCase().includes(needle) ||
        c.database_name.toLowerCase().includes(needle)
      );
    });
  }, [connections, search]);

  async function handleTest(connection: DatabaseConnection) {
    setTestingId(connection.id);
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
    } finally {
      setTestingId(null);
    }
  }

  function handleEdit(connection: DatabaseConnection) {
    setEditingConnection(connection);
    setDialogOpen(true);
  }

  function handleAdd() {
    setEditingConnection(null);
    setDialogOpen(true);
  }

  function handleDialogChange(next: boolean) {
    setDialogOpen(next);
    if (!next) setEditingConnection(null);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteConnection.mutateAsync(deleteTarget.id);
      toast.success('Connection deleted');
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete connection');
    }
  }

  const columns = getConnectionsColumns({
    onTest: handleTest,
    onEdit: handleEdit,
    onDelete: (connection) => setDeleteTarget(connection),
    testingId,
  });

  const showEmpty = isEmpty(filtered, isLoading) && !isError;

  return (
    <ScaffoldContainer>
      <PageHeader
        title="Databases"
        subtitle="Connected data sources powering natural language queries and reports."
        primaryActions={
          <Button onClick={handleAdd} className="h-9 px-4">
            <Plus aria-hidden size={16} strokeWidth={1.5} />
            Add connection
          </Button>
        }
      />

      <ScaffoldFilterAndContent>
        <ScaffoldActionsContainer>
          <div className="w-full max-w-sm">
            <SearchInput
              {...searchProps}
              placeholder="Search by name, host, or database…"
              ariaLabel="Search databases"
            />
          </div>
        </ScaffoldActionsContainer>

        {isError ? (
          <ErrorState
            title="Failed to load databases"
            description="There was a problem loading your database connections."
            onRetry={() => refetch()}
          />
        ) : showEmpty ? (
          <EmptyState
            icon={Database}
            title={
              search
                ? 'No databases match your search'
                : 'No databases connected'
            }
            description={
              search
                ? 'Try adjusting your search terms.'
                : 'Connect a database to enable natural language queries and reports.'
            }
            primaryAction={
              !search
                ? { label: 'Add connection', onClick: handleAdd }
                : undefined
            }
          />
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            isLoading={isLoading}
            onRowClick={(row) => router.push(`/db-connections/${row.id}`)}
            caption="Databases list"
            emptyMessage="No databases match your search."
          />
        )}
      </ScaffoldFilterAndContent>

      <AddConnectionDialog
        open={dialogOpen}
        onOpenChange={handleDialogChange}
        companyId={companyId}
        editingConnection={editingConnection}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete connection"
        description={`This will permanently remove "${deleteTarget?.name ?? ''}" and all of its business rules. This action cannot be undone.`}
        confirmLabel="Delete permanently"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={deleteConnection.isPending}
      />
    </ScaffoldContainer>
  );
}
