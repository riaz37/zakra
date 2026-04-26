/**
 * Pure layout + summary helpers for the company hierarchy view.
 *
 * No React, no DOM, no side effects — every function returns new
 * objects/arrays so callers can rely on referential stability when
 * memoising. Anything that must mutate (the dagre graph) is built
 * inside the function and never escapes.
 */

import type { Edge, Node } from '@xyflow/react';
import dagre from '@dagrejs/dagre';

import type { Company } from '@/types';
import {
  EDGE_TYPE,
  NODE_HEIGHT,
  NODE_TYPE,
  NODE_WIDTH,
  type LayoutConfig,
} from './company-hierarchy.constants';

export interface CompanyNodeData extends Record<string, unknown> {
  company: Company;
  subsidiaryCount: number;
  isHighlighted: boolean;
}

export type CompanyFlowNode = Node<CompanyNodeData, typeof NODE_TYPE>;

export interface HierarchySummary {
  total: number;
  parents: number;
  subsidiaries: number;
  suspended: number;
}

/**
 * Group companies by their `parent_id` and return a Map keyed by parent id
 * with the count of children. Top-level companies (parent_id === null) are
 * not counted.
 */
export function computeSubsidiaryCounts(items: ReadonlyArray<Company>): Map<string, number> {
  const counts = new Map<string, number>();

  for (const item of items) {
    if (!item.parent_id) continue;
    counts.set(item.parent_id, (counts.get(item.parent_id) ?? 0) + 1);
  }

  return counts;
}

/**
 * Build React Flow nodes and edges from a flat company list.
 *
 * Orphan handling: if a company's `parent_id` does not resolve to any item
 * in `items`, that company is treated as a root (no incoming edge). This
 * keeps the canvas readable when the API returns subsidiaries whose parent
 * is filtered out elsewhere.
 *
 * Returns nodes with placeholder positions — callers must run them through
 * `applyDagreLayout` before passing to React Flow.
 */
export function buildNodesAndEdges(
  items: ReadonlyArray<Company>,
  counts: ReadonlyMap<string, number>,
): { rawNodes: CompanyFlowNode[]; edges: Edge[] } {
  const idSet = new Set(items.map((c) => c.id));

  const rawNodes: CompanyFlowNode[] = items.map((company) => ({
    id: company.id,
    type: NODE_TYPE,
    position: { x: 0, y: 0 },
    data: {
      company,
      subsidiaryCount: counts.get(company.id) ?? 0,
      isHighlighted: false,
    },
    draggable: false,
    connectable: false,
  }));

  const edges: Edge[] = items
    .filter((c) => c.parent_id && idSet.has(c.parent_id))
    .map((c) => ({
      id: `e-${c.parent_id}-${c.id}`,
      source: c.parent_id as string,
      target: c.id,
      type: EDGE_TYPE,
    }));

  return { rawNodes, edges };
}

/**
 * Run dagre layout and return new nodes positioned for React Flow.
 *
 * Dagre yields the *centre* coordinate of each node, but React Flow expects
 * the top-left corner. Without offsetting by half the node size, every node
 * appears shifted toward the top-left of its rank lane — visually obvious on
 * deeply nested trees.
 *
 * Parent nodes (those with at least one child) are taller than leaves to
 * accommodate the "↳ N subsidiaries" line.
 */
export function applyDagreLayout(
  rawNodes: ReadonlyArray<CompanyFlowNode>,
  edges: ReadonlyArray<Edge>,
  config: LayoutConfig,
): CompanyFlowNode[] {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: config.rankdir,
    nodesep: config.nodesep,
    ranksep: config.ranksep,
  });

  for (const node of rawNodes) {
    const isParent = node.data.subsidiaryCount > 0;
    graph.setNode(node.id, {
      width: NODE_WIDTH,
      height: isParent ? NODE_HEIGHT : NODE_HEIGHT - 16,
    });
  }

  for (const edge of edges) {
    graph.setEdge(edge.source, edge.target);
  }

  dagre.layout(graph);

  return rawNodes.map((node) => {
    const layoutNode = graph.node(node.id);
    const isParent = node.data.subsidiaryCount > 0;
    const height = isParent ? NODE_HEIGHT : NODE_HEIGHT - 16;

    return {
      ...node,
      position: {
        x: layoutNode.x - NODE_WIDTH / 2,
        y: layoutNode.y - height / 2,
      },
      width: NODE_WIDTH,
      height,
    };
  });
}

/**
 * Top-of-canvas summary numbers. `parents` counts companies that actually
 * have at least one subsidiary — *not* `company_type === 'parent'` — so the
 * displayed number reflects the visible tree, not a denormalised flag.
 */
export function computeSummary(items: ReadonlyArray<Company>): HierarchySummary {
  const parentIds = new Set<string>();
  let suspended = 0;

  for (const item of items) {
    if (item.parent_id) parentIds.add(item.parent_id);
    if (item.status === 'suspended') suspended += 1;
  }

  const parents = items.filter((c) => parentIds.has(c.id)).length;

  return {
    total: items.length,
    parents,
    subsidiaries: items.length - parents,
    suspended,
  };
}
