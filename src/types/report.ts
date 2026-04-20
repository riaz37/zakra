/**
 * Types for Report Generation feature.
 */

// ============== Template Types ==============

export type ChartPreference = 'auto' | 'bar' | 'line' | 'pie' | 'scatter' | 'table';

export type ReportType = 'financial' | 'sales' | 'hr' | 'inventory' | 'custom';

export interface ReportSectionConfig {
  title: string;
  description: string;
  query_hint: string;
  chart_preference: ChartPreference;
  analysis_prompt: string | null;
  include_table: boolean;
  include_chart: boolean;
  order: number;
}

export interface ReportStyle {
  primary_color: string;
  header_text?: string;
  footer_text?: string;
}

export interface ReportTemplate {
  id: string;
  company_id: string;
  created_by: string | null;
  connection_id: string;
  name: string;
  description: string | null;
  report_type: ReportType;
  sections: ReportSectionConfig[];
  default_analysis_prompt: string | null;
  report_style: ReportStyle;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReportTemplateCreate {
  name: string;
  description?: string;
  connection_id: string;
  report_type?: ReportType;
  sections: ReportSectionConfig[];
  default_analysis_prompt?: string;
  report_style?: ReportStyle;
}

export interface ReportTemplateUpdate {
  name?: string;
  description?: string;
  sections?: ReportSectionConfig[];
  default_analysis_prompt?: string;
  report_style?: ReportStyle;
  is_active?: boolean;
}

export interface ReportTemplateListResponse {
  templates: ReportTemplate[];
  total: number;
}

// ============== Generation Types ==============

export type ReportGenerationStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface ReportGenerateResponse {
  task_id: string;
  generation_id: string;
  status: string;
}

export interface GeneratedReportSection {
  id: string;
  section_index: number;
  title: string;
  generated_query: string | null;
  query_explanation: string | null;
  query_result: {
    columns: string[];
    rows: unknown[][];
    row_count: number;
    execution_time_ms?: number;
    truncated?: boolean;
  } | null;
  chart_recommendation: {
    chart_type: string;
    title: string;
    x_axis?: string;
    y_axis?: string;
    label_column?: string;
    value_column?: string;
    group_column?: string;
    aggregation: string;
    reasoning: string;
  } | null;
  analysis_text: string | null;
  status: string;
  error_message: string | null;
  duration_ms: number | null;
}

export interface GeneratedReport {
  id: string;
  company_id: string;
  template_id: string | null;
  connection_id: string;
  generated_by: string;
  title: string;
  status: ReportGenerationStatus;
  task_id: string;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  error_message: string | null;
  executive_summary: string | null;
  sections: GeneratedReportSection[];
  generation_config: Record<string, unknown> | null;
  has_html: boolean;
  has_pdf: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReportGenerationListResponse {
  generations: GeneratedReport[];
  total: number;
}

// ============== Pipeline Types ==============

export interface ReportPipelineStepDef {
  number: number;
  name: string;
  description: string;
}

export const REPORT_PIPELINE_STEPS: ReportPipelineStepDef[] = [
  { number: 1, name: 'Template Validation', description: 'Validating template and connection' },
  { number: 2, name: 'Query Planning', description: 'AI planning SQL queries' },
  { number: 3, name: 'Query Execution', description: 'Running queries against database' },
  { number: 4, name: 'Chart Generation', description: 'AI recommending charts' },
  { number: 5, name: 'Section Analysis', description: 'AI analyzing each section' },
  { number: 6, name: 'Executive Summary', description: 'AI writing executive summary' },
  { number: 7, name: 'HTML Rendering', description: 'Building report layout' },
  { number: 8, name: 'PDF Generation', description: 'Generating downloadable PDF' },
];

// ============== AI Pipeline Steps ==============

export const AI_REPORT_PIPELINE_STEPS: ReportPipelineStepDef[] = [
  { number: 1, name: 'Template Selection', description: 'AI selecting best template for your request' },
  { number: 2, name: 'Query Adaptation', description: 'Adapting queries to your specific needs' },
  { number: 3, name: 'Template Validation', description: 'Validating template and connection' },
  { number: 4, name: 'Query Planning', description: 'AI planning SQL queries' },
  { number: 5, name: 'Query Execution', description: 'Running queries against database' },
  { number: 6, name: 'Chart Generation', description: 'AI recommending charts' },
  { number: 7, name: 'Section Analysis', description: 'AI analyzing each section' },
  { number: 8, name: 'Executive Summary', description: 'AI writing executive summary' },
  { number: 9, name: 'HTML Rendering', description: 'Building report layout' },
  { number: 10, name: 'PDF Generation', description: 'Generating downloadable PDF' },
];

// ============== AI Pipeline State ==============

export interface TemplateMatchResult {
  template_id: string;
  template_name: string;
  relevance_score: number;
  reasoning: string;
  sections_to_use: number[];
}

export interface TemplateSelectionResult {
  matches: TemplateMatchResult[];
  interpreted_request: string;
  time_period: string | null;
  filters: Record<string, string>;
  no_match_reason: string | null;
}

export interface AdaptedSectionResult {
  original_section_index: number;
  title: string;
  description: string;
  query_hint: string;
  chart_preference: string;
}

export interface QueryAdaptationResult {
  report_title: string;
  adapted_sections: AdaptedSectionResult[];
  adaptation_notes: string;
}

export interface AIReportPipelineState extends ReportPipelineState {
  templateSelection: TemplateSelectionResult | null;
  queryAdaptation: QueryAdaptationResult | null;
}

// ============== Pipeline State (for useReducer) ==============

export type ReportPipelineStatus = 'idle' | 'running' | 'completed' | 'error';

export interface ReportPipelineStep extends ReportPipelineStepDef {
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  progress?: number;
  durationMs?: number;
  resultSummary?: string;
}

export interface ReportPipelineState {
  status: ReportPipelineStatus;
  steps: ReportPipelineStep[];
  currentStep: number;
  error: {
    code: string;
    message: string;
    stepName?: string;
    recoverable: boolean;
  } | null;
  generationId: string | null;
  executiveSummary: string | null;
  keyMetrics: Array<{
    metric: string;
    value: string;
    change_percent?: number;
    context?: string;
  }>;
  recommendations: string[];
  sectionResults: Map<number, {
    title: string;
    key_findings?: string[];
    narrative?: string;
  }>;
  durationMs: number | null;
}
