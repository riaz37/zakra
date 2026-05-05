'use client';

import { use, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Zap, Trash2, Star, Pencil } from 'lucide-react';

import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import {
  useConnectionSchema,
  useDbConnection,
  useTestConnection,
  useDeleteConnection,
  useSetDefaultConnection,
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
import { AnimatedPage } from '@/components/shared/animated-container';
import { fadeUp } from '@/lib/motion';
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
  const reduced = useReducedMotion();

  const { data: connection, isLoading: isConnectionLoading, isError } = useDbConnection(
    id,
    companyId,
  );
  const { isLoading: isSchemaLoading } = useConnectionSchema(id);
  const isLoading = isConnectionLoading || isSchemaLoading;

  const testConnection = useTestConnection(companyId);
  const deleteConnection = useDeleteConnection(companyId);
  const setDefault = useSetDefaultConnection(companyId);

  async function handleSetDefault() {
    if (!connection) return;
    try {
      await setDefault.mutateAsync(connection.id);
      toast.success('Set as default connection');
    } catch {
      toast.error('Failed to set default connection');
    }
  }

  function handleEdit() {
    toast.message('Edit coming soon', {
      description: 'Inline editing for connection details is on the way.',
    });
  }

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
          <div className="mt-8 flex gap-5">
            <Skeleton className="h-80 w-56 shrink-0" rounded="xl" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-10 w-full" rounded="lg" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-9" rounded="lg" />
              ))}
            </div>
          </div>
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
          <span className="font-mono text-mono-sm text-fg-muted">
            <span className="uppercase tracking-[0.06em]">
              {connection.database_type}
            </span>
            <span className="mx-2 text-fg-subtle">·</span>
            {connection.host}
            <span className="text-fg-subtle">:</span>
            {connection.port}
          </span>
        }
        secondaryActions={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSetDefault}
              isLoading={setDefault.isPending}
              disabled={connection.is_default}
              className="h-9 px-3"
              title={connection.is_default ? 'Already default' : 'Set as default'}
            >
              <Star
                aria-hidden
                size={14}
                strokeWidth={1.75}
                className="mr-1.5"
                fill={connection.is_default ? 'currentColor' : 'none'}
              />
              {connection.is_default ? 'Default' : 'Set default'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="h-9 px-3"
            >
              <Pencil aria-hidden size={14} strokeWidth={1.75} className="mr-1.5" />
              Edit
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmDelete(true)}
              className="text-error hover:bg-error/10 hover:text-error h-9 px-3"
            >
              <Trash2 aria-hidden size={14} strokeWidth={1.75} className="mr-1.5" />
              Delete
            </Button>
          </>
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

      <AnimatedPage>
        <ScaffoldFilterAndContent>
          <AnimatePresence>
            {connection.last_error ? (
              <motion.div
                role="alert"
                initial={reduced ? {} : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  'mb-4 rounded-lg border border-error-border bg-error-bg px-4 py-3',
                )}
              >
                <p className="font-sans text-micro uppercase tracking-[0.048px] text-error">
                  Last error
                </p>
                <p className="mt-1.5 font-mono text-mono-sm leading-[1.5] text-error">
                  {connection.last_error}
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {activeTab === 'schema' && (
              <motion.div
                key="schema"
                variants={fadeUp}
                initial={reduced ? 'visible' : 'hidden'}
                animate="visible"
                exit="exit"
              >
                <SchemaExplorerTab connectionId={id} companyId={companyId} connectionName={connection.name} />
              </motion.div>
            )}
            {activeTab === 'rules' && (
              <motion.div
                key="rules"
                variants={fadeUp}
                initial={reduced ? 'visible' : 'hidden'}
                animate="visible"
                exit="exit"
              >
                <BusinessRulesTab connectionId={id} companyId={companyId} />
              </motion.div>
            )}
          </AnimatePresence>
        </ScaffoldFilterAndContent>
      </AnimatedPage>

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
