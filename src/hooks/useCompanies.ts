import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as companiesApi from '../api/companies';
import type { CompanyCreate, CompanyUpdate, SubsidiaryCreate, QueryParams } from '../types';

const QUERY_KEY = 'companies';

/**
 * Hook for fetching paginated list of companies
 */
export function useCompanies(params?: QueryParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => companiesApi.listCompanies(params),
  });
}

/**
 * Hook for fetching a single company
 */
export function useCompany(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => companiesApi.getCompany(id!),
    enabled: !!id,
  });
}

/**
 * Hook for fetching company subsidiaries
 */
export function useSubsidiaries(companyId: string | undefined, params?: QueryParams) {
  return useQuery({
    queryKey: [QUERY_KEY, companyId, 'subsidiaries', params],
    queryFn: () => companiesApi.listSubsidiaries(companyId!, params),
    enabled: !!companyId,
  });
}

/**
 * Hook for fetching company users
 */
export function useCompanyUsers(companyId: string | undefined, params?: QueryParams) {
  return useQuery({
    queryKey: [QUERY_KEY, companyId, 'users', params],
    queryFn: () => companiesApi.listCompanyUsers(companyId!, params),
    enabled: !!companyId,
  });
}

/**
 * Hook for creating a company
 */
export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CompanyCreate) => companiesApi.createCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Hook for creating a subsidiary
 */
export function useCreateSubsidiary(parentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubsidiaryCreate) => companiesApi.createSubsidiary(parentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Hook for updating a company
 */
export function useUpdateCompany(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CompanyUpdate) => companiesApi.updateCompany(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Hook for deleting a company
 */
export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => companiesApi.deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Hook for adding user to company
 */
export function useAddUserToCompany(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, isPrimary }: { userId: string; isPrimary?: boolean }) =>
      companiesApi.addUserToCompany(companyId, userId, isPrimary),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, companyId, 'users'] });
    },
  });
}

/**
 * Hook for removing user from company
 */
export function useRemoveUserFromCompany(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => companiesApi.removeUserFromCompany(companyId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, companyId, 'users'] });
    },
  });
}
