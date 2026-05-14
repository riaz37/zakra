import api from './axios';
import type {
  ListUser,
  UserDetail,
  UserCreate,
  UserUpdate,
  UserRole,
  AssignRolesRequest,
  PaginatedResponse,
  QueryParams,
} from '../types';

/**
 * User API client
 */

/**
 * List all users with pagination
 */
export async function listUsers(params?: QueryParams): Promise<PaginatedResponse<ListUser>> {
  const { page = 1, page_size = 10, ...rest } = params ?? {};
  const skip = (page - 1) * page_size;
  const response = await api.get<PaginatedResponse<ListUser>>('/users', {
    params: { skip, limit: page_size, ...rest },
  });
  const data = response.data;
  return {
    ...data,
    total_pages: Math.ceil(data.total / page_size),
  };
}

/**
 * Get a single user by ID with full details
 */
export async function getUser(id: string): Promise<UserDetail> {
  const response = await api.get<UserDetail>(`/users/${id}`);
  return response.data;
}

/**
 * Create a new user
 */
export async function createUser(data: UserCreate): Promise<ListUser> {
  const response = await api.post<ListUser>('/users', data);
  return response.data;
}

/**
 * Update an existing user
 */
export async function updateUser(id: string, data: UserUpdate): Promise<ListUser> {
  const response = await api.put<ListUser>(`/users/${id}`, data);
  return response.data;
}

/**
 * Delete a user
 */
export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`);
}

/**
 * Get user roles
 */
export async function getUserRoles(userId: string): Promise<UserRole[]> {
  const response = await api.get<UserRole[]>(`/users/${userId}/roles`);
  return response.data;
}

/**
 * Assign roles to a user
 */
export async function assignUserRoles(userId: string, data: AssignRolesRequest): Promise<void> {
  await api.put(`/users/${userId}/roles`, data);
}
