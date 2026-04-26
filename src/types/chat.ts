/**
 * TypeScript types for the Chat feature.
 */

export interface ChatSession {
  id: string;
  company_id: string;
  user_id: string;
  title: string;
  connection_id: string | null;
  created_at: string;
  updated_at: string;
  last_message_preview: string | null;
}

export interface ChatSessionListResponse {
  sessions: ChatSession[];
  total: number;
}

export interface ChatSessionCreate {
  title?: string;
  connection_id?: string;
}

export interface ChatSessionUpdate {
  title?: string;
  connection_id?: string;
}

export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageContentType =
  | 'text'
  | 'query_result'
  | 'report_link'
  | 'search_result'
  | 'report_picker'
  | 'error';

export interface QueryResultData {
  sql: string;
  columns: string[];
  rows: Record<string, unknown>[];
  row_count: number;
  execution_time_ms?: number;
  explanation?: string;
  confidence?: number;
  chart_config?: Record<string, unknown>;
}

export interface ReportKeyMetric {
  metric: string;
  value: string;
  change_percent?: number;
  context?: string;
}

export interface ReportLinkData {
  report_id?: string;
  query?: string;
  connection_id?: string;
  page_url: string;
  suggestion?: string;
  task_id?: string;
  title?: string;
  status?: string;
  executive_summary?: string;
  key_metrics?: ReportKeyMetric[];
}

export interface SearchResultItem {
  title: string;
  url: string;
  snippet: string;
}

export interface SearchResultData {
  query: string;
  results: SearchResultItem[];
  result_count: number;
}

export interface ReportPickerItem {
  id: string;
  title: string;
  created_at: string;
  section_count: number;
  executive_summary: string;
}

export interface ReportPickerData {
  reports: ReportPickerItem[];
  question: string;
  prompt: string;
}

export interface MessageContentBlock {
  type: MessageContentType;
  text?: string;
  query_result?: QueryResultData;
  report?: ReportLinkData;
  search_results?: SearchResultData;
  report_picker?: ReportPickerData;
  error?: { code: string; message: string };
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  message_type: MessageContentType;
  metadata_json: Record<string, unknown>;
  token_count?: number;
  created_at: string;
}

export interface ChatMessageListResponse {
  messages: ChatMessage[];
  total: number;
  has_more: boolean;
}

export interface ChatMessageSubmitResponse {
  task_id: string;
}

export type StreamingStatus =
  | 'idle'
  | 'connecting'
  | 'streaming'
  | 'reconnecting'
  | 'completed'
  | 'error';

export interface StreamingMessage {
  role: 'assistant';
  contentBlocks: MessageContentBlock[];
  isStreaming: boolean;
}
