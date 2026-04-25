'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useCreateReportTemplate } from '@/hooks/useReportTemplates';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { useDbConnections } from '@/hooks/useDbConnections';
import { Button } from '@/components/ui/button';
import { ReportTemplateForm, type ReportTemplateFormData } from '@/components/features/reports/report-template-form';

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
      sections: formData.sections,
    });
    router.push('/reports/templates');
  };

  return (
    <div className="mx-auto max-w-[680px] px-6 py-8">
      {/* Back nav */}
      <Button
        variant="link"
        onClick={() => router.back()}
        className="mb-6 h-auto p-0 font-sans text-button text-muted hover:text-foreground no-underline"
      >
        <ChevronLeft aria-hidden size={14} strokeWidth={1.75} />
        Back to Templates
      </Button>

      {/* Page heading */}
      <h1 className="mb-8 font-sans text-[26px] font-semibold tracking-[-0.52px] text-foreground">
        New Template
      </h1>

      <ReportTemplateForm
        onSubmit={handleSubmit}
        isPending={createTemplate.isPending}
        onCancel={() => router.push('/reports/templates')}
        connections={connections}
      />
    </div>
  );
}
