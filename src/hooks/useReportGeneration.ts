import { useCallback, useReducer, useRef } from 'react';
import { generateReport } from '../api/reports';
import { subscribeToSSEStream } from '../api/sse';
import type { SSEEventType } from '../api/sse';
import type {
  ReportPipelineState,
  ReportPipelineStep,
} from '../types';
import { REPORT_PIPELINE_STEPS } from '../types';

// ============== Actions ==============

type Action =
  | { type: 'RESET' }
  | { type: 'START'; generationId: string }
  | { type: 'STEP_RUNNING'; stepNumber: number }
  | { type: 'STEP_PROGRESS'; stepNumber: number; progress: number; message?: string }
  | { type: 'STEP_COMPLETE'; stepNumber: number; durationMs: number; resultSummary?: string }
  | { type: 'SET_SECTION_RESULT'; sectionIndex: number; title: string; key_findings?: string[]; narrative?: string }
  | { type: 'SET_EXECUTIVE_SUMMARY'; summary: string; keyMetrics: ReportPipelineState['keyMetrics']; recommendations: string[] }
  | { type: 'SET_ERROR'; code: string; message: string; stepName?: string; recoverable: boolean }
  | { type: 'COMPLETE'; durationMs: number };

// ============== State ==============

function createInitialState(): ReportPipelineState {
  return {
    status: 'idle',
    steps: REPORT_PIPELINE_STEPS.map((s) => ({
      ...s,
      status: 'pending' as const,
    })),
    currentStep: 0,
    error: null,
    generationId: null,
    executiveSummary: null,
    keyMetrics: [],
    recommendations: [],
    sectionResults: new Map(),
    durationMs: null,
  };
}

function updateStep(
  steps: ReportPipelineStep[],
  stepNumber: number,
  update: Partial<ReportPipelineStep>,
): ReportPipelineStep[] {
  return steps.map((s) =>
    s.number === stepNumber ? { ...s, ...update } : s,
  );
}

function reducer(state: ReportPipelineState, action: Action): ReportPipelineState {
  switch (action.type) {
    case 'RESET':
      return createInitialState();

    case 'START':
      return {
        ...createInitialState(),
        status: 'running',
        generationId: action.generationId,
      };

    case 'STEP_RUNNING':
      return {
        ...state,
        currentStep: action.stepNumber,
        steps: updateStep(state.steps, action.stepNumber, { status: 'running' }),
      };

    case 'STEP_PROGRESS':
      return {
        ...state,
        steps: updateStep(state.steps, action.stepNumber, {
          progress: action.progress,
          resultSummary: action.message || state.steps[action.stepNumber - 1]?.resultSummary,
        }),
      };

    case 'STEP_COMPLETE':
      return {
        ...state,
        steps: updateStep(state.steps, action.stepNumber, {
          status: 'completed',
          durationMs: action.durationMs,
          resultSummary: action.resultSummary,
          progress: 100,
        }),
      };

    case 'SET_SECTION_RESULT': {
      const newMap = new Map(state.sectionResults);
      newMap.set(action.sectionIndex, {
        title: action.title,
        key_findings: action.key_findings,
        narrative: action.narrative,
      });
      return { ...state, sectionResults: newMap };
    }

    case 'SET_EXECUTIVE_SUMMARY':
      return {
        ...state,
        executiveSummary: action.summary,
        keyMetrics: action.keyMetrics,
        recommendations: action.recommendations,
      };

    case 'SET_ERROR':
      return {
        ...state,
        status: 'error',
        error: {
          code: action.code,
          message: action.message,
          stepName: action.stepName,
          recoverable: action.recoverable,
        },
      };

    case 'COMPLETE':
      return {
        ...state,
        status: 'completed',
        durationMs: action.durationMs || state.durationMs,
      };

    default:
      return state;
  }
}

// ============== Hook ==============

export function useReportGeneration() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    dispatch({ type: 'RESET' });
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const generate = useCallback(async (templateId: string, companyId?: string, title?: string, language?: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const { task_id, generation_id } = await generateReport(templateId, companyId, title, language);
      dispatch({ type: 'START', generationId: generation_id });

      subscribeToSSEStream(
        task_id,
        (eventType: SSEEventType, data: Record<string, unknown>) => {
          switch (eventType) {
            case 'step_start':
              dispatch({
                type: 'STEP_RUNNING',
                stepNumber: data.step_number as number,
              });
              break;

            case 'step_progress':
              dispatch({
                type: 'STEP_PROGRESS',
                stepNumber: data.step_number as number,
                progress: data.progress_percent as number,
                message: data.message as string | undefined,
              });
              break;

            case 'step_complete':
              dispatch({
                type: 'STEP_COMPLETE',
                stepNumber: data.step_number as number,
                durationMs: data.duration_ms as number,
                resultSummary: data.result_summary as string | undefined,
              });
              break;

            case 'intermediate_result': {
              const resultType = data.result_type as string;
              const resultData = data.data as Record<string, unknown>;

              if (resultType === 'section_analysis') {
                dispatch({
                  type: 'SET_SECTION_RESULT',
                  sectionIndex: resultData.section_index as number,
                  title: resultData.title as string,
                  key_findings: resultData.key_findings as string[] | undefined,
                  narrative: resultData.narrative as string | undefined,
                });
              } else if (resultType === 'executive_summary') {
                dispatch({
                  type: 'SET_EXECUTIVE_SUMMARY',
                  summary: resultData.summary as string,
                  keyMetrics: (resultData.key_metrics || []) as ReportPipelineState['keyMetrics'],
                  recommendations: (resultData.recommendations || []) as string[],
                });
              }
              break;
            }

            case 'agent_complete':
              dispatch({
                type: 'COMPLETE',
                durationMs: data.total_duration_ms as number,
              });
              break;

            case 'agent_error':
              dispatch({
                type: 'SET_ERROR',
                code: data.error_code as string,
                message: data.error_message as string,
                stepName: data.step_name as string | undefined,
                recoverable: data.recoverable as boolean,
              });
              break;
          }
        },
        (error) => {
          dispatch({
            type: 'SET_ERROR',
            code: 'SSE_CONNECTION_ERROR',
            message: error.message,
            recoverable: true,
          });
        },
        () => {
          dispatch({ type: 'COMPLETE', durationMs: 0 });
        },
        controller.signal,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start report generation';
      dispatch({
        type: 'SET_ERROR',
        code: 'SUBMIT_ERROR',
        message,
        recoverable: true,
      });
    }
  }, []);

  return {
    state,
    isGenerating: state.status === 'running',
    generate,
    cancel,
    reset,
  };
}
