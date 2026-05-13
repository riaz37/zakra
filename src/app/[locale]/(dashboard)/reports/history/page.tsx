'use client';

import { useMemo, useState } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { FileText } from 'lucide-react';

import { useReportGenerations } from '@/hooks/useReportGenerations';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { useResourceList } from '@/hooks/useResourceList';
import type { GeneratedReport, ReportGenerationStatus } from '@/types';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { AnimatedPage } from '@/components/shared/animated-container';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { reportNavigationItems } from '@/components/features/reports/nav';
import { getReportGenerationsColumns } from '@/components/features/reports/generations-columns';

type StatusFilter = 'all' | ReportGenerationStatus;

export default function ReportHistoryPage() {
  const t = useTranslations('dashboard.reports');
  const router = useRouter();
  const pathname = usePathname();
  const companyId = useCurrentCompanyId();

  const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: t('status.all') },
    { value: 'completed', label: t('status.completed') },
    { value: 'running', label: t('status.running') },
    { value: 'pending', label: t('status.pending') },
    { value: 'failed', label: t('status.failed') },
  ];

  const { search, page, setPage, searchProps } = useResourceList();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const skip = page * DEFAULT_PAGE_SIZE;

  const { data, isLoading, isError, refetch } = useReportGenerations(
    companyId,
    skip,
    DEFAULT_PAGE_SIZE,
  );

  const reports: GeneratedReport[] = useMemo(() => {
    const all = data?.generations ?? [];
    const term = search.trim().toLowerCase();

    return all.filter((report) => {
      if (statusFilter !== 'all' && report.status !== statusFilter) return false;
      if (!term) return true;
      const title = (report.title || t('viewer.untitledReport')).toLowerCase();
      return title.includes(term);
    });
  }, [data, search, statusFilter]);

  const columns = useMemo(() => getReportGenerationsColumns(), []);

  const totalCount = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / DEFAULT_PAGE_SIZE));
  const hasActiveFilters = search.trim() !== '' || statusFilter !== 'all';

  function handleStatusChange(v: StatusFilter | null) {
    if (v) {
      setStatusFilter(v);
      setPage(0);
    }
  }

  return (
    <ScaffoldContainer>
      <PageHeader
        title={t('title')}
        subtitle={t('historySubtitle')}
        navigationItems={reportNavigationItems(pathname)}
      />

      <AnimatedPage>
        <ScaffoldFilterAndContent className="mt-6">
          <ScaffoldActionsContainer>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
              <div className="w-full sm:max-w-sm">
                <SearchInput
                  {...searchProps}
                  placeholder={t('history.search.placeholder')}
                  ariaLabel={t('history.search.ariaLabel')}
                />
              </div>
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger
                  aria-label={t('history.statusFilter.ariaLabel')}
                  className="h-9 w-full sm:w-[180px]"
                >
                  <SelectValue placeholder={t('history.statusFilter.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </ScaffoldActionsContainer>

          {isError ? (
            <ErrorState
              title={t('history.error.loadTitle')}
              onRetry={() => refetch()}
            />
          ) : reports.length === 0 && !isLoading ? (
            <EmptyState
              icon={FileText}
              title={
                hasActiveFilters
                  ? t('history.empty.filteredTitle')
                  : t('history.empty.title')
              }
              description={
                hasActiveFilters
                  ? t('history.empty.filteredDescription')
                  : t('history.empty.description')
              }
            />
          ) : (
            <DataTable
              columns={columns}
              data={reports}
              isLoading={isLoading}
              caption={t('history.caption')}
              emptyMessage={t('history.emptyMessage')}
              onRowClick={(report) => router.push(`/reports/${report.id}`)}
              pageIndex={page}
              pageCount={totalPages}
              onPageChange={setPage}
              pageSize={DEFAULT_PAGE_SIZE}
              totalCount={totalCount}
            />
          )}
        </ScaffoldFilterAndContent>
      </AnimatedPage>
    </ScaffoldContainer>
  );
}
