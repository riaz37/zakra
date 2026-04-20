import api, { getAccessToken } from './axios';
import { API_BASE_URL } from '../utils/constants';
import type { NLQueryRequest, QuerySubmitResponse, SSEEventType } from '../types';

/**
 * Submit a natural language query for async execution.
 * Returns a task_id for SSE subscription.
 */
export async function submitQuery(
  request: NLQueryRequest,
  companyId?: string,
): Promise<QuerySubmitResponse> {
  const response = await api.post<QuerySubmitResponse>('/db-agent/query', request, {
    params: companyId ? { company_id: companyId } : undefined,
  });
  return response.data;
}

/**
 * Subscribe to an SSE stream for real-time pipeline progress.
 *
 * Uses fetch() instead of EventSource because custom Authorization
 * headers are needed (EventSource doesn't support custom headers).
 */
export function subscribeToStream(
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
                // Skip malformed JSON lines
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
