'use client';

import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useReportTemplate, useUpdateReportTemplate } from '@/hooks/useReportTemplates';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { useDbConnections } from '@/hooks/useDbConnections';
import { Button } from '@/components/ui/button';
import { ReportTemplateForm, type ReportTemplateFormData } from '@/components/features/reports/report-template-form';

export default function EditTemplatePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const companyId = useCurrentCompanyId();

  const { data: template, isLoading } = useReportTemplate(id, companyId);
  const { data: connectionsData } = useDbConnections({ company_id: companyId });
  const connections = connectionsData?.items ?? [];

  const updateTemplate = useUpdateReportTemplate(companyId);

  const handleSubmit = async (formData: ReportTemplateFormData) => {
    await updateTemplate.mutateAsync({
      templateId: id,
      data: {
        name: formData.name,
        description: formData.description || undefined,
        sections: formData.sections,
      },
    });
    router.push('/reports/templates');
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[680px] px-6 py-8">
        <div className="h-5 w-32 animate-pulse rounded bg-surface-300" />
        <div className="mt-8 h-8 w-48 animate-pulse rounded bg-surface-300" />
        <div className="mt-8 space-y-6">
          <div className="h-64 animate-pulse rounded-xl bg-surface-300" />
          <div className="h-96 animate-pulse rounded-xl bg-surface-300" />
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="mx-auto max-w-[680px] px-6 py-8">
        <p className="font-sans text-button text-muted">Template not found.</p>
        <Button
          variant="link"
          onClick={() => router.push('/reports/templates')}
          className="mt-4 p-0 h-auto font-sans text-button text-muted underline hover:text-foreground no-underline"
        >
          Back to Templates
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[680px] px-6 py-8">
      {/* Back nav */}
      <Button
        variant="link"
        onClick={() => router.push('/reports/templates')}
        className="mb-6 h-auto p-0 font-sans text-button text-muted hover:text-foreground no-underline"
      >
        <ChevronLeft aria-hidden size={14} strokeWidth={1.75} />
        Back to Templates
      </Button>

      {/* Page heading */}
      <h1 className="mb-8 font-sans text-[26px] font-semibold tracking-[-0.52px] text-foreground">
        Edit Template
      </h1>

      <ReportTemplateForm
        initial={{
          name: template.name,
          description: template.description ?? '',
          connection_id: template.connection_id,
          report_type: template.report_type,
          sections: template.sections,
        }}
        onSubmit={handleSubmit}
        isPending={updateTemplate.isPending}
        onCancel={() => router.push('/reports/templates')}
        connections={connections}
        submitLabel="Save changes"
      />
    </div>
  );
}
