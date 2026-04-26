/**
 * Constants for the company hierarchy graph view.
 *
 * The status colours mirror `--color-accent`, `--color-warning`, and
 * `--color-error` from `globals.css`. Duplication here is intentional —
 * dagre needs concrete numeric inputs and React Flow style props expect
 * raw colour strings; we cannot pass CSS custom-property tokens directly
 * to either library.
 */

export const NODE_WIDTH = 220;
export const NODE_HEIGHT = 96;

export const STATUS_COLORS = {
  active: '#3ecf8e',
  inactive: '#d99a45',
  suspended: '#e8476a',
} as const;

export type StatusColorKey = keyof typeof STATUS_COLORS;

export const LAYOUT_CONFIG = {
  rankdir: 'TB',
  nodesep: 48,
  ranksep: 80,
} as const;

export type LayoutConfig = typeof LAYOUT_CONFIG;

export const NODE_TYPE = 'companyNode' as const;
export const EDGE_TYPE = 'smoothstep' as const;
