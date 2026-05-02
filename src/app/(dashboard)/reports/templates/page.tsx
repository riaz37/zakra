'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Plus, FilePlus } from 'lucide-react';

import { useReportTemplates, useDeleteReportTemplate } from '@/hooks/useReportTemplates';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import type { ReportTemplate } from '@/types';

import { PageHeader } from '@/components/shared/page-header';
import {
  ScaffoldContainer,
  ScaffoldFilterAndContent,
} from '@/components/shared/scaffold';
import { reportNavigationItems } from '@/components/features/reports/nav';
import { ErrorState } from '@/components/shared/error-state';
import { EmptyState } from '@/components/shared/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Button } from '@/components/ui/button';
import { TemplateCard } from '@/components/features/reports/template-card';

export default function ReportTemplatesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const companyId = useCurrentCompanyId();
  const [deleteTarget, setDeleteTarget] = useState<ReportTemplate | null>(null);

  const { data, isLoading, isError, refetch } = useReportTemplates(companyId);
  const deleteMutation = useDeleteReportTemplate(companyId);

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
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onEdit={(t) => router.push(`/reports/templates/${t.id}`)}
                onDelete={(t) => setDeleteTarget(t)}
              />
            ))}
          </div>
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
