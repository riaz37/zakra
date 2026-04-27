'use client';

import { useMemo } from 'react';

import { useCompanies } from './useCompanies';
import {
  applyDagreLayout,
  buildNodesAndEdges,
  computeSubsidiaryCounts,
  computeSummary,
  type CompanyFlowNode,
  type HierarchySummary,
} from '@/components/features/companies/company-hierarchy.utils';
import { LAYOUT_CONFIG } from '@/components/features/companies/company-hierarchy.constants';
import type { Edge } from '@xyflow/react';
import type { Company } from '@/types';

const EMPTY_SUMMARY: HierarchySummary = {
  total: 0,
  parents: 0,
  subsidiaries: 0,
  suspended: 0,
};

interface UseCompanyTreeResult {
  nodes: CompanyFlowNode[];
  edges: Edge[];
  summary: HierarchySummary;
  items: Company[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * Loads every company (page_size 1000) and produces a positioned React Flow
 * graph. The layout work is memoised on `items` — switching the highlight
 * filter on the page does not retrigger dagre.
 */
export function useCompanyTree(): UseCompanyTreeResult {
  const { data, isLoading, isError, refetch } = useCompanies({ page_size: 1000 });
  const items = useMemo(() => data?.items ?? [], [data?.items]);

  const { nodes, edges, summary } = useMemo(() => {
    if (!items.length) {
      return { nodes: [] as CompanyFlowNode[], edges: [] as Edge[], summary: EMPTY_SUMMARY };
    }

    const counts = computeSubsidiaryCounts(items);
    const { rawNodes, edges: builtEdges } = buildNodesAndEdges(items, counts);
    const positioned = applyDagreLayout(rawNodes, builtEdges, LAYOUT_CONFIG);
    const summarised = computeSummary(items);

    return { nodes: positioned, edges: builtEdges, summary: summarised };
  }, [items]);

  return {
    nodes,
    edges,
    summary,
    items,
    isLoading,
    isError,
    refetch: () => {
      refetch();
    },
  };
}
