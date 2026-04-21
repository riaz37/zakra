import { getAccessToken } from './axios';
import { API_BASE_URL } from '../utils/constants';
import type { SSEEventType } from '../types';

export type { SSEEventType };

async function connectSSEStream(
  taskId: string,
  onEvent: (eventType: SSEEventType, data: Record<string, unknown>) => void,
  onError: (error: Error) => void,
  onComplete: () => void,
  signal: AbortSignal | undefined,
  maxRetries: number,
  onReconnect: ((attempt: number) => void) | undefined,
  retryCount: number,
): Promise<void> {
  const url = `${API_BASE_URL}/streams/${taskId}`;
  const token = getAccessToken(); // fresh per attempt — handles token expiry during long streams

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/event-stream',
      },
      signal,
    });

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
  } catch (err) {
    if (signal?.aborted || (err instanceof Error && err.name === 'AbortError')) return;

    if (retryCount < maxRetries) {
      const delay = Math.pow(2, retryCount) * 1000;
      onReconnect?.(retryCount + 1);
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, delay);
        signal?.addEventListener('abort', () => { clearTimeout(timer); resolve(); }, { once: true });
      });
      if (signal?.aborted) return;
      await connectSSEStream(taskId, onEvent, onError, onComplete, signal, maxRetries, onReconnect, retryCount + 1);
    } else {
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  }
}

/**
 * Subscribe to an SSE stream by task ID.
 * Automatically retries up to maxRetries times with exponential backoff (1s, 2s, 4s).
 * Uses a fresh access token on each attempt to handle token expiry during long streams.
 *
 * @param taskId - The task ID to subscribe to
 * @param onEvent - Callback for each parsed SSE event
 * @param onError - Callback for fatal connection errors (after all retries exhausted)
 * @param onComplete - Callback when stream ends cleanly
 * @param signal - AbortSignal for cancellation
 * @param maxRetries - Maximum retry attempts on network error (default: 3)
 * @param onReconnect - Called before each retry attempt with the attempt number
 */
export function subscribeToSSEStream(
  taskId: string,
  onEvent: (eventType: SSEEventType, data: Record<string, unknown>) => void,
  onError: (error: Error) => void,
  onComplete: () => void,
  signal?: AbortSignal,
  maxRetries = 3,
  onReconnect?: (attempt: number) => void,
): void {
  connectSSEStream(taskId, onEvent, onError, onComplete, signal, maxRetries, onReconnect, 0);
}
