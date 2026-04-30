import { useQuery } from "@tanstack/react-query";
import {
  listReportGenerations,
  getReportGeneration,
} from "../api/reports";

const QUERY_KEY = "report-generations";

export function useReportGenerations(companyId?: string, skip = 0, limit = 20) {
  return useQuery({
    queryKey: [QUERY_KEY, companyId, skip, limit],
    queryFn: () => listReportGenerations(companyId, skip, limit),
    staleTime: 30_000,
  });
}

interface UseReportGenerationDetailOptions {
  refetchInterval?: number | false;
}

export function useReportGenerationDetail(
  generationId: string | undefined,
  companyId?: string,
  options?: UseReportGenerationDetailOptions,
) {
  return useQuery({
    queryKey: [QUERY_KEY, generationId, companyId],
    queryFn: () => getReportGeneration(generationId!, companyId),
    enabled: !!generationId,
    refetchInterval: options?.refetchInterval ?? false,
  });
}
