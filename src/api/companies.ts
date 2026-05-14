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
  const { page = 1, page_size = 10, ...rest } = params ?? {};
  const skip = (page - 1) * page_size;
  const response = await api.get<PaginatedResponse<Company>>('/companies', {
    params: { skip, limit: page_size, ...rest },
  });
  const data = response.data;
  return { ...data, total_pages: Math.ceil(data.total / page_size) };
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
  const { page = 1, page_size = 10, ...rest } = params ?? {};
  const skip = (page - 1) * page_size;
  const response = await api.get<PaginatedResponse<Company>>(
    `/companies/${companyId}/sub-companies`,
    { params: { skip, limit: page_size, ...rest } }
  );
  const data = response.data;
  return { ...data, total_pages: Math.ceil(data.total / page_size) };
}

/**
 * Create a subsidiary under a parent company
 */
export async function createSubsidiary(
  parentId: string,
  data: SubsidiaryCreate | CompanyCreate
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
  const { page = 1, page_size = 10, ...rest } = params ?? {};
  const skip = (page - 1) * page_size;
  const response = await api.get(`/companies/${companyId}/users`, {
    params: { skip, limit: page_size, ...rest },
  });
  const data = response.data;
  return { ...data, total_pages: Math.ceil(data.total / page_size) };
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
