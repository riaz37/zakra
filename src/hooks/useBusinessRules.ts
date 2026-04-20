import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as dbApi from '../api/db-connections';
import type { BusinessRuleCreate, BusinessRuleUpdate } from '../types';

const QUERY_KEY = 'business-rules';

/**
 * Hook for fetching business rules for a connection
 */
export function useBusinessRules(connectionId: string | undefined, scopeType?: string, companyId?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, connectionId, scopeType, companyId],
    queryFn: () => dbApi.listBusinessRules(connectionId!, scopeType, companyId),
    enabled: !!connectionId,
  });
}

/**
 * Hook for creating a business rule
 */
export function useCreateBusinessRule(connectionId: string, companyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BusinessRuleCreate) => dbApi.createBusinessRule(connectionId, data, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, connectionId] });
    },
  });
}

/**
 * Hook for updating a business rule
 */
export function useUpdateBusinessRule(connectionId: string, companyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ruleId, data }: { ruleId: string; data: BusinessRuleUpdate }) =>
      dbApi.updateBusinessRule(ruleId, data, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, connectionId] });
    },
  });
}

/**
 * Hook for deleting a business rule
 */
export function useDeleteBusinessRule(connectionId: string, companyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ruleId: string) => dbApi.deleteBusinessRule(ruleId, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, connectionId] });
    },
  });
}
