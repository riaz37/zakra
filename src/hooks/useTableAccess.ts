import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as tableAccessApi from '../api/table-access';
import type {
  RegisterTableRequest,
  GrantColumnPermission,
  BulkGrantPermissions,
  TablePermissionsResponse,
  QueryParams,
} from '../types';
import type { ColumnPermissionRow } from '@/components/shared/permission-matrix';

const QUERY_KEY = 'table-access';

/**
 * Hook for fetching paginated list of managed tables
 */
export function useManagedTables(params?: QueryParams & { company_id?: string }) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => tableAccessApi.listManagedTables(params),
    enabled: params !== undefined,
  });
}

/**
 * Hook for fetching a single managed table by name
 */
export function useManagedTable(tableName: string | undefined, schemaName = 'public') {
  return useQuery({
    queryKey: [QUERY_KEY, tableName, schemaName],
    queryFn: () => tableAccessApi.getManagedTable(tableName!, schemaName),
    enabled: !!tableName,
  });
}

/**
 * Hook for fetching table permissions
 */
export function useTablePermissions(
  tableName: string | undefined,
  schemaName = 'public',
  granteeId?: string,
) {
  return useQuery<TablePermissionsResponse>({
    queryKey: [QUERY_KEY, tableName, schemaName, 'permissions', granteeId],
    queryFn: () => tableAccessApi.getTablePermissions(tableName!, schemaName, granteeId),
    enabled: !!tableName,
  });
}

/**
 * Hook for fetching user table permissions (all tables)
 */
export function useUserTablePermissions(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-permissions', userId],
    queryFn: () => tableAccessApi.getUserTablePermissions(userId!),
    enabled: !!userId,
  });
}

/**
 * Hook for fetching a specific user's column permissions for a specific table
 */
export function useUserTableColumnPermissions(
  tableName: string | undefined,
  userId: string | undefined,
  schemaName = 'public',
  companyId?: string
) {
  return useQuery({
    queryKey: [QUERY_KEY, tableName, schemaName, 'user-permissions', userId],
    queryFn: () => tableAccessApi.getUserTableColumnPermissions(
      tableName!,
      userId!,
      schemaName,
      companyId
    ),
    enabled: !!tableName && !!userId,
  });
}

interface RegisterTableParams {
  data: RegisterTableRequest;
  companyId?: string;
}

/**
 * Hook for registering a table
 */
export function useRegisterTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, companyId }: RegisterTableParams) =>
      tableAccessApi.registerTable(data, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Hook for granting column permission
 */
export function useGrantPermission(tableName: string, schemaName = 'public', companyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GrantColumnPermission) =>
      tableAccessApi.grantColumnPermission(tableName, data, schemaName, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, tableName, schemaName, 'permissions'] });
    },
  });
}

/**
 * Hook for bulk granting permissions
 */
export function useBulkGrantPermissions(tableName: string, schemaName = 'public') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkGrantPermissions) =>
      tableAccessApi.bulkGrantPermissions(tableName, data, schemaName),
    onSettled: () => {
      // Invalidate both 'permissions' and 'user-permissions' to ensure the UI updates
      // even if the backend returns an error after saving.
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, tableName, schemaName, 'permissions'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, tableName, schemaName, 'user-permissions'] });
    },
  });
}

interface RevokePermissionParams {
  columnName: string;
  granteeType: 'user' | 'role';
  granteeId: string;
}

/**
 * Hook for revoking column permission
 */
export function useRevokePermission(tableName: string, schemaName = 'public') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ columnName, granteeType, granteeId }: RevokePermissionParams) =>
      tableAccessApi.revokeColumnPermission(tableName, columnName, granteeType, granteeId, schemaName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, tableName, schemaName, 'permissions'] });
    },
  });
}

/**
 * Hook for saving column permissions for a user by issuing individual grants.
 * Uses the single-grant endpoint which supports mask_pattern; avoids the broken bulk endpoint.
 */
export function useSaveColumnPermissions(
  tableName: string,
  schemaName = 'public',
  companyId?: string,
) {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  async function saveAsync({ userId, rows }: { userId: string; rows: ColumnPermissionRow[] }): Promise<void> {
    setIsPending(true);
    try {
      await Promise.all(
        rows.map((row) =>
          tableAccessApi.grantColumnPermission(
            tableName,
            {
              column_name: row.columnName,
              grantee_type: 'user',
              grantee_id: userId,
              permission: row.permission,
              ...(row.permission === 'read_masked' && row.maskPattern
                ? { mask_pattern: row.maskPattern }
                : {}),
            },
            schemaName,
            companyId,
          ),
        ),
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY, tableName, schemaName, 'user-permissions'] }),
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY, tableName, schemaName, 'permissions'] }),
      ]);
    } finally {
      setIsPending(false);
    }
  }

  return { saveAsync, isPending };
}
