'use client';

import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PipelineStep {
  id: string;
  label: string;
  type: 'thinking' | 'search' | 'query' | 'write' | 'complete' | 'error';
  status: 'pending' | 'active' | 'completed' | 'error';
  elapsed?: number; // ms
}

export interface AIPipelineTimelineProps {
  steps: PipelineStep[];
  className?: string;
}

const STEP_COLORS: Record<PipelineStep['type'], string> = {
  thinking: 'var(--color-thinking)',
  search: 'var(--color-grep)',
  query: 'var(--color-read)',
  write: 'var(--color-edit)',
  complete: 'var(--color-success)',
  error: 'var(--color-error)',
};

function formatElapsed(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function StepDot({ step }: { step: PipelineStep }) {
  const color = STEP_COLORS[step.type];

  if (step.status === 'pending') {
    return (
      <span className="mt-[3px] block h-[14px] w-[14px] shrink-0 rounded-full border border-border-medium" />
    );
  }

  if (step.status === 'active') {
    return (
      <span
        className="mt-[3px] block h-[14px] w-[14px] shrink-0 animate-pulse rounded-full"
        style={{ background: color }}
      />
    );
  }

  if (step.status === 'completed') {
    return (
      <span
        className="mt-[3px] flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full"
        style={{ background: color }}
      >
        <Check className="h-[9px] w-[9px] text-white" strokeWidth={3} />
      </span>
    );
  }

  // error
  return (
    <span className="mt-[3px] flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full bg-error">
      <X className="h-[9px] w-[9px] text-white" strokeWidth={3} />
    </span>
  );
}

export function AIPipelineTimeline({ steps, className }: AIPipelineTimelineProps) {
  return (
    <div className={cn('rounded-[var(--radius-lg)] border border-border bg-background p-4', className)}>
      <ol className="space-y-1">
        {steps.map((step) => (
          <li
            key={step.id}
            className={cn(
              'flex items-start gap-3 rounded px-2 py-[6px] transition-colors',
              step.status === 'active' && 'bg-surface-200',
            )}
          >
            <StepDot step={step} />
            <span
              className={cn(
                'flex-1 text-button leading-[20px] text-foreground',
                step.status === 'active' && 'font-medium',
              )}
            >
              {step.label}
            </span>
            {step.elapsed !== undefined && (
              <span className="shrink-0 text-caption leading-[20px] font-mono text-muted">
                {formatElapsed(step.elapsed)}
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
