import api, { getAccessToken } from './axios';
import { API_BASE_URL } from '../utils/constants';
import type {
  ReportTemplateCreate,
  ReportTemplateUpdate,
  ReportTemplate,
  ReportTemplateListResponse,
  ReportGenerateResponse,
  GeneratedReport,
  ReportGenerationListResponse,
  SSEEventType,
} from '../types';

// ============== Template CRUD ==============

export async function listReportTemplates(
  companyId?: string,
): Promise<ReportTemplateListResponse> {
  const response = await api.get<ReportTemplateListResponse>('/reports/templates', {
    params: companyId ? { company_id: companyId } : undefined,
  });
  return response.data;
}

export async function getReportTemplate(
  templateId: string,
  companyId?: string,
): Promise<ReportTemplate> {
  const response = await api.get<ReportTemplate>(`/reports/templates/${templateId}`, {
    params: companyId ? { company_id: companyId } : undefined,
  });
  return response.data;
}

export async function createReportTemplate(
  data: ReportTemplateCreate,
  companyId?: string,
): Promise<ReportTemplate> {
  const response = await api.post<ReportTemplate>('/reports/templates', data, {
    params: companyId ? { company_id: companyId } : undefined,
  });
  return response.data;
}

export async function updateReportTemplate(
  templateId: string,
  data: ReportTemplateUpdate,
  companyId?: string,
): Promise<ReportTemplate> {
  const response = await api.patch<ReportTemplate>(
    `/reports/templates/${templateId}`,
    data,
    { params: companyId ? { company_id: companyId } : undefined },
  );
  return response.data;
}

export async function deleteReportTemplate(
  templateId: string,
  companyId?: string,
): Promise<void> {
  await api.delete(`/reports/templates/${templateId}`, {
    params: companyId ? { company_id: companyId } : undefined,
  });
}

// ============== AI-Driven Generation ==============

export async function aiGenerateReport(
  query: string,
  companyId?: string,
  connectionId?: string,
  title?: string,
  language?: string,
): Promise<ReportGenerateResponse> {
  const body: Record<string, unknown> = { query };
  if (connectionId) body.connection_id = connectionId;
  if (title) body.title = title;
  if (language) body.language = language;

  const response = await api.post<ReportGenerateResponse>(
    '/reports/generate',
    body,
    { params: companyId ? { company_id: companyId } : undefined },
  );
  return response.data;
}

// ============== Template-Based Generation ==============

export async function generateReport(
  templateId: string,
  companyId?: string,
  title?: string,
  language?: string,
): Promise<ReportGenerateResponse> {
  const body: Record<string, unknown> = {};
  if (title) body.title = title;
  if (language) body.language = language;

  const response = await api.post<ReportGenerateResponse>(
    `/reports/templates/${templateId}/generate`,
    Object.keys(body).length > 0 ? body : {},
    { params: companyId ? { company_id: companyId } : undefined },
  );
  return response.data;
}

export async function listReportGenerations(
  companyId?: string,
  skip = 0,
  limit = 20,
): Promise<ReportGenerationListResponse> {
  const response = await api.get<ReportGenerationListResponse>('/reports/generations', {
    params: {
      ...(companyId ? { company_id: companyId } : {}),
      skip,
      limit,
    },
  });
  return response.data;
}

export async function getReportGeneration(
  generationId: string,
  companyId?: string,
): Promise<GeneratedReport> {
  const response = await api.get<GeneratedReport>(
    `/reports/generations/${generationId}`,
    { params: companyId ? { company_id: companyId } : undefined },
  );
  return response.data;
}

// ============== Download ==============

export async function downloadReportPdf(
  generationId: string,
  companyId?: string,
): Promise<Blob> {
  const response = await api.get(`/reports/generations/${generationId}/download`, {
    params: companyId ? { company_id: companyId } : undefined,
    responseType: 'blob',
  });
  return response.data;
}

export async function getReportHtml(
  generationId: string,
  companyId?: string,
): Promise<string> {
  const response = await api.get<string>(
    `/reports/generations/${generationId}/html`,
    {
      params: companyId ? { company_id: companyId } : undefined,
      responseType: 'text',
    },
  );
  return response.data;
}

// ============== SSE Subscription ==============

export function subscribeToReportStream(
  taskId: string,
  onEvent: (eventType: SSEEventType, data: Record<string, unknown>) => void,
  onError: (error: Error) => void,
  onComplete: () => void,
  signal?: AbortSignal,
): void {
  const url = `${API_BASE_URL}/streams/${taskId}`;
  const token = getAccessToken();

  fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'text/event-stream',
    },
    signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`SSE connection failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body for SSE stream');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          let currentEventType: SSEEventType | null = null;

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              currentEventType = line.slice(7).trim() as SSEEventType;
            } else if (line.startsWith('data: ') && currentEventType) {
              try {
                const data = JSON.parse(line.slice(6));
                onEvent(currentEventType, data);
              } catch {
                // Skip malformed JSON
              }
              currentEventType = null;
            } else if (line === '') {
              currentEventType = null;
            }
          }
        }
      } catch (err) {
        if (signal?.aborted) return;
        throw err;
      }

      onComplete();
    })
    .catch((err) => {
      if (signal?.aborted) return;
      onError(err instanceof Error ? err : new Error(String(err)));
    });
}
