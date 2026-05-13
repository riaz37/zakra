'use client';

import { Cell, Pie, PieChart } from 'recharts';
import { useTranslations } from 'next-intl';
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

export function StatusDistributionChart({ data, isLoading }: StatusDistributionChartProps) {
  const t = useTranslations('dashboard.overview.statusChart');

  const chartConfig = {
    count: { label: t('reportsLabel') },
    completed: { label: t('completed'), color: 'hsl(var(--chart-1))' },
    failed:    { label: t('failed'),    color: 'var(--color-error)'   },
    running:   { label: t('running'),   color: 'hsl(var(--chart-3))' },
    pending:   { label: t('pending'),   color: 'hsl(var(--chart-4))' },
  } satisfies ChartConfig;

  if (isLoading) {
    return (
      <Card className="flex flex-col h-full">
        <CardHeader className="items-center pb-0">
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0 flex items-center justify-center min-h-[250px]">
          <Skeleton className="size-48" rounded="full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="flex flex-col h-full">
        <CardHeader className="items-center pb-0">
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('noReports')}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0 flex items-center justify-center">
          <p className="text-caption text-muted">{t('noDataHint')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
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
