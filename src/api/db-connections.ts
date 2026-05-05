import api from './axios';
import type {
  DatabaseConnection,
  DatabaseConnectionCreate,
  DatabaseConnectionUpdate,
  ConnectionTestResult,
  TableSchema,
  SchemaLearningProgress,
  PaginatedResponse,
  QueryParams,
  BusinessRule,
  BusinessRuleCreate,
  BusinessRuleUpdate,
  BusinessRuleListResponse,
} from '../types';

/**
 * Database Connection API client
 */

/**
 * List all database connections with pagination
 */
export async function listConnections(
  params?: QueryParams & { company_id?: string }
): Promise<PaginatedResponse<DatabaseConnection>> {
  const response = await api.get<{ connections: DatabaseConnection[]; total: number }>('/db-agent/connections', {
    params,
  });
  // Transform backend response to match PaginatedResponse interface
  return {
    items: response.data.connections,
    total: response.data.total,
    page: 1,
    page_size: params?.page_size || 100,
    total_pages: Math.ceil(response.data.total / (params?.page_size || 100)),
  };
}

/**
 * Get a single database connection by ID
 */
export async function getConnection(id: string, companyId?: string): Promise<DatabaseConnection> {
  const response = await api.get<DatabaseConnection>(`/db-agent/connections/${id}`, {
    params: companyId ? { company_id: companyId } : undefined,
  });
  return response.data;
}

/**
 * Create a new database connection
 */
export async function createConnection(
  data: DatabaseConnectionCreate,
  companyId?: string
): Promise<DatabaseConnection> {
  const response = await api.post<DatabaseConnection>('/db-agent/connections', data, {
    params: companyId ? { company_id: companyId } : undefined,
  });
  return response.data;
}

/**
 * Update an existing database connection
 */
export async function updateConnection(
  id: string,
  data: DatabaseConnectionUpdate,
  companyId?: string
): Promise<DatabaseConnection> {
  const response = await api.patch<DatabaseConnection>(`/db-agent/connections/${id}`, data, {
    params: companyId ? { company_id: companyId } : undefined,
  });
  return response.data;
}

/**
 * Delete a database connection
 */
export async function deleteConnection(id: string, companyId?: string): Promise<void> {
  await api.delete(`/db-agent/connections/${id}`, {
    params: companyId ? { company_id: companyId } : undefined,
  });
}

/**
 * Set a connection as the default for its company
 */
export async function setDefaultConnection(id: string, companyId?: string): Promise<DatabaseConnection> {
  const response = await api.patch<DatabaseConnection>(`/db-agent/connections/${id}/set-default`, null, {
    params: companyId ? { company_id: companyId } : undefined,
  });
  return response.data;
}

/**
 * Test a database connection
 */
export async function testConnection(id: string, companyId?: string): Promise<ConnectionTestResult> {
  const response = await api.post<ConnectionTestResult>(`/db-agent/connections/${id}/test`, null, {
    params: companyId ? { company_id: companyId } : undefined,
  });
  return response.data;
}

/**
 * Discover tables in a database (lightweight, no AI cost)
 */
export async function discoverTables(
  id: string,
  companyId?: string,
): Promise<{ schema_name: string; table_name: string }[]> {
  const response = await api.get<{ schema_name: string; table_name: string }[]>(
    `/db-agent/connections/${id}/discover-tables`,
    { params: companyId ? { company_id: companyId } : undefined },
  );
  return response.data;
}

/**
 * Start schema learning for a connection
 * Always forces re-learn to ensure fresh progress tracking
 */
export async function learnSchema(
  id: string,
  tableNames?: string[],
): Promise<{ task_id: string }> {
  const params = new URLSearchParams({ force_relearn: 'true' });
  if (tableNames && tableNames.length > 0) {
    for (const name of tableNames) {
      params.append('table_names', name);
    }
  }
  const response = await api.post<{ task_id: string }>(
    `/db-agent/connections/${id}/learn-schema?${params.toString()}`,
    null,
    { timeout: 600_000 },
  );
  return response.data;
}

/**
 * Unlearn specific tables (remove from learned schema)
 */
export async function unlearnTables(
  id: string,
  tableNames: string[],
  companyId?: string,
): Promise<{ deleted: number }> {
  const params = new URLSearchParams();
  for (const name of tableNames) {
    params.append('table_names', name);
  }
  if (companyId) params.append('company_id', companyId);
  const response = await api.delete<{ deleted: number }>(
    `/db-agent/connections/${id}/unlearn-tables?${params.toString()}`
  );
  return response.data;
}

/**
 * Resume AI sync for pending tables
 */
export async function resumeAiSync(id: string): Promise<{ status: string; pending?: number }> {
  const response = await api.post<{ status: string; pending?: number }>(
    `/db-agent/connections/${id}/learn-schema/resume`
  );
  return response.data;
}

/**
 * Get schema learning progress
 */
export async function getSchemaProgress(id: string): Promise<SchemaLearningProgress> {
  const response = await api.get<SchemaLearningProgress>(
    `/db-agent/connections/${id}/learn-schema/progress`
  );
  return response.data;
}

/**
 * Get learned schema for a connection
 */
export async function getConnectionSchema(id: string): Promise<TableSchema[]> {
  const response = await api.get<{ tables: TableSchema[]; total: number }>(
    `/db-agent/connections/${id}/schema`
  );
  return response.data.tables;
}

// ============== Business Rules ==============

/**
 * List business rules for a connection
 */
export async function listBusinessRules(
  connectionId: string,
  scopeType?: string,
  companyId?: string
): Promise<BusinessRuleListResponse> {
  const params: Record<string, string> = {};
  if (scopeType) params.scope_type = scopeType;
  if (companyId) params.company_id = companyId;

  const response = await api.get<BusinessRuleListResponse>(
    `/db-agent/connections/${connectionId}/rules`,
    { params: Object.keys(params).length > 0 ? params : undefined }
  );
  return response.data;
}

/**
 * Create a business rule for a connection
 */
export async function createBusinessRule(
  connectionId: string,
  data: BusinessRuleCreate,
  companyId?: string
): Promise<BusinessRule> {
  const response = await api.post<BusinessRule>(
    `/db-agent/connections/${connectionId}/rules`,
    data,
    { params: companyId ? { company_id: companyId } : undefined }
  );
  return response.data;
}

/**
 * Update a business rule
 */
export async function updateBusinessRule(
  ruleId: string,
  data: BusinessRuleUpdate,
  companyId?: string
): Promise<BusinessRule> {
  const response = await api.patch<BusinessRule>(
    `/db-agent/rules/${ruleId}`,
    data,
    { params: companyId ? { company_id: companyId } : undefined }
  );
  return response.data;
}

/**
 * Delete a business rule
 */
export async function deleteBusinessRule(ruleId: string, companyId?: string): Promise<void> {
  await api.delete(`/db-agent/rules/${ruleId}`, {
    params: companyId ? { company_id: companyId } : undefined,
  });
}
