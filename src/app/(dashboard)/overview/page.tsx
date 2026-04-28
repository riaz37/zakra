'use client';

import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { useDashboardData } from '@/hooks/useDashboardData';
import { MetricStrip } from '../_components/metric-strip';
import { ActivityChart } from '../_components/activity-chart';
import { StatusDistributionChart } from '../_components/status-distribution-chart';
import { RecentActivity } from '../_components/recent-activity';
import { PageHeader } from '@/components/shared/page-header';
import { ScaffoldContainer } from '@/components/shared/scaffold';

export default function OverviewPage() {
  const companyId = useCurrentCompanyId();
  const { isLoading, metrics, activityData, statusData, recentActivity } = useDashboardData(companyId || undefined);

  return (
    <ScaffoldContainer size="large">
      <PageHeader
        title="Overview"
        subtitle={
          companyId
            ? 'Analytics and activity across your workspace.'
            : undefined
        }
      />

      <div className="mt-6 flex flex-col gap-4 animate-in fade-in-50">
        <MetricStrip metrics={metrics} isLoading={isLoading} />

        {!companyId ? (
          <div
            role="status"
            className="rounded-card border border-border bg-surface-100 px-4 py-3 font-sans text-caption text-muted"
          >
            Select a company from the sidebar to filter analytics and activity by workspace.
          </div>
        ) : null}

        <div className="grid gap-4 @md:grid-cols-2 @lg:grid-cols-7">
          <div className="@lg:col-span-4 @md:col-span-2">
            <ActivityChart data={activityData} isLoading={isLoading} />
          </div>
          <div className="@lg:col-span-3 @md:col-span-2">
            <StatusDistributionChart data={statusData} isLoading={isLoading} />
          </div>
        </div>

        <div className="grid gap-4">
          <RecentActivity recentActivity={recentActivity} isLoading={isLoading} />
        </div>
      </div>
    </ScaffoldContainer>
  );
}
