'use client';

import { useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { FileText } from 'lucide-react';

import { useReportGenerations } from '@/hooks/useReportGenerations';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import type { GeneratedReport, ReportGenerationStatus } from '@/types';

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

const HISTORY_FETCH_LIMIT = 100;

type StatusFilter = 'all' | ReportGenerationStatus;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'running', label: 'Running' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
];

export default function ReportHistoryPage() {
  const router = useRouter();
  const pathname = usePathname();
  const companyId = useCurrentCompanyId();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const { data, isLoading, isError, refetch } = useReportGenerations(
    companyId,
    0,
    HISTORY_FETCH_LIMIT,
  );

  const reports: GeneratedReport[] = useMemo(() => {
    const all = data?.generations ?? [];
    const term = search.trim().toLowerCase();

    return all.filter((report) => {
      if (statusFilter !== 'all' && report.status !== statusFilter) return false;
      if (!term) return true;
      const title = (report.title || 'Untitled report').toLowerCase();
      return title.includes(term);
    });
  }, [data, search, statusFilter]);

  const columns = useMemo(
    () =>
      getReportGenerationsColumns({
        onView: (report) => router.push(`/reports/${report.id}`),
      }),
    [router],
  );

  const hasActiveFilters = search.trim() !== '' || statusFilter !== 'all';
  const totalCount = data?.total ?? 0;
  const showTruncationNotice =
    !isLoading && totalCount > HISTORY_FETCH_LIMIT && !hasActiveFilters;

  return (
    <ScaffoldContainer>
      <PageHeader
        title="Reports"
        subtitle="Every AI-generated report for this workspace, newest first."
        navigationItems={reportNavigationItems(pathname)}
      />

      <ScaffoldFilterAndContent className="mt-6">
        <ScaffoldActionsContainer>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
            <div className="w-full sm:max-w-sm">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search by title…"
                ariaLabel="Search reports by title"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            >
              <SelectTrigger
                aria-label="Filter by status"
                className="h-9 w-full sm:w-[180px]"
              >
                <SelectValue placeholder="All statuses" />
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
            title="Failed to load report history"
            onRetry={() => refetch()}
          />
        ) : reports.length === 0 && !isLoading ? (
          <EmptyState
            icon={FileText}
            title={
              hasActiveFilters
                ? 'No reports match your filters'
                : 'No reports generated yet'
            }
            description={
              hasActiveFilters
                ? 'Try clearing the search term or status filter.'
                : 'Generated reports will appear here as soon as you create one.'
            }
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={reports}
              isLoading={isLoading}
              caption="Generated reports history"
              emptyMessage="No reports match your filters."
              onRowClick={(report) => router.push(`/reports/${report.id}`)}
            />
            {showTruncationNotice && (
              <p className="mt-3 font-mono text-micro uppercase tracking-[0.06em] text-fg-subtle">
                Showing the {HISTORY_FETCH_LIMIT} most recent of {totalCount}
              </p>
            )}
          </>
        )}
      </ScaffoldFilterAndContent>
    </ScaffoldContainer>
  );
}
