'use client';

import { useTranslations } from 'next-intl';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { useDashboardData } from '@/hooks/useDashboardData';
import { MetricStrip } from '../_components/metric-strip';
import { ActivityChart } from '../_components/activity-chart';
import { StatusDistributionChart } from '../_components/status-distribution-chart';
import { RecentActivity } from '../_components/recent-activity';
import { PageHeader } from '@/components/shared/page-header';
import { ScaffoldContainer } from '@/components/shared/scaffold';
import { AnimatedPage, StaggerList, StaggerItem } from '@/components/shared/animated-container';

export default function OverviewPage() {
  const t = useTranslations('dashboard.overview');
  const companyId = useCurrentCompanyId();
  const { isLoading, metrics, activityData, statusData, recentActivity } = useDashboardData(companyId || undefined);

  return (
    <ScaffoldContainer size="large">
      <PageHeader
        title={t('title')}
        subtitle={companyId ? t('subtitle') : undefined}
      />

      <AnimatedPage>
        <StaggerList className="mt-6 flex flex-col gap-4">
          <StaggerItem>
            <MetricStrip metrics={metrics} isLoading={isLoading} />
          </StaggerItem>

          {!companyId ? (
            <StaggerItem>
              <div
                role="status"
                className="rounded-card border border-border bg-surface-200 px-4 py-3 font-sans text-caption text-muted"
              >
                {t('selectCompanyHint')}
              </div>
            </StaggerItem>
          ) : null}

          <StaggerItem>
            <div className="grid gap-4 @md:grid-cols-2 @lg:grid-cols-7">
              <div className="@lg:col-span-4 @md:col-span-2">
                <ActivityChart data={activityData} isLoading={isLoading} />
              </div>
              <div className="@lg:col-span-3 @md:col-span-2">
                <StatusDistributionChart data={statusData} isLoading={isLoading} />
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="grid gap-4">
              <RecentActivity recentActivity={recentActivity} isLoading={isLoading} />
            </div>
          </StaggerItem>
        </StaggerList>
      </AnimatedPage>
    </ScaffoldContainer>
  );
}
