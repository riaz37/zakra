'use client';

import { useRouter } from 'next/navigation';
import { useCreateReportTemplate } from '@/hooks/useReportTemplates';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { useDbConnections } from '@/hooks/useDbConnections';
import { PageHeader } from '@/components/shared/page-header';
import { ScaffoldContainer } from '@/components/shared/scaffold';
import { ReportTemplateForm, type ReportTemplateFormData } from '@/components/features/reports/report-template-form';
import { Button } from '@/components/ui/button';

export default function NewTemplatePage() {
  const router = useRouter();
  const companyId = useCurrentCompanyId();
  const { data: connectionsData } = useDbConnections({ company_id: companyId });
  const connections = connectionsData?.items ?? [];

  const createTemplate = useCreateReportTemplate(companyId);

  const handleSubmit = async (formData: ReportTemplateFormData) => {
    await createTemplate.mutateAsync({
      name: formData.name,
      description: formData.description || undefined,
      connection_id: formData.connection_id,
      report_type: formData.report_type,
      sections: formData.sections.map((s) => ({
        ...s,
        description: s.description ?? '',
        analysis_prompt: s.analysis_prompt ?? null,
      })),
    });
    router.push('/reports/templates');
  };

  return (
    <ScaffoldContainer size="large">
      <PageHeader
        breadcrumbs={[
          { label: 'Templates', href: '/reports/templates' },
          { label: 'New Template' },
        ]}
        title="New Template"
        subtitle="Define the structure and sections for your AI-generated report."
        primaryActions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/reports/templates')}
              disabled={createTemplate.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="template-form"
              isLoading={createTemplate.isPending}
            >
              Save template
            </Button>
          </div>
        }
      />

      <ReportTemplateForm
        onSubmit={handleSubmit}
        isPending={createTemplate.isPending}
        connections={connections}
      />
    </ScaffoldContainer>
  );
}
