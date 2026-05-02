'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Zap, Trash2 } from 'lucide-react';

import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import {
  useDbConnection,
  useTestConnection,
  useDeleteConnection,
} from '@/hooks/useDbConnections';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PageHeader } from '@/components/shared/page-header';
import {
  ScaffoldContainer,
  ScaffoldFilterAndContent,
} from '@/components/shared/scaffold';
import { ErrorState } from '@/components/shared/error-state';
import { Skeleton } from '@/components/shared/skeleton';
import { cn } from '@/lib/utils';

import { SchemaExplorerTab } from '@/components/features/db-connections/schema-explorer-tab';
import { BusinessRulesTab } from '@/components/features/db-connections/business-rules-tab';

type TabId = 'schema' | 'rules';

const TABS: ReadonlyArray<{ id: TabId; label: string }> = [
  { id: 'schema', label: 'Schema explorer' },
  { id: 'rules', label: 'Business rules' },
];

interface DbConnectionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function DbConnectionDetailPage({
  params,
}: DbConnectionDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const companyId = useCurrentCompanyId();
  const [activeTab, setActiveTab] = useState<TabId>('schema');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: connection, isLoading, isError } = useDbConnection(
    id,
    companyId,
  );

  const testConnection = useTestConnection(companyId);
  const deleteConnection = useDeleteConnection(companyId);

  async function handleTest() {
    if (!connection) return;
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
    if (!connection) return;
    try {
      await deleteConnection.mutateAsync(connection.id);
      toast.success('Connection deleted');
      router.push('/db-connections');
    } catch {
      toast.error('Failed to delete connection');
    }
  }

  if (isLoading) {
    return (
      <ScaffoldContainer>
        <div className="flex flex-col gap-4 py-6">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="mt-8 h-64 w-full" rounded="lg" />
        </div>
      </ScaffoldContainer>
    );
  }

  if (isError || !connection) {
    return (
      <ScaffoldContainer>
        <div className="py-10">
          <ErrorState
            title="Connection not found"
            description="This database connection could not be loaded. It may have been deleted or you may not have access."
            onRetry={() => router.push('/db-connections')}
          />
        </div>
      </ScaffoldContainer>
    );
  }

  return (
    <ScaffoldContainer>
      <PageHeader
        breadcrumbs={[
          { label: 'Databases', href: '/db-connections' },
          { label: connection.name },
        ]}
        title={connection.name}
        subtitle={
          <span className="font-mono text-mono-sm text-muted">
            <span className="uppercase tracking-[0.06em]">
              {connection.database_type}
            </span>
            <span className="mx-2 text-subtle">·</span>
            {connection.host}
            <span className="text-subtle">:</span>
            {connection.port}
          </span>
        }
        secondaryActions={
          <Button
            type="button"
            variant="ghost"
            onClick={() => setConfirmDelete(true)}
            className="text-error hover:bg-error/8 hover:text-error h-9 px-3"
          >
            <Trash2 aria-hidden size={14} strokeWidth={1.75} className="mr-1.5" />
            Delete
          </Button>
        }
        primaryActions={
          <Button
            type="button"
            variant="secondary"
            onClick={handleTest}
            isLoading={testConnection.isPending}
            className="h-9 px-4"
          >
            <Zap aria-hidden size={14} strokeWidth={1.75} className="mr-1.5" />
            Test connection
          </Button>
        }
        navigationItems={TABS.map((tab) => ({
          label: tab.label,
          active: activeTab === tab.id,
          onClick: () => setActiveTab(tab.id),
        }))}
      />

      <ScaffoldFilterAndContent>
        {connection.last_error ? (
          <div
            role="alert"
            className={cn(
              'mb-4 rounded-lg border border-error-border bg-error-bg px-4 py-3',
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

        {activeTab === 'schema' ? (
          <SchemaExplorerTab connectionId={id} />
        ) : null}
        {activeTab === 'rules' ? (
          <BusinessRulesTab connectionId={id} companyId={companyId} />
        ) : null}
      </ScaffoldFilterAndContent>

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
    </ScaffoldContainer>
  );
}
