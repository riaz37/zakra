/**
 * Hook for sending chat messages and handling SSE streaming responses.
 * Uses useReducer pattern from useDbQuery.ts.
 */

import { useCallback, useReducer, useRef } from 'react';
import { sendMessage } from '../api/chat';
import { subscribeToSSEStream, type SSEEventType } from '../api/sse';
import type {
  MessageContentBlock,
  StreamingMessage,
  StreamingStatus,
  QueryResultData,
  SearchResultData,
  ReportLinkData,
  ReportPickerData,
} from '../types/chat';

// ============== Pipeline Step Tracking ==============

export interface PipelineStep {
  stepNumber: number;
  stepName: string;
  description?: string;
  status: 'running' | 'completed' | 'failed';
  resultSummary?: string;
  durationMs?: number;
}

// ============== State & Actions ==============

interface StreamState {
  status: StreamingStatus;
  streamingMessage: StreamingMessage | null;
  pendingUserMessage: string | null;
  pipelineSteps: PipelineStep[];
  error: string | null;
}

type Action =
  | { type: 'RESET' }
  | { type: 'START'; userMessage: string }
  | { type: 'TEXT_DELTA'; text: string }
  | { type: 'QUERY_RESULT'; data: QueryResultData }
  | { type: 'REPORT_LINK'; data: ReportLinkData }
  | { type: 'SEARCH_RESULT'; data: SearchResultData }
  | { type: 'REPORT_PICKER'; data: ReportPickerData }
  | { type: 'STEP_START'; stepNumber: number; stepName: string; description?: string }
  | { type: 'STEP_COMPLETE'; stepNumber: number; stepName: string; success: boolean; resultSummary?: string; durationMs?: number }
  | { type: 'ERROR'; message: string }
  | { type: 'COMPLETE' };

function createInitialState(): StreamState {
  return {
    status: 'idle',
    streamingMessage: null,
    pendingUserMessage: null,
    pipelineSteps: [],
    error: null,
  };
}

function ensureStreamingMessage(state: StreamState): StreamingMessage {
  return (
    state.streamingMessage ?? {
      role: 'assistant',
      contentBlocks: [],
      isStreaming: true,
    }
  );
}

function reducer(state: StreamState, action: Action): StreamState {
  switch (action.type) {
    case 'RESET':
      return createInitialState();

    case 'START':
      return {
        status: 'connecting',
        streamingMessage: null,
        pendingUserMessage: action.userMessage,
        pipelineSteps: [],
        error: null,
      };

    case 'TEXT_DELTA': {
      const msg = ensureStreamingMessage(state);
      const blocks = [...msg.contentBlocks];

      // Append to existing text block or create new one
      const lastBlock = blocks[blocks.length - 1];
      if (lastBlock && lastBlock.type === 'text') {
        blocks[blocks.length - 1] = {
          ...lastBlock,
          text: (lastBlock.text || '') + action.text,
        };
      } else {
        blocks.push({ type: 'text', text: action.text });
      }

      return {
        ...state,
        status: 'streaming',
        streamingMessage: { ...msg, contentBlocks: blocks, isStreaming: true },
      };
    }

    case 'QUERY_RESULT': {
      const msg = ensureStreamingMessage(state);
      const blocks = [...msg.contentBlocks];
      blocks.push({ type: 'query_result', query_result: action.data });
      return {
        ...state,
        status: 'streaming',
        streamingMessage: { ...msg, contentBlocks: blocks, isStreaming: true },
      };
    }

    case 'REPORT_LINK': {
      const msg = ensureStreamingMessage(state);
      const blocks = [...msg.contentBlocks];
      blocks.push({ type: 'report_link', report: action.data });
      return {
        ...state,
        status: 'streaming',
        streamingMessage: { ...msg, contentBlocks: blocks, isStreaming: true },
      };
    }

    case 'SEARCH_RESULT': {
      const msg = ensureStreamingMessage(state);
      const blocks = [...msg.contentBlocks];
      blocks.push({ type: 'search_result', search_results: action.data });
      return {
        ...state,
        status: 'streaming',
        streamingMessage: { ...msg, contentBlocks: blocks, isStreaming: true },
      };
    }

    case 'REPORT_PICKER': {
      const msg = ensureStreamingMessage(state);
      const blocks = [...msg.contentBlocks];
      blocks.push({ type: 'report_picker', report_picker: action.data });
      return {
        ...state,
        status: 'streaming',
        streamingMessage: { ...msg, contentBlocks: blocks, isStreaming: true },
      };
    }

    case 'STEP_START': {
      const steps = [...state.pipelineSteps];
      // Use stepName as unique key (step numbers can overlap between orchestrator and sub-agents)
      const existing = steps.findIndex(
        (s) => s.stepName === action.stepName && s.stepNumber === action.stepNumber,
      );
      if (existing >= 0) {
        steps[existing] = {
          ...steps[existing],
          status: 'running',
          description: action.description,
        };
      } else {
        steps.push({
          stepNumber: action.stepNumber,
          stepName: action.stepName,
          description: action.description,
          status: 'running',
        });
      }
      return {
        ...state,
        status: 'streaming',
        pipelineSteps: steps,
      };
    }

    case 'STEP_COMPLETE': {
      const steps = [...state.pipelineSteps];
      const idx = steps.findIndex(
        (s) => s.stepName === action.stepName && s.stepNumber === action.stepNumber,
      );
      if (idx >= 0) {
        steps[idx] = {
          ...steps[idx],
          status: action.success ? 'completed' : 'failed',
          resultSummary: action.resultSummary,
          durationMs: action.durationMs,
        };
      } else {
        steps.push({
          stepNumber: action.stepNumber,
          stepName: action.stepName,
          status: action.success ? 'completed' : 'failed',
          resultSummary: action.resultSummary,
          durationMs: action.durationMs,
        });
      }
      return {
        ...state,
        pipelineSteps: steps,
      };
    }

    case 'ERROR':
      return {
        ...state,
        status: 'error',
        pendingUserMessage: null,
        error: action.message,
        streamingMessage: state.streamingMessage
          ? { ...state.streamingMessage, isStreaming: false }
          : null,
      };

    case 'COMPLETE':
      return {
        ...state,
        status: 'completed',
        pendingUserMessage: null,
        // Keep streaming message visible (isStreaming: false) so there's
        // no flash while React Query refetches persisted messages.
        // ChatMessageList deduplicates once the persisted message arrives.
        streamingMessage: state.streamingMessage
          ? { ...state.streamingMessage, isStreaming: false }
          : null,
      };

    default:
      return state;
  }
}

// ============== Hook ==============

interface UseChatStreamOptions {
  onComplete?: () => void;
}

export function useChatStream(options?: UseChatStreamOptions) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const abortRef = useRef<AbortController | null>(null);
  const completedRef = useRef(false);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    dispatch({ type: 'RESET' });
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    dispatch({ type: 'COMPLETE' });
  }, []);

  const send = useCallback(
    async (sessionId: string, content: string, companyId?: string, language?: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      completedRef.current = false;

      dispatch({ type: 'START', userMessage: content });

      try {
        const { task_id } = await sendMessage(sessionId, content, companyId, language);

        subscribeToSSEStream(
          task_id,
          (eventType: SSEEventType, data: Record<string, unknown>) => {
            switch (eventType) {
              case 'intermediate_result': {
                const resultType = data.result_type as string;
                const resultData = data.data as Record<string, unknown>;

                if (resultType === 'text_delta') {
                  dispatch({
                    type: 'TEXT_DELTA',
                    text: (resultData.text as string) || '',
                  });
                } else if (resultType === 'query_result') {
                  dispatch({
                    type: 'QUERY_RESULT',
                    data: resultData as unknown as QueryResultData,
                  });
                } else if (resultType === 'report_link') {
                  dispatch({
                    type: 'REPORT_LINK',
                    data: resultData as unknown as ReportLinkData,
                  });
                } else if (resultType === 'search_result') {
                  dispatch({
                    type: 'SEARCH_RESULT',
                    data: resultData as unknown as SearchResultData,
                  });
                } else if (resultType === 'report_picker') {
                  dispatch({
                    type: 'REPORT_PICKER',
                    data: resultData as unknown as ReportPickerData,
                  });
                }
                break;
              }

              case 'step_start':
                dispatch({
                  type: 'STEP_START',
                  stepNumber: data.step_number as number,
                  stepName: data.step_name as string,
                  description: data.description as string | undefined,
                });
                break;

              case 'step_complete':
                dispatch({
                  type: 'STEP_COMPLETE',
                  stepNumber: data.step_number as number,
                  stepName: data.step_name as string,
                  success: (data.success as boolean) ?? true,
                  resultSummary: data.result_summary as string | undefined,
                  durationMs: data.duration_ms as number | undefined,
                });
                break;

              case 'agent_complete':
                if (!completedRef.current) {
                  completedRef.current = true;
                  dispatch({ type: 'COMPLETE' });
                  options?.onComplete?.();
                }
                break;

              case 'agent_error':
                dispatch({
                  type: 'ERROR',
                  message: (data.error_message as string) || 'An error occurred',
                });
                break;

              default:
                break;
            }
          },
          (error) => {
            dispatch({ type: 'ERROR', message: error.message });
          },
          () => {
            if (!completedRef.current) {
              completedRef.current = true;
              dispatch({ type: 'COMPLETE' });
              options?.onComplete?.();
            }
          },
          controller.signal,
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to send message';
        dispatch({ type: 'ERROR', message });
      }
    },
    [options],
  );

  return {
    send,
    reset,
    cancel,
    streamingMessage: state.streamingMessage,
    pendingUserMessage: state.pendingUserMessage,
    pipelineSteps: state.pipelineSteps,
    isStreaming: state.status === 'streaming' || state.status === 'connecting',
    error: state.error,
    status: state.status,
  };
}
