'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
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
import { ActivityDataPoint } from '@/hooks/useDashboardData';

interface ActivityChartProps {
  data: ActivityDataPoint[];
  isLoading: boolean;
}

const chartConfig = {
  reports: {
    label: 'Reports',
    color: 'hsl(var(--chart-1))',
  },
  chats: {
    label: 'Chats',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function ActivityChart({ data, isLoading }: ActivityChartProps) {
  if (isLoading) {
    return <Skeleton className="h-[350px] w-full" />;
  }

  // Only show the chart if we have at least one data point
  if (!data || data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Activity (Last 14 Days)</CardTitle>
          <CardDescription>No activity data available.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Waiting for your first action</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Activity (Last 14 Days)</CardTitle>
        <CardDescription>
          Daily volume of chat sessions and report generations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillReports" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-reports)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-reports)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillChats" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-chats)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-chats)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="formattedDate"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="reports"
              stroke="var(--color-reports)"
              fillOpacity={1}
              fill="url(#fillReports)"
            />
            <Area
              type="monotone"
              dataKey="chats"
              stroke="var(--color-chats)"
              fillOpacity={1}
              fill="url(#fillChats)"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
