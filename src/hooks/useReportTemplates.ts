import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listReportTemplates,
  getReportTemplate,
  createReportTemplate,
  updateReportTemplate,
  deleteReportTemplate,
} from '../api/reports';
import type { ReportTemplateCreate, ReportTemplateUpdate } from '../types';

const QUERY_KEY = 'report-templates';

export function useReportTemplates(companyId?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, companyId],
    queryFn: () => listReportTemplates(companyId),
    enabled: !!companyId,
  });
}

export function useReportTemplate(templateId: string, companyId?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, templateId, companyId],
    queryFn: () => getReportTemplate(templateId, companyId),
    enabled: !!templateId && !!companyId,
  });
}

export function useCreateReportTemplate(companyId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReportTemplateCreate) =>
      createReportTemplate(data, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, companyId] });
    },
  });
}

export function useUpdateReportTemplate(companyId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      templateId,
      data,
    }: {
      templateId: string;
      data: ReportTemplateUpdate;
    }) => updateReportTemplate(templateId, data, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useDeleteReportTemplate(companyId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) =>
      deleteReportTemplate(templateId, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, companyId] });
    },
  });
}
