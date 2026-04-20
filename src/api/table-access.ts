import api from './axios';
import type {
  ManagedTable,
  ColumnPermissionGrant,
  GrantColumnPermission,
  BulkGrantPermissions,
  UserTablePermissions,
  RegisterTableRequest,
  PaginatedResponse,
  QueryParams,
} from '../types';

/**
 * Table Access API client
 */

/**
 * Register a table for access management
 */
export async function registerTable(
  data: RegisterTableRequest,
  companyId?: string
): Promise<ManagedTable> {
  const response = await api.post<ManagedTable>('/data/tables', data, {
    params: companyId ? { company_id: companyId } : undefined,
  });
  return response.data;
}

/**
 * List managed tables with pagination
 */
export async function listManagedTables(
  params?: QueryParams & { company_id?: string }
): Promise<PaginatedResponse<ManagedTable>> {
  const response = await api.get<PaginatedResponse<ManagedTable>>('/data/tables', {
    params,
  });
  return response.data;
}

/**
 * Get a single managed table by ID
 */
export async function getManagedTable(tableName: string, schemaName = 'public'): Promise<ManagedTable> {
  const response = await api.get<ManagedTable>(`/data/tables/${tableName}/columns`, {
    params: { schema_name: schemaName },
  });
  return response.data;
}

/**
 * Get permissions for a table
 */
export async function getTablePermissions(
  tableName: string,
  schemaName = 'public'
): Promise<ColumnPermissionGrant[]> {
  const response = await api.get<ColumnPermissionGrant[]>(
    `/data/tables/${tableName}/permissions`,
    { params: { schema_name: schemaName } }
  );
  return response.data;
}

/**
 * Grant column permission
 */
export async function grantColumnPermission(
  tableName: string,
  data: GrantColumnPermission,
  schemaName = 'public',
  companyId?: string
): Promise<ColumnPermissionGrant> {
  const response = await api.post<ColumnPermissionGrant>(
    `/data/tables/${tableName}/column-permissions`,
    data,
    { params: { schema_name: schemaName, company_id: companyId } }
  );
  return response.data;
}

/**
 * Bulk grant permissions
 */
export async function bulkGrantPermissions(
  tableName: string,
  data: BulkGrantPermissions,
  schemaName = 'public'
): Promise<void> {
  await api.post(`/data/tables/${tableName}/column-permissions/bulk`, data, {
    params: { schema_name: schemaName },
  });
}

/**
 * Revoke column permission
 */
export async function revokeColumnPermission(
  tableName: string,
  columnName: string,
  granteeType: 'user' | 'role',
  granteeId: string,
  schemaName = 'public'
): Promise<void> {
  await api.delete(`/data/tables/${tableName}/column-permissions/${columnName}`, {
    params: { grantee_type: granteeType, grantee_id: granteeId, schema_name: schemaName },
  });
}

/**
 * Get user's table permissions (all tables)
 */
export async function getUserTablePermissions(
  userId: string
): Promise<UserTablePermissions[]> {
  const response = await api.get<UserTablePermissions[]>(
    `/data/users/${userId}/permissions`
  );
  return response.data;
}

/**
 * Get a specific user's column permissions for a specific table
 * Returns a mapping of column_name -> permission level
 */
export async function getUserTableColumnPermissions(
  tableName: string,
  userId: string,
  schemaName = 'public',
  companyId?: string
): Promise<Record<string, string>> {
  const response = await api.get<Record<string, string>>(
    `/data/tables/${tableName}/user-permissions/${userId}`,
    { params: { schema_name: schemaName, company_id: companyId } }
  );
  return response.data;
}
