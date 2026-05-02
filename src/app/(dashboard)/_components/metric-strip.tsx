'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/shared/skeleton';
import { staggerContainer, staggerItem, MOTION } from '@/lib/motion';
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
  const reduced = useReducedMotion();

  return (
    <motion.dl
      className="grid grid-cols-1 overflow-hidden rounded-lg border border-border bg-surface-200 sm:grid-cols-2 lg:grid-cols-4"
      variants={staggerContainer}
      initial={reduced ? 'visible' : 'hidden'}
      animate="visible"
    >
      {METRICS.map(({ key, label }, i) => (
        <motion.div
          key={key}
          variants={staggerItem}
          className={cn(
            'flex flex-col gap-1.5 px-5 py-4',
            // Mobile: border bottom on all but last
            i < METRICS.length - 1 && 'border-b border-border',
            // SM (2 cols): remove border-b on 3rd/4th, add border-l on even items
            'sm:even:border-l sm:even:border-border sm:odd:border-r-0', 
            i >= 2 && 'sm:border-b-0',
            // LG (4 cols): reset borders to handle horizontal row
            'lg:border-b-0 lg:border-r lg:border-border lg:last:border-r-0',
          )}
        >
          <dt className="font-sans text-micro font-medium uppercase tracking-[0.08em] text-fg-muted">
            {label}
          </dt>
          <dd className="font-sans text-display font-semibold leading-none text-foreground font-feat-tnum tabular-nums">
            {isLoading ? <Skeleton className="h-7 w-16" /> : (metrics[key] ?? 0)}
          </dd>
        </motion.div>
      ))}
    </motion.dl>
  );
}
