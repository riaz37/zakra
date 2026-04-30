'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { useDbConnection } from '@/hooks/useDbConnections';

import { PageHeader } from '@/components/shared/page-header';
import {
  ScaffoldContainer,
  ScaffoldFilterAndContent,
} from '@/components/shared/scaffold';
import { ErrorState } from '@/components/shared/error-state';
import { Skeleton } from '@/components/shared/skeleton';

import { OverviewTab } from '@/components/features/db-connections/overview-tab';
import { SchemaExplorerTab } from '@/components/features/db-connections/schema-explorer-tab';
import { BusinessRulesTab } from '@/components/features/db-connections/business-rules-tab';

type TabId = 'overview' | 'schema' | 'rules';

const TABS: ReadonlyArray<{ id: TabId; label: string }> = [
  { id: 'overview', label: 'Overview' },
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
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const { data: connection, isLoading, isError } = useDbConnection(
    id,
    companyId,
  );

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
        navigationItems={TABS.map((tab) => ({
          label: tab.label,
          active: activeTab === tab.id,
          onClick: () => setActiveTab(tab.id),
        }))}
      />

      <ScaffoldFilterAndContent>
        {activeTab === 'overview' ? (
          <OverviewTab connection={connection} companyId={companyId} />
        ) : null}
        {activeTab === 'schema' ? (
          <SchemaExplorerTab connectionId={id} />
        ) : null}
        {activeTab === 'rules' ? (
          <BusinessRulesTab connectionId={id} companyId={companyId} />
        ) : null}
      </ScaffoldFilterAndContent>
    </ScaffoldContainer>
  );
}
