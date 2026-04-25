'use client';

import { Cell, Pie, PieChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/shared/skeleton';
import { StatusDataPoint } from '@/hooks/useDashboardData';

interface StatusDistributionChartProps {
  data: StatusDataPoint[];
  isLoading: boolean;
}

const chartConfig = {
  count: {
    label: 'Reports',
  },
  completed: {
    label: 'Completed',
    color: 'hsl(var(--chart-1))',
  },
  failed: {
    label: 'Failed',
    color: 'var(--color-error)',
  },
  running: {
    label: 'Running',
    color: 'hsl(var(--chart-3))',
  },
  pending: {
    label: 'Pending',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig;

export function StatusDistributionChart({ data, isLoading }: StatusDistributionChartProps) {
  if (isLoading) {
    return <Skeleton className="h-[350px] w-full" />;
  }

  if (!data || data.length === 0) {
    return (
      <Card className="flex flex-col h-full">
        <CardHeader className="items-center pb-0">
          <CardTitle>Report Status</CardTitle>
          <CardDescription>No reports generated yet</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0 flex items-center justify-center">
          <p className="text-caption text-muted">Status breakdown will appear here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Report Status</CardTitle>
        <CardDescription>Breakdown by generation state</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] pb-0 mt-4"
        >
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`var(--color-${entry.status})`} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
