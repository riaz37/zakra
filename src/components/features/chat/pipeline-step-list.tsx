'use client';

import type { PipelineStep } from '@/hooks/useChatStream';
import { stepColor } from './step-color';

interface PipelineStepListProps {
  steps: PipelineStep[];
}

export function PipelineStepList({ steps }: PipelineStepListProps) {
  return (
    <div aria-live="polite" aria-label="Processing steps" className="space-y-1.5 py-1">
      {steps.map((step, idx) => {
        const color = stepColor(step.stepName);
        const isDone = step.status === 'completed';
        return (
          <div key={idx} className="flex items-center gap-2">
            <span
              className="block h-[5px] w-[5px] shrink-0 rounded-full"
              style={{ background: color, opacity: isDone ? 0.5 : 1 }}
            />
            <span
              className="font-mono text-caption"
              style={{ color: isDone ? 'var(--color-muted)' : color }}
            >
              {step.stepName}
              {!isDone && <span className="ml-0.5 opacity-60">…</span>}
              {step.durationMs !== undefined && isDone && (
                <span className="ml-1.5 opacity-40">
                  {step.durationMs < 1000
                    ? `${step.durationMs}ms`
                    : `${(step.durationMs / 1000).toFixed(1)}s`}
                </span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface PipelineSummaryProps {
  steps: PipelineStep[];
}

export function PipelineSummary({ steps }: PipelineSummaryProps) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-0.5 pb-1">
      {steps.map((step, idx) => (
        <span
          key={idx}
          className="font-mono text-caption text-muted/50"
        >
          {step.stepName}
          {step.durationMs !== undefined && (
            <span className="ml-1">
              {step.durationMs < 1000
                ? `${step.durationMs}ms`
                : `${(step.durationMs / 1000).toFixed(1)}s`}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
