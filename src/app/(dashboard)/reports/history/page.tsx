'use client';

import { useRouter, usePathname } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import { FileText, Eye } from 'lucide-react';
import { formatDate } from '@/lib/format-date';

import { useReportGenerations } from '@/hooks/useReportGenerations';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import type { GeneratedReport } from '@/types';

import { PageHeader } from '@/components/shared/page-header';
import {
  ScaffoldContainer,
  ScaffoldFilterAndContent,
} from '@/components/shared/scaffold';
import { reportNavigationItems } from '@/components/features/reports/nav';
import { DataTable } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';

export default function ReportHistoryPage() {
  const router = useRouter();
  const pathname = usePathname();
  const companyId = useCurrentCompanyId();
  const { data, isLoading, isError, refetch } = useReportGenerations(companyId);

  const columns: ColumnDef<GeneratedReport>[] = [
    {
      id: 'title',
      header: 'report',
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-sans text-[16px] font-medium text-foreground">
            {row.original.title || 'Untitled report'}
          </span>
          {row.original.executive_summary && (
            <span className="font-sans text-caption text-muted line-clamp-1 max-w-[400px]">
              {row.original.executive_summary}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'status',
      header: 'status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'created_at',
      header: 'created',
      cell: ({ row }) => (
        <span className="font-sans text-button text-muted">
          {formatDate(row.original.created_at)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center justify-end">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 gap-1.5"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/reports/${row.original.id}`);
            }}
          >
            <Eye aria-hidden size={14} />
            View
          </Button>
        </div>
      ),
    },
  ];

  const generations = data?.generations ?? [];

  return (
    <ScaffoldContainer>
      <PageHeader
        title="Reports"
        subtitle="All generated reports for your workspace."
        navigationItems={reportNavigationItems(pathname)}
      />

      <ScaffoldFilterAndContent className="mt-6">
        {isError ? (
          <ErrorState title="Failed to load history" onRetry={() => refetch()} />
        ) : generations.length === 0 && !isLoading ? (
          <EmptyState
            icon={FileText}
            title="No reports generated yet"
            description="Generate your first AI report from a template."
            action={
              <Button
                onClick={() => router.push('/reports/ai-generate')}
                className="h-9 px-4"
              >
                Generate a report
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={columns}
            data={generations}
            isLoading={isLoading}
            caption="Report history list"
            emptyMessage="No reports found."
            onRowClick={(row) => router.push(`/reports/${row.id}`)}
          />
        )}
      </ScaffoldFilterAndContent>
    </ScaffoldContainer>
  );
}
