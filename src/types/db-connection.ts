export type DatabaseType = 'mssql';

export interface DatabaseConnection {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  database_type: DatabaseType;
  host: string;
  port: number;
  database_name: string;
  username: string;
  ssl_enabled: boolean;
  is_default: boolean;
  is_active: boolean;
  last_connected_at: string | null;
  last_error: string | null;
  schema_learned: boolean;
  schema_learned_at: string | null;
  pool_size: number;
  query_timeout: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseConnectionCreate {
  name: string;
  description?: string;
  database_type: DatabaseType;
  host: string;
  port: number;
  database_name: string;
  username: string;
  password: string;
  ssl_enabled?: boolean;
  pool_size?: number;
  query_timeout?: number;
}

export interface DatabaseConnectionUpdate {
  name?: string;
  description?: string;
  host?: string;
  port?: number;
  database_name?: string;
  username?: string;
  password?: string;
  ssl_enabled?: boolean;
  is_active?: boolean;
  pool_size?: number;
  query_timeout?: number;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latency_ms?: number;
}

export interface TableSchema {
  schema_name: string;
  table_name: string;
  display_name: string;
  description: string | null;
  row_count: number;
  columns: ColumnSchema[];
}

export interface ColumnSchema {
  name: string;
  data_type: string;
  is_nullable: boolean;
  is_primary_key: boolean;
  is_foreign_key: boolean;
  references: string | null;
  description: string | null;
}

// ============== Business Rules ==============

export type BusinessRuleScopeType = 'global' | 'table' | 'user';

export interface BusinessRule {
  id: string;
  connection_id: string;
  name: string;
  scope_type: BusinessRuleScopeType;
  scope_value: string | null;
  rule_text: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessRuleCreate {
  name: string;
  scope_type: BusinessRuleScopeType;
  scope_value?: string;
  rule_text: string;
}

export interface BusinessRuleUpdate {
  name?: string;
  scope_type?: BusinessRuleScopeType;
  scope_value?: string;
  rule_text?: string;
  is_active?: boolean;
}

export interface BusinessRuleListResponse {
  rules: BusinessRule[];
  total: number;
}

// ============== Schema Learning ==============

export interface SchemaLearningProgress {
  connection_id: string;
  schema_learned: boolean;
  schema_learned_at: string | null;
  total_tables: number;
  basic_extraction: {
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    tables_extracted: number;
  };
  ai_sync: {
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    pending: number;
    completed: number;
    failed: number;
    progress_percent: number;
  };
  // Optional fields for real-time progress during learning
  phase?: 'basic_learning' | 'ai_sync';
  current_table?: string;
  progress_percent?: number;
  completed_tables?: number;
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';
  error?: string;
}
