'use client';

import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { useDashboardData } from '@/hooks/useDashboardData';
import { MetricStrip } from '../_components/metric-strip';
import { ActivityChart } from '../_components/activity-chart';
import { StatusDistributionChart } from '../_components/status-distribution-chart';
import { RecentActivity } from '../_components/recent-activity';
import { PageHeader } from '@/components/shared/page-header';

export default function OverviewPage() {
  const companyId = useCurrentCompanyId();
  const { isLoading, metrics, activityData, statusData, recentActivity } = useDashboardData(companyId || undefined);

  return (
    <div className="px-6 py-8 flex-1 flex flex-col gap-6">
      <PageHeader title="Overview" />

      <div className="flex flex-col gap-4 animate-in fade-in-50">
        <MetricStrip metrics={metrics} isLoading={isLoading} />

        {!companyId ? (
          <p className="text-caption text-muted">
            Select a company from the sidebar to filter analytics and activity by workspace.
          </p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <ActivityChart data={activityData} isLoading={isLoading} />
          </div>
          <div className="col-span-3">
            <StatusDistributionChart data={statusData} isLoading={isLoading} />
          </div>
        </div>

        <div className="grid gap-4">
          <RecentActivity recentActivity={recentActivity} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
