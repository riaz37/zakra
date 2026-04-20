import api from './axios';
import type {
  Company,
  CompanyCreate,
  CompanyUpdate,
  SubsidiaryCreate,
  PaginatedResponse,
  QueryParams,
} from '../types';

/**
 * Company API client
 */

/**
 * List all companies with pagination
 */
export async function listCompanies(params?: QueryParams): Promise<PaginatedResponse<Company>> {
  const response = await api.get<PaginatedResponse<Company>>('/companies', { params });
  return response.data;
}

/**
 * Get a single company by ID
 */
export async function getCompany(id: string): Promise<Company> {
  const response = await api.get<Company>(`/companies/${id}`);
  return response.data;
}

/**
 * Create a new parent company
 */
export async function createCompany(data: CompanyCreate): Promise<Company> {
  const response = await api.post<Company>('/companies', data);
  return response.data;
}

/**
 * Update an existing company
 */
export async function updateCompany(id: string, data: CompanyUpdate): Promise<Company> {
  const response = await api.put<Company>(`/companies/${id}`, data);
  return response.data;
}

/**
 * Delete a company
 */
export async function deleteCompany(id: string): Promise<void> {
  await api.delete(`/companies/${id}`);
}

/**
 * List subsidiaries of a company
 */
export async function listSubsidiaries(
  companyId: string,
  params?: QueryParams
): Promise<PaginatedResponse<Company>> {
  const response = await api.get<PaginatedResponse<Company>>(
    `/companies/${companyId}/sub-companies`,
    { params }
  );
  return response.data;
}

/**
 * Create a subsidiary under a parent company
 */
export async function createSubsidiary(
  parentId: string,
  data: SubsidiaryCreate
): Promise<Company> {
  const response = await api.post<Company>(`/companies/${parentId}/sub-companies`, data);
  return response.data;
}

/**
 * List users in a company
 */
export async function listCompanyUsers(
  companyId: string,
  params?: QueryParams
): Promise<PaginatedResponse<{ id: string; email: string; first_name: string | null; last_name: string | null }>> {
  const response = await api.get(`/companies/${companyId}/users`, { params });
  return response.data;
}

/**
 * Add a user to a company
 */
export async function addUserToCompany(
  companyId: string,
  userId: string,
  isPrimary?: boolean
): Promise<void> {
  await api.post(`/companies/${companyId}/users`, {
    user_id: userId,
    is_primary: isPrimary,
  });
}

/**
 * Remove a user from a company
 */
export async function removeUserFromCompany(companyId: string, userId: string): Promise<void> {
  await api.delete(`/companies/${companyId}/users/${userId}`);
}
