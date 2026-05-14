import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as usersApi from '../api/users';
import type { ListUser, UserCreate, UserUpdate, AssignRolesRequest, QueryParams } from '../types';

export type { ListUser };

const QUERY_KEY = 'users';

export function useUsers(params?: QueryParams & { company_id?: string }) {
  const { search, page = 1, page_size = 10, ...rest } = params ?? {};

  // Backend does not support search — fetch all and filter client-side
  const fetchParams = { sort_by: 'created_at', sort_order: 'desc' as const, page: 1, page_size: 1000, ...rest };

  return useQuery({
    queryKey: [QUERY_KEY, rest, search ?? '', page, page_size],
    queryFn: async () => {
      const all = await usersApi.listUsers(fetchParams);
      const term = search?.trim().toLowerCase();
      const filtered = term
        ? all.items.filter((u) =>
            u.email.toLowerCase().includes(term) ||
            (u.first_name ?? '').toLowerCase().includes(term) ||
            (u.last_name ?? '').toLowerCase().includes(term)
          )
        : all.items;

      const total = filtered.length;
      const total_pages = Math.max(1, Math.ceil(total / page_size));
      const skip = (page - 1) * page_size;
      const items = filtered.slice(skip, skip + page_size);

      return { ...all, items, total, total_pages };
    },
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
