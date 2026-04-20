import api from './axios';
import type {
  Role,
  RoleCreate,
  RoleUpdate,
  Permission,
  SetRolePermissions,
  PermissionListResponse,
  PaginatedResponse,
  QueryParams,
} from '../types';

/**
 * Role API client
 */

/**
 * List all roles with pagination
 */
export async function listRoles(params?: QueryParams): Promise<PaginatedResponse<Role>> {
  const response = await api.get<PaginatedResponse<Role>>('/roles', { params });
  return response.data;
}

/**
 * Get a single role by ID
 */
export async function getRole(id: string): Promise<Role> {
  const response = await api.get<Role>(`/roles/${id}`);
  return response.data;
}

/**
 * Create a new role
 */
export async function createRole(data: RoleCreate): Promise<Role> {
  const response = await api.post<Role>('/roles', data);
  return response.data;
}

/**
 * Update an existing role
 */
export async function updateRole(id: string, data: RoleUpdate): Promise<Role> {
  const response = await api.put<Role>(`/roles/${id}`, data);
  return response.data;
}

/**
 * Delete a role
 */
export async function deleteRole(id: string): Promise<void> {
  await api.delete(`/roles/${id}`);
}

/**
 * Get role permissions
 */
export async function getRolePermissions(roleId: string): Promise<Permission[]> {
  const response = await api.get<Permission[]>(`/roles/${roleId}/permissions`);
  return response.data;
}

/**
 * Set role permissions
 */
export async function setRolePermissions(
  roleId: string,
  data: SetRolePermissions
): Promise<void> {
  await api.put(`/roles/${roleId}/permissions`, data);
}

/**
 * List all available permissions
 */
export async function listPermissions(): Promise<PermissionListResponse> {
  const response = await api.get<PermissionListResponse>('/roles/permissions/all');
  return response.data;
}
