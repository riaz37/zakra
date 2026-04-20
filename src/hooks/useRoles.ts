import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as rolesApi from '../api/roles';
import type { RoleCreate, RoleUpdate, SetRolePermissions, QueryParams } from '../types';

const QUERY_KEY = 'roles';

/**
 * Hook for fetching paginated list of roles
 */
export function useRoles(params?: QueryParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => rolesApi.listRoles(params),
  });
}

/**
 * Hook for fetching a single role
 */
export function useRole(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => rolesApi.getRole(id!),
    enabled: !!id,
  });
}

/**
 * Hook for fetching role permissions
 */
export function useRolePermissions(roleId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, roleId, 'permissions'],
    queryFn: () => rolesApi.getRolePermissions(roleId!),
    enabled: !!roleId,
  });
}

/**
 * Hook for fetching all available permissions
 */
export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: () => rolesApi.listPermissions(),
  });
}

/**
 * Hook for creating a role
 */
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RoleCreate) => rolesApi.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Hook for updating a role
 */
export function useUpdateRole(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RoleUpdate) => rolesApi.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Hook for deleting a role
 */
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rolesApi.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Hook for setting role permissions
 */
export function useSetRolePermissions(roleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SetRolePermissions) => rolesApi.setRolePermissions(roleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, roleId, 'permissions'] });
    },
  });
}
