'use client';

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
import type { GeneratedReportSection } from '@/types/report';

const MAX_ROWS = 50;

const GRID_STROKE = '#2a2825';
const AXIS_FILL = '#8b8680';
const ACCENT = '#3ecf8e';

const PIE_PALETTE = ['#3ecf8e', '#2a9d6b', '#1f7550', '#164f36', '#0d2e1f'];

const TOOLTIP_CONTENT_STYLE = {
  background: '#21201c',
  border: '1px solid #2a2825',
  borderRadius: '6px',
  fontFamily: 'monospace',
  fontSize: '12px',
} as const;

const TOOLTIP_LABEL_STYLE = { color: '#e8e4df' } as const;
const TOOLTIP_ITEM_STYLE = { color: ACCENT } as const;

type ChartRow = Record<string, unknown>;

interface SectionChartProps {
  section: GeneratedReportSection;
}

function normalizeRows(
  rows: readonly unknown[],
  columns: readonly string[],
): ChartRow[] {
  return rows.map((row) => {
    if (Array.isArray(row)) {
      return Object.fromEntries(
        columns.map((col, i) => [col, (row as unknown[])[i]]),
      );
    }
    return row as ChartRow;
  });
}

export function SectionChart({ section }: SectionChartProps) {
  const recommendation = section.chart_recommendation;
  const queryResult = section.query_result;

  if (!recommendation || !queryResult || queryResult.row_count === 0) {
    return null;
  }

  const chartData = normalizeRows(
    queryResult.rows as unknown[],
    queryResult.columns,
  ).slice(0, MAX_ROWS);

  if (chartData.length === 0) {
    return null;
  }

  const chartType = recommendation.chart_type;

  if (chartType === 'bar') {
    const xKey = recommendation.x_axis;
    const yKey = recommendation.y_axis;

    if (!xKey || !yKey) return null;
    if (!(xKey in chartData[0]) || !(yKey in chartData[0])) return null;

    return (
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={xKey}
            stroke={GRID_STROKE}
            tick={{ fill: AXIS_FILL, fontSize: 11, fontFamily: 'monospace' }}
            tickLine={false}
          />
          <YAxis
            stroke={GRID_STROKE}
            tick={{ fill: AXIS_FILL, fontSize: 11, fontFamily: 'monospace' }}
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

  if (chartType === 'line') {
    const xKey = recommendation.x_axis;
    const yKey = recommendation.y_axis;

    if (!xKey || !yKey) return null;
    if (!(xKey in chartData[0]) || !(yKey in chartData[0])) return null;

    return (
      <ResponsiveContainer width="100%" height={280}>
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={xKey}
            stroke={GRID_STROKE}
            tick={{ fill: AXIS_FILL, fontSize: 11, fontFamily: 'monospace' }}
            tickLine={false}
          />
          <YAxis
            stroke={GRID_STROKE}
            tick={{ fill: AXIS_FILL, fontSize: 11, fontFamily: 'monospace' }}
            tickLine={false}
          />
          <Tooltip
            cursor={{ stroke: ACCENT, strokeOpacity: 0.2 }}
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

  if (chartType === 'pie') {
    const nameKey = recommendation.label_column;
    const dataKey = recommendation.value_column;

    if (!nameKey || !dataKey) return null;
    if (!(nameKey in chartData[0]) || !(dataKey in chartData[0])) return null;

    return (
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Tooltip
            contentStyle={TOOLTIP_CONTENT_STYLE}
            labelStyle={TOOLTIP_LABEL_STYLE}
            itemStyle={TOOLTIP_ITEM_STYLE}
          />
          <Legend
            wrapperStyle={{
              fontFamily: 'monospace',
              fontSize: '11px',
              color: AXIS_FILL,
            }}
          />
          <Pie
            data={chartData}
            nameKey={nameKey}
            dataKey={dataKey}
            outerRadius={100}
            stroke="#1a1916"
            strokeWidth={2}
          >
            {chartData.map((_, i) => (
              <Cell
                key={`cell-${i}`}
                fill={PIE_PALETTE[i % PIE_PALETTE.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return null;
}
