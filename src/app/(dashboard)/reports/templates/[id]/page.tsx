'use client';

import { useRouter, useParams } from 'next/navigation';
import { useReportTemplate, useUpdateReportTemplate } from '@/hooks/useReportTemplates';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { useDbConnections } from '@/hooks/useDbConnections';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/shared/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { ScaffoldContainer } from '@/components/shared/scaffold';
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
        sections: formData.sections.map((s) => ({
          ...s,
          description: s.description ?? '',
          analysis_prompt: s.analysis_prompt ?? null,
        })),
      },
    });
    router.push('/reports/templates');
  };

  if (isLoading) {
    return (
      <ScaffoldContainer>
        <div className="space-y-6 py-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64" rounded="xl" />
          <Skeleton className="h-96" rounded="xl" />
        </div>
      </ScaffoldContainer>
    );
  }

  if (!template) {
    return (
      <ScaffoldContainer>
        <div className="py-6">
          <p className="font-sans text-button text-muted">Template not found.</p>
          <Button
            variant="link"
            onClick={() => router.push('/reports/templates')}
            className="mt-4 p-0 h-auto font-sans text-button text-muted underline hover:text-foreground no-underline"
          >
            Back to Templates
          </Button>
        </div>
      </ScaffoldContainer>
    );
  }

  return (
    <ScaffoldContainer size="large">
      <PageHeader
        breadcrumbs={[
          { label: 'Templates', href: '/reports/templates' },
          { label: template.name },
        ]}
        title={template.name}
        subtitle="Edit template details and sections."
      />

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
    </ScaffoldContainer>
  );
}
