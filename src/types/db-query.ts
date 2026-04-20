/**
 * Types for DB Query Agent SSE pipeline and results.
 */

// ============== SSE Event Types ==============

export type SSEEventType =
  | 'agent_start'
  | 'agent_complete'
  | 'agent_error'
  | 'step_start'
  | 'step_progress'
  | 'step_complete'
  | 'intermediate_result'
  | 'keepalive';

export interface SSEEventBase {
  event_type: SSEEventType;
  task_id: string;
  timestamp: string;
  sequence: number;
}

export interface AgentStartEvent extends SSEEventBase {
  event_type: 'agent_start';
  agent_type: string;
  total_steps: number;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface AgentCompleteEvent extends SSEEventBase {
  event_type: 'agent_complete';
  total_duration_ms: number;
  steps_completed: number;
  result_id?: string;
  summary?: string;
  metrics?: Record<string, unknown>;
}

export interface AgentErrorEvent extends SSEEventBase {
  event_type: 'agent_error';
  error_code: string;
  error_message: string;
  step_name?: string;
  recoverable: boolean;
  details?: Record<string, unknown>;
}

export interface StepStartEvent extends SSEEventBase {
  event_type: 'step_start';
  step_number: number;
  step_name: string;
  description?: string;
}

export interface StepProgressEvent extends SSEEventBase {
  event_type: 'step_progress';
  step_number: number;
  progress_percent: number;
  message?: string;
  items_processed?: number;
  items_total?: number;
}

export interface StepCompleteEvent extends SSEEventBase {
  event_type: 'step_complete';
  step_number: number;
  step_name: string;
  duration_ms: number;
  success: boolean;
  result_summary?: string;
  metrics?: Record<string, unknown>;
}

export interface IntermediateResultEvent extends SSEEventBase {
  event_type: 'intermediate_result';
  result_type: string;
  data: Record<string, unknown>;
  is_partial: boolean;
}

export type SSEEvent =
  | AgentStartEvent
  | AgentCompleteEvent
  | AgentErrorEvent
  | StepStartEvent
  | StepProgressEvent
  | StepCompleteEvent
  | IntermediateResultEvent;

// ============== Query Request/Response ==============

export interface NLQueryRequest {
  query: string;
  connection_id: string;
  include_explanation?: boolean;
  max_rows?: number;
}

export interface QuerySubmitResponse {
  task_id: string;
}

export interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  row_count: number;
  execution_time_ms: number;
  truncated: boolean;
}

export interface QueryFullResult {
  task_id: string;
  request_id: string;
  natural_language_query: string;
  generated_query: string | null;
  query_explanation: string | null;
  confidence_score: number;
  result: QueryResult | null;
  duration_ms: number;
  steps: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

// ============== Chart Recommendation ==============

export type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'table';

export type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max' | 'none';

export interface ChartRecommendation {
  chart_type: ChartType;
  title: string;
  x_axis: string | null;
  y_axis: string | null;
  z_axis: string | null;
  label_column: string | null;
  value_column: string | null;
  group_column: string | null;
  aggregation: AggregationType;
  reasoning: string;
}

// ============== Pipeline UI State ==============

export type PipelineStatus = 'idle' | 'running' | 'completed' | 'error';
export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface PipelineStep {
  number: number;
  name: string;
  description: string;
  status: StepStatus;
  durationMs?: number;
  resultSummary?: string;
  progress?: number;
}

export interface PipelineState {
  status: PipelineStatus;
  steps: PipelineStep[];
  currentStep: number;
  error: { code: string; message: string; stepName?: string; recoverable: boolean } | null;
  generatedSql: string | null;
  queryExplanation: string | null;
  confidenceScore: number | null;
  queryResult: QueryResult | null;
  chartRecommendation: ChartRecommendation | null;
  durationMs: number | null;
}

export const PIPELINE_STEP_DEFINITIONS: Omit<PipelineStep, 'status'>[] = [
  { number: 1, name: 'Business Rules', description: 'Analyzing applicable rules' },
  { number: 2, name: 'Table Selection', description: 'AI selecting relevant tables' },
  { number: 3, name: 'Column Selection', description: 'AI selecting relevant columns' },
  { number: 4, name: 'Query Generation', description: 'Generating SQL' },
  { number: 5, name: 'Query Validation', description: 'Validating security' },
  { number: 6, name: 'Column Masking', description: 'Applying data masking' },
  { number: 7, name: 'Query Execution', description: 'Running query' },
  { number: 8, name: 'Chart Recommendation', description: 'Analyzing best visualization' },
];
