'use client';

import { Check, X } from 'lucide-react';

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
      <span
        className="mt-[3px] block h-[14px] w-[14px] shrink-0 rounded-full border"
        style={{ borderColor: 'var(--color-border-medium)' }}
      />
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
    <span
      className="mt-[3px] flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full"
      style={{ background: 'var(--color-error)' }}
    >
      <X className="h-[9px] w-[9px] text-white" strokeWidth={3} />
    </span>
  );
}

export function AIPipelineTimeline({ steps, className }: AIPipelineTimelineProps) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border p-4 ${className ?? ''}`}
      style={{
        background: 'var(--color-background)',
        borderColor: 'var(--color-border)',
      }}
    >
      <ol className="space-y-1">
        {steps.map((step) => (
          <li
            key={step.id}
            className="flex items-start gap-3 rounded px-2 py-[6px] transition-colors"
            style={
              step.status === 'active'
                ? { background: 'var(--color-surface-200)' }
                : undefined
            }
          >
            <StepDot step={step} />
            <span
              className={`flex-1 text-[13px] leading-[20px]${step.status === 'active' ? ' font-medium' : ''}`}
              style={{ color: 'var(--color-foreground)' }}
            >
              {step.label}
            </span>
            {step.elapsed !== undefined && (
              <span
                className="shrink-0 text-[11px] leading-[20px]"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-muted)',
                }}
              >
                {formatElapsed(step.elapsed)}
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
