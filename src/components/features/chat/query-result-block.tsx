'use client';

import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChevronDown, ChevronRight, Clock, Table2, Copy, Check, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatColumnHeader } from '@/lib/format-column';
import { tryFormatQueryDate } from '@/lib/format-date';
import type { MessageContentBlock } from '@/types/chat';

type QueryResult = NonNullable<MessageContentBlock['query_result']>;

type ChartConfig = {
  chart_type?: string;
  x_axis?: string;
  y_axis?: string;
  label_column?: string;
  value_column?: string;
  title?: string;
};

const GRID_STROKE = 'var(--color-surface-300)';
const AXIS_FILL = 'rgba(235, 234, 229, 0.65)';
const ACCENT = 'var(--color-accent)';
const PIE_PALETTE = [
  'var(--color-chart-1)',
  'var(--color-chart-5)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
];

const TOOLTIP_CONTENT_STYLE = {
  background: 'var(--color-surface-200)',
  border: '1px solid rgba(235, 234, 229, 0.1)',
  borderRadius: '6px',
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
} as const;

const TOOLTIP_LABEL_STYLE = { color: 'var(--color-foreground)' } as const;
const TOOLTIP_ITEM_STYLE = { color: ACCENT } as const;

type ChartRow = Record<string, unknown>;

function toChartRows(rows: Record<string, unknown>[], columns: string[]): ChartRow[] {
  return rows.map((row) => {
    const out: ChartRow = {};
    for (const col of columns) {
      out[col] = row[col];
    }
    return out;
  });
}

function parseChartConfig(raw: Record<string, unknown> | undefined): ChartConfig | null {
  if (!raw) return null;
  const type = raw.chart_type ?? raw.type;
  if (typeof type !== 'string') return null;
  return raw as ChartConfig;
}

function InlineChart({ qr }: { qr: QueryResult }) {
  const cfg = parseChartConfig(qr.chart_config);
  if (!cfg?.chart_type) return null;

  const data = toChartRows(qr.rows, qr.columns).slice(0, 50);
  if (data.length === 0) return null;

  if (cfg.chart_type === 'bar') {
    const xKey = cfg.x_axis;
    const yKey = cfg.y_axis;
    if (!xKey || !yKey || !(xKey in data[0]) || !(yKey in data[0])) return null;

    return (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={xKey}
            stroke={GRID_STROKE}
            tick={{ fill: AXIS_FILL, fontSize: 10, fontFamily: 'monospace' }}
            tickLine={false}
          />
          <YAxis
            stroke={GRID_STROKE}
            tick={{ fill: AXIS_FILL, fontSize: 10, fontFamily: 'monospace' }}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(62, 207, 142, 0.06)' }}
            contentStyle={TOOLTIP_CONTENT_STYLE}
            labelStyle={TOOLTIP_LABEL_STYLE}
            itemStyle={TOOLTIP_ITEM_STYLE}
          />
          <Bar dataKey={yKey} fill={ACCENT} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (cfg.chart_type === 'line') {
    const xKey = cfg.x_axis;
    const yKey = cfg.y_axis;
    if (!xKey || !yKey || !(xKey in data[0]) || !(yKey in data[0])) return null;

    return (
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={xKey}
            stroke={GRID_STROKE}
            tick={{ fill: AXIS_FILL, fontSize: 10, fontFamily: 'monospace' }}
            tickLine={false}
          />
          <YAxis
            stroke={GRID_STROKE}
            tick={{ fill: AXIS_FILL, fontSize: 10, fontFamily: 'monospace' }}
            tickLine={false}
          />
          <Tooltip
            cursor={{ stroke: ACCENT, strokeOpacity: 0.15 }}
            contentStyle={TOOLTIP_CONTENT_STYLE}
            labelStyle={TOOLTIP_LABEL_STYLE}
            itemStyle={TOOLTIP_ITEM_STYLE}
          />
          <Line
            type="monotone"
            dataKey={yKey}
            stroke={ACCENT}
            strokeWidth={2}
            dot={{ fill: ACCENT, r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (cfg.chart_type === 'pie') {
    const nameKey = cfg.label_column;
    const dataKey = cfg.value_column;
    if (!nameKey || !dataKey || !(nameKey in data[0]) || !(dataKey in data[0])) return null;

    return (
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Tooltip
            contentStyle={TOOLTIP_CONTENT_STYLE}
            labelStyle={TOOLTIP_LABEL_STYLE}
            itemStyle={TOOLTIP_ITEM_STYLE}
          />
          <Legend
            wrapperStyle={{ fontFamily: 'monospace', fontSize: '10px', color: AXIS_FILL }}
          />
          <Pie
            data={data}
            nameKey={nameKey}
            dataKey={dataKey}
            outerRadius={90}
            stroke="var(--color-background)"
            strokeWidth={2}
          >
            {data.map((_, i) => (
              <Cell key={`cell-${i}`} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return null;
}

interface QueryResultBlockProps {
  qr: QueryResult;
}

export function QueryResultBlock({ qr }: QueryResultBlockProps) {
  const [sqlOpen, setSqlOpen] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [showChart, setShowChart] = useState(true);

  // Pagination & Sorting State
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const PAGE_SIZE = 10;
  const hasChart = !!parseChartConfig(qr.chart_config);

  // Sorting Logic
  const sortedRows = [...qr.rows].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    const aVal = a[key];
    const bVal = b[key];

    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    const result = aVal < bVal ? -1 : 1;
    return direction === 'asc' ? result : -result;
  });

  // Pagination Logic
  const totalPages = Math.ceil(qr.row_count / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const displayRows = sortedRows.slice(startIndex, startIndex + PAGE_SIZE);

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        return null;
      }
      return { key, direction: 'asc' };
    });
    setCurrentPage(1); // Reset to first page on sort
  };

  // Detect numeric columns from the first row so we can apply mono +
  // right-alignment selectively. Text columns render in font-sans.
  const numericColumns = new Set<string>();
  if (qr.rows.length > 0) {
    const first = qr.rows[0];
    for (const col of qr.columns) {
      const v = first[col];
      if (typeof v === 'number') {
        numericColumns.add(col);
      } else if (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v))) {
        numericColumns.add(col);
      }
    }
  }

  const handleCopySql = () => {
    if (!qr.sql) return;
    void navigator.clipboard.writeText(qr.sql);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 1500);
  };

  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-border animate-fade-in">
      {/* Header bar */}
      <div className="flex items-center gap-3 border-b border-border px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Table2 className="h-3.5 w-3.5 text-muted" strokeWidth={1.5} />
          <span className="font-mono text-mono-sm text-fg-subtle">
            {qr.row_count.toLocaleString()} rows
          </span>
        </div>

        {qr.execution_time_ms != null && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-fg-subtle" strokeWidth={1.5} />
            <span className="font-mono text-mono-sm tabular-nums text-fg-subtle">
              {(qr.execution_time_ms / 1000).toFixed(2)}s
            </span>
          </div>
        )}

        <div className="ml-auto flex items-center gap-1.5">
          {hasChart && (
            <>
              <button
                onClick={() => setShowChart((s) => !s)}
                className="flex items-center gap-1 font-mono text-mono-sm text-fg-subtle transition-colors hover:text-fg-muted focus-visible:outline-none"
                title={showChart ? 'Hide chart' : 'Show chart'}
              >
                <BarChart2 className="h-3 w-3" strokeWidth={2} />
              </button>
              <div className="h-3 w-px bg-border/60" />
            </>
          )}

          {qr.sql && (
            <>
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1 font-mono text-mono-sm text-subtle transition-colors hover:text-muted focus-visible:outline-none"
                title="Copy SQL"
              >
                {sqlCopied ? (
                  <Check className="h-3 w-3 text-accent" strokeWidth={2.5} />
                ) : (
                  <Copy className="h-3 w-3" strokeWidth={2} />
                )}
              </button>
              <div className="h-3 w-px bg-border/60" />
              <button
                onClick={() => setSqlOpen((o) => !o)}
                className="flex items-center gap-1 font-mono text-mono-sm text-fg-subtle transition-colors hover:text-fg-muted focus-visible:outline-none"
              >
                {sqlOpen ? (
                  <ChevronDown className="h-3 w-3" strokeWidth={2} />
                ) : (
                  <ChevronRight className="h-3 w-3" strokeWidth={2} />
                )}
                SQL
                {qr.confidence != null && (
                  <span className="ml-0.5 opacity-45">
                    {Math.round(qr.confidence * 100)}%
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* SQL panel */}
      {sqlOpen && qr.sql && (
        <div className="border-b border-border animate-fade-in">
          <pre className="overflow-x-auto bg-[var(--color-code-canvas)] px-4 py-3 font-mono text-mono leading-relaxed text-foreground">
            {qr.sql}
          </pre>
          {qr.explanation && (
            <p className="border-t border-border/40 px-4 py-2 font-sans text-mono-sm italic text-fg-muted">
              {qr.explanation}
            </p>
          )}
        </div>
      )}

      {/* Inline chart */}
      {hasChart && showChart && (
        <div className="border-b border-border bg-background/40 px-4 py-4 animate-fade-in">
          <InlineChart qr={qr} />
        </div>
      )}

      {/* Data table */}
      <div className="overflow-x-auto">
        <table
          className="w-full"
          aria-label={`Query result: ${qr.row_count} rows`}
        >
          <thead>
            <tr className="border-b border-border bg-surface-300/50">
              {qr.columns.map((col) => {
                const isNumeric = numericColumns.has(col);
                const isSorted = sortConfig?.key === col;
                return (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className={cn(
                      'cursor-pointer select-none px-3 py-1.5 font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-strong/90 transition-colors hover:bg-surface-400 hover:text-foreground whitespace-nowrap',
                      isNumeric ? 'text-right' : 'text-left',
                    )}
                  >
                    <div className={cn('flex items-center gap-1', isNumeric && 'justify-end')}>
                      {formatColumnHeader(col)}
                      {isSorted && (
                        <ChevronDown 
                          className={cn(
                            "h-2.5 w-2.5 text-accent transition-transform",
                            sortConfig.direction === 'desc' && "rotate-180"
                          )} 
                          strokeWidth={3}
                        />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, i) => (
              <tr
                key={i}
                className={cn(
                  'border-b border-border/35 last:border-0 transition-colors hover:bg-surface-300/20',
                  i % 2 !== 0 && 'bg-surface-200/20',
                )}
              >
                {qr.columns.map((col) => {
                  const val = row[col];
                  const isNull = val === null || val === undefined;
                  const isNumeric = numericColumns.has(col);
                  return (
                    <td
                      key={col}
                      className={cn(
                        'px-3 py-2 text-mono',
                        isNumeric
                          ? 'text-right font-mono tabular-nums'
                          : 'text-left font-sans',
                      )}
                    >
                      {isNull ? (
                        <span className="italic text-fg-subtle">null</span>
                      ) : (() => {
                        const formatted = tryFormatQueryDate(val);
                        return formatted ? (
                          <span className="text-foreground font-mono tabular-nums">{formatted}</span>
                        ) : (
                          <span className="text-foreground">{String(val)}</span>
                        );
                      })()}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/35 bg-surface-200/40 px-4 py-2">
            <span className="font-mono text-mono-sm text-fg-subtle">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 rounded-md px-2 py-1 font-mono text-mono-sm text-fg-subtle transition-colors hover:text-foreground disabled:opacity-30 disabled:hover:text-fg-subtle"
              >
                <ChevronRight className="h-3 w-3 rotate-180" />
                Prev
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 rounded-md px-2 py-1 font-mono text-mono-sm text-fg-subtle transition-colors hover:text-foreground disabled:opacity-30 disabled:hover:text-fg-subtle"
              >
                Next
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
