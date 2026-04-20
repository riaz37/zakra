import { useCallback, useReducer, useRef } from 'react';
import { submitQuery, subscribeToStream } from '../api/db-query';
import type {
  ChartRecommendation,
  NLQueryRequest,
  PipelineState,
  PipelineStep,
  QueryResult,
  SSEEventType,
  QueryFullResult,
} from '../types';
import { PIPELINE_STEP_DEFINITIONS as STEPS } from '../types';

// ============== Reducer ==============

type Action =
  | { type: 'RESET' }
  | { type: 'START' }
  | { type: 'STEP_RUNNING'; stepNumber: number }
  | { type: 'STEP_PROGRESS'; stepNumber: number; progress: number; message?: string }
  | { type: 'STEP_COMPLETE'; stepNumber: number; durationMs: number; resultSummary?: string }
  | { type: 'STEP_FAILED'; stepNumber: number }
  | { type: 'SET_SQL'; sql: string; explanation?: string; confidence?: number }
  | { type: 'SET_RESULT'; result: QueryResult; durationMs: number }
  | { type: 'SET_CHART'; chart: ChartRecommendation }
  | { type: 'SET_ERROR'; code: string; message: string; stepName?: string; recoverable: boolean }
  | { type: 'COMPLETE'; durationMs: number };

function createInitialState(): PipelineState {
  return {
    status: 'idle',
    steps: STEPS.map((s) => ({ ...s, status: 'pending' as const })),
    currentStep: 0,
    error: null,
    generatedSql: null,
    queryExplanation: null,
    confidenceScore: null,
    queryResult: null,
    chartRecommendation: null,
    durationMs: null,
  };
}

function updateStep(
  steps: PipelineStep[],
  stepNumber: number,
  update: Partial<PipelineStep>,
): PipelineStep[] {
  return steps.map((s) => (s.number === stepNumber ? { ...s, ...update } : s));
}

function reducer(state: PipelineState, action: Action): PipelineState {
  switch (action.type) {
    case 'RESET':
      return createInitialState();

    case 'START':
      return { ...createInitialState(), status: 'running' };

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

    case 'STEP_FAILED':
      return {
        ...state,
        steps: updateStep(state.steps, action.stepNumber, { status: 'failed' }),
      };

    case 'SET_SQL':
      return {
        ...state,
        generatedSql: action.sql,
        queryExplanation: action.explanation ?? state.queryExplanation,
        confidenceScore: action.confidence ?? state.confidenceScore,
      };

    case 'SET_RESULT': {
      return {
        ...state,
        queryResult: action.result,
        durationMs: action.durationMs,
      };
    }

    case 'SET_CHART':
      return {
        ...state,
        chartRecommendation: action.chart,
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

export function useExecuteQuery() {
  const [pipeline, dispatch] = useReducer(reducer, undefined, createInitialState);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    dispatch({ type: 'RESET' });
  }, []);

  const execute = useCallback(async (request: NLQueryRequest, companyId?: string) => {
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    dispatch({ type: 'START' });

    try {
      const { task_id } = await submitQuery(request, companyId);

      subscribeToStream(
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

              if (resultType === 'sql_query') {
                const sqlData = data.data as Record<string, unknown>;
                dispatch({
                  type: 'SET_SQL',
                  sql: sqlData.query as string,
                  explanation: sqlData.explanation as string | undefined,
                  confidence: (sqlData.confidence ?? sqlData.confidence_score) as number | undefined,
                });
              } else if (resultType === 'chart_recommendation') {
                const chartData = data.data as ChartRecommendation;
                dispatch({ type: 'SET_CHART', chart: chartData });
              } else if (resultType === 'query_result') {
                const fullResult = data.data as QueryFullResult;
                if (fullResult.generated_query) {
                  dispatch({
                    type: 'SET_SQL',
                    sql: fullResult.generated_query,
                    explanation: fullResult.query_explanation ?? undefined,
                    confidence: fullResult.confidence_score,
                  });
                }
                if (fullResult.result) {
                  dispatch({
                    type: 'SET_RESULT',
                    result: fullResult.result as QueryResult,
                    durationMs: fullResult.duration_ms,
                  });
                }
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
          // Stream ended — finalize if still running
          dispatch({ type: 'COMPLETE', durationMs: 0 });
        },
        controller.signal,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit query';
      dispatch({
        type: 'SET_ERROR',
        code: 'SUBMIT_ERROR',
        message,
        recoverable: true,
      });
    }
  }, []);

  return {
    execute,
    reset,
    pipeline,
    isLoading: pipeline.status === 'running',
  };
}
