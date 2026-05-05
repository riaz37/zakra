import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as dbApi from '../api/db-connections';
import type {
  DatabaseConnectionCreate,
  DatabaseConnectionUpdate,
  QueryParams,
} from '../types';

const QUERY_KEY = 'db-connections';

/**
 * Hook for fetching paginated list of database connections
 */
export function useDbConnections(params?: QueryParams & { company_id?: string }) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => dbApi.listConnections(params),
    enabled: !!params?.company_id, // Only fetch when company_id is provided
  });
}

/**
 * Hook for fetching a single database connection
 */
export function useDbConnection(id: string | undefined, companyId?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id, companyId],
    queryFn: () => dbApi.getConnection(id!, companyId),
    enabled: !!id,
  });
}

/**
 * Hook for fetching connection schema
 */
export function useConnectionSchema(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id, 'schema'],
    queryFn: () => dbApi.getConnectionSchema(id!),
    enabled: !!id,
  });
}

/**
 * Hook for fetching schema learning progress
 */
export function useSchemaProgress(id: string | undefined, polling: boolean = false) {
  const query = useQuery({
    queryKey: [QUERY_KEY, id, 'progress'],
    queryFn: () => dbApi.getSchemaProgress(id!),
    enabled: !!id,
    refetchInterval: polling ? 2000 : false,
    retry: false,
  });
  return query;
}

/**
 * Hook for creating a database connection
 */
export function useCreateConnection(companyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DatabaseConnectionCreate) => dbApi.createConnection(data, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Hook for updating a database connection
 */
export function useUpdateConnection(id: string, companyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DatabaseConnectionUpdate) => dbApi.updateConnection(id, data, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Hook for deleting a database connection
 */
export function useDeleteConnection(companyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dbApi.deleteConnection(id, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Hook for setting a connection as the default
 */
export function useSetDefaultConnection(companyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dbApi.setDefaultConnection(id, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Hook for testing a database connection
 */
export function useTestConnection(companyId?: string) {
  return useMutation({
    mutationFn: (id: string) => dbApi.testConnection(id, companyId),
  });
}

/**
 * Hook for discovering tables (lightweight, no AI) — mutation for on-demand use
 */
export function useDiscoverTables(id?: string, companyId?: string) {
  return useMutation({
    mutationFn: () => dbApi.discoverTables(id!, companyId),
  });
}

/**
 * Hook for discovering tables as a query (auto-fetches when id is provided)
 */
export function useDiscoverTablesQuery(id?: string, companyId?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id, 'discover-tables', companyId],
    queryFn: () => dbApi.discoverTables(id!, companyId),
    enabled: !!id,
  });
}

/**
 * Hook for starting schema learning
 */
export function useLearnSchema(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tableNames?: string[]) => dbApi.learnSchema(id, tableNames),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

/**
 * Hook for unlearning specific tables
 */
export function useUnlearnTables(id: string, companyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tableNames: string[]) => dbApi.unlearnTables(id, tableNames, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Hook for resuming AI sync on pending/failed tables
 */
export function useResumeAiSync(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => dbApi.resumeAiSync(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id, 'progress'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}
