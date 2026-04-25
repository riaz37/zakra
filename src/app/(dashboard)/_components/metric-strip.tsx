'use client';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/shared/skeleton';
import type { DashboardMetrics as DashboardMetricsType } from '@/hooks/useDashboardData';

const METRICS: { key: keyof DashboardMetricsType; label: string }[] = [
  { key: 'totalUsers',        label: 'Total Users'       },
  { key: 'totalConnections',  label: 'Connections'        },
  { key: 'totalReports',      label: 'Reports Generated'  },
  { key: 'totalChatSessions', label: 'Chat Sessions'      },
];

export function MetricStrip({
  metrics,
  isLoading,
}: {
  metrics: DashboardMetricsType;
  isLoading: boolean;
}) {
  return (
    <dl className="grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-surface-200 md:grid-cols-4">
      {METRICS.map(({ key, label }, i) => (
        <div
          key={key}
          className={cn(
            'flex flex-col gap-1.5 px-5 py-4',
            i < 2 && 'border-b border-border md:border-b-0',
            i % 2 === 0 && 'border-r border-border',
            i < METRICS.length - 1 && 'md:border-r md:border-border',
          )}
        >
          <dt className="font-sans text-caption font-medium uppercase tracking-[0.08em] text-muted">
            {label}
          </dt>
          <dd className="font-sans text-[28px] font-semibold leading-none text-foreground font-feat-tnum tabular-nums">
            {isLoading ? <Skeleton className="h-7 w-16" /> : (metrics[key] ?? 0)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
