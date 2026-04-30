'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, FilePlus } from 'lucide-react';
import { formatDate } from '@/lib/format-date';

import { useReportTemplates, useDeleteReportTemplate } from '@/hooks/useReportTemplates';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import type { ReportTemplate } from '@/types';

import { PageHeader } from '@/components/shared/page-header';
import {
  ScaffoldContainer,
  ScaffoldFilterAndContent,
} from '@/components/shared/scaffold';
import { reportNavigationItems } from '@/components/features/reports/nav';
import { DataTable } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { RowActions } from '@/components/shared/row-actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ReportTemplatesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const companyId = useCurrentCompanyId();
  const [deleteTarget, setDeleteTarget] = useState<ReportTemplate | null>(null);

  const { data, isLoading, isError, refetch } = useReportTemplates(companyId);
  const deleteMutation = useDeleteReportTemplate(companyId);

  const columns: ColumnDef<ReportTemplate>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-sans text-button font-medium text-foreground">
            {row.original.name}
          </span>
          {row.original.description && (
            <span className="font-sans text-caption text-muted line-clamp-1 max-w-[400px]">
              {row.original.description}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="default" size="sm" className="font-mono">
          {row.original.report_type}
        </Badge>
      ),
    },
    {
      id: 'sections',
      header: 'Sections',
      cell: ({ row }) => (
        <span className="font-sans text-button text-muted">
          {row.original.sections.length}
        </span>
      ),
    },
    {
      id: 'created_at',
      header: 'Created',
      cell: ({ row }) => (
        <span className="whitespace-nowrap font-sans text-button text-muted">
          {formatDate(row.original.created_at)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <RowActions
          onEdit={(e) => { e.stopPropagation(); router.push(`/reports/templates/${row.original.id}`); }}
          onDelete={(e) => { e.stopPropagation(); setDeleteTarget(row.original); }}
          editLabel={`Edit ${row.original.name}`}
          deleteLabel={`Delete ${row.original.name}`}
        />
      ),
    },
  ];

  const templates = data?.templates ?? [];

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <ScaffoldContainer>
      <PageHeader
        title="Reports"
        subtitle="Reusable templates for your AI-generated reports."
        navigationItems={reportNavigationItems(pathname)}
        primaryActions={
          <Button
            onClick={() => router.push('/reports/templates/new')}
            className="h-9 px-4"
          >
            <Plus aria-hidden size={15} strokeWidth={2} />
            New Template
          </Button>
        }
      />

      <ScaffoldFilterAndContent className="mt-6">
        {isError ? (
          <ErrorState title="Failed to load templates" onRetry={() => refetch()} />
        ) : templates.length === 0 && !isLoading ? (
          <EmptyState
            icon={FilePlus}
            title="No report templates"
            description="Create templates to standardize your AI-generated reports."
            action={
              <Button
                onClick={() => router.push('/reports/templates/new')}
                className="h-9 px-4"
              >
                <Plus aria-hidden size={15} strokeWidth={2} />
                New Template
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={columns}
            data={templates}
            isLoading={isLoading}
            caption="Report templates list"
            emptyMessage="No templates found."
          />
        )}
      </ScaffoldFilterAndContent>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Template"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
      />
    </ScaffoldContainer>
  );
}
