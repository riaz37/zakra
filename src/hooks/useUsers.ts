import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as usersApi from '../api/users';
import type { ListUser, UserCreate, UserUpdate, AssignRolesRequest, QueryParams } from '../types';

export type { ListUser };

const QUERY_KEY = 'users';

export function useUsers(params?: QueryParams & { company_id?: string }) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => usersApi.listUsers(params),
  });
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => usersApi.getUser(id!),
    enabled: !!id,
  });
}

export function useUserRoles(userId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, userId, 'roles'],
    queryFn: () => usersApi.getUserRoles(userId!),
    enabled: !!userId,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: UserCreate; companyId?: string }) =>
      usersApi.createUser(data),
    onSuccess: (_, { companyId }) => {
      queryClient.invalidateQueries({
        queryKey: companyId ? [QUERY_KEY, { company_id: companyId }] : [QUERY_KEY],
      });
    },
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: UserUpdate; companyId?: string }) =>
      usersApi.updateUser(id, data),
    onSuccess: (_, { companyId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
      queryClient.invalidateQueries({
        queryKey: companyId ? [QUERY_KEY, { company_id: companyId }] : [QUERY_KEY],
      });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; companyId?: string }) =>
      usersApi.deleteUser(id),
    onSuccess: (_, { companyId }) => {
      queryClient.invalidateQueries({
        queryKey: companyId ? [QUERY_KEY, { company_id: companyId }] : [QUERY_KEY],
      });
    },
  });
}

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
