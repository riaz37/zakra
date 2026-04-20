import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as usersApi from '../api/users';
import type { UserCreate, UserUpdate, AssignRolesRequest, QueryParams } from '../types';

const QUERY_KEY = 'users';

/**
 * Hook for fetching paginated list of users
 * @param params - Query params including optional company_id filter
 */
export function useUsers(params?: QueryParams & { company_id?: string }) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => usersApi.listUsers(params),
  });
}

/**
 * Hook for fetching a single user with details
 */
export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => usersApi.getUser(id!),
    enabled: !!id,
  });
}

/**
 * Hook for fetching user roles
 */
export function useUserRoles(userId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, userId, 'roles'],
    queryFn: () => usersApi.getUserRoles(userId!),
    enabled: !!userId,
  });
}

/**
 * Hook for creating a user
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserCreate) => usersApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Hook for updating a user
 */
export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserUpdate) => usersApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Hook for deleting a user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Hook for assigning roles to a user
 */
export function useAssignUserRoles(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignRolesRequest) => usersApi.assignUserRoles(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, userId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, userId, 'roles'] });
    },
  });
}
