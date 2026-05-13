'use client';

import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useReportTemplate, useUpdateReportTemplate } from '@/hooks/useReportTemplates';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { useDbConnections } from '@/hooks/useDbConnections';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/shared/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { ScaffoldContainer } from '@/components/shared/scaffold';
import { ReportTemplateForm, type ReportTemplateFormData } from '@/components/features/reports/report-template-form';

export default function EditTemplatePage() {
  const t = useTranslations('dashboard.reports.templates');
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const companyId = useCurrentCompanyId();

  const { data: template, isLoading: isLoadingTemplate } = useReportTemplate(id, companyId);
  const { data: connectionsData, isLoading: isLoadingConnections } = useDbConnections({ company_id: companyId });
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

  if (isLoadingTemplate || isLoadingConnections) {
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
          <p className="font-sans text-button text-muted">{t('notFound')}</p>
          <Button
            variant="link"
            onClick={() => router.push('/reports/templates')}
            className="mt-4 p-0 h-auto font-sans text-button text-muted underline hover:text-foreground no-underline"
          >
            {t('backToTemplates')}
          </Button>
        </div>
      </ScaffoldContainer>
    );
  }

  return (
    <ScaffoldContainer size="large">
      <PageHeader
        breadcrumbs={[
          { label: t('breadcrumbs.templates'), href: '/reports/templates' },
          { label: template.name },
        ]}
        title={template.name}
        subtitle={t('edit.subtitle')}
        primaryActions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/reports/templates')}
              disabled={updateTemplate.isPending}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              form="template-form"
              variant="outline"
              isLoading={updateTemplate.isPending}
            >
              {t('saveChanges')}
            </Button>
            <Button
              type="button"
              onClick={() => router.push(`/reports/generate/${id}`)}
              disabled={updateTemplate.isPending}
            >
              {t('generateReport')}
            </Button>
          </div>
        }
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
        connections={connections}
      />
    </ScaffoldContainer>
  );
}
