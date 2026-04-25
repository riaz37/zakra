'use client';

import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { useDashboardData } from '@/hooks/useDashboardData';
import { MetricStrip } from './_components/metric-strip';
import { ActivityChart } from './_components/activity-chart';
import { StatusDistributionChart } from './_components/status-distribution-chart';
import { RecentActivity } from './_components/recent-activity';
import { PageHeader } from '@/components/shared/page-header';

export default function OverviewPage() {
  const companyId = useCurrentCompanyId();
  const { isLoading, metrics, activityData, statusData, recentActivity } = useDashboardData(companyId || undefined);

  return (
    <div className="px-6 py-8 flex-1 flex flex-col gap-6">
      <PageHeader title="Overview" />

      {!companyId ? (
        <div className="flex h-[400px] flex-col items-center justify-center rounded-md border border-dashed text-center animate-in fade-in-50">
          <h3 className="mt-4 text-lg font-semibold">No Company Selected</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            Select a company from the sidebar to see workspace analytics and activity.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 animate-in fade-in-50">
          <MetricStrip metrics={metrics} isLoading={isLoading} />
          
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
      )}
    </div>
  );
}
