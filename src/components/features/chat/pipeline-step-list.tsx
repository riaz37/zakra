'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Check, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PipelineStep } from '@/hooks/useChatStream';
import { stepColor } from './step-color';

function StepRow({ step, index }: { step: PipelineStep; index: number }) {
  const color = stepColor(step.stepName);
  const isDone = step.status === 'completed';
  const isFailed = step.status === 'failed';
  const isRunning = step.status === 'running';

  return (
    <div
      className="flex h-6 items-center gap-2.5 animate-fade-up"
      style={{ animationDelay: `${index * 35}ms` }}
    >
      {/* Status indicator — fixed 14px slot, no shifting */}
      <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
        {isRunning && (
          <div
            className="h-[6px] w-[6px] rounded-full animate-pulse"
            style={{ background: color }}
          />
        )}
        {isDone && (
          <Check
            className="h-3 w-3"
            strokeWidth={2.5}
            style={{ color: `color-mix(in srgb, ${color} 65%, transparent)` }}
          />
        )}
        {isFailed && (
          <X className="h-3 w-3 text-error" strokeWidth={2.5} />
        )}
      </div>

      {/* Step name */}
      <span
        className="font-mono text-mono-sm leading-none transition-[color,opacity] duration-500"
        style={{
          color: isFailed
            ? 'var(--color-error)'
            : isRunning
              ? color
              : 'var(--color-muted-foreground)',
          opacity: isDone ? 0.38 : 1,
        }}
      >
        {step.stepName}
        {isRunning && (
          <span className="ml-0.5 animate-pulse opacity-40">…</span>
        )}
      </span>

      {/* Duration badge — only on completed steps */}
      {isDone && step.durationMs !== undefined && (
        <span className="ml-auto font-mono text-mono-sm text-muted/25 animate-fade-in">
          {step.durationMs < 1000
            ? `${step.durationMs}ms`
            : `${(step.durationMs / 1000).toFixed(1)}s`}
        </span>
      )}
    </div>
  );
}

interface PipelineStepListProps {
  steps: PipelineStep[];
}

export function PipelineStepList({ steps }: PipelineStepListProps) {
  return (
    <div
      aria-live="polite"
      aria-label="Processing steps"
      className="flex gap-3 animate-slide-in-bottom"
    >
      {/* Logo — top-aligned with first row */}
      <div className="relative mt-0.5 shrink-0">
        <span className="absolute inset-[-4px] rounded-full bg-accent/8 blur-[8px]" aria-hidden />
        <Image
          src="/logo/esaplogo.webp"
          alt="ESAP"
          width={22}
          height={22}
          className="relative opacity-70"
        />
      </div>

      {/* Vertical step list — left border connects rows */}
      <div className="border-l border-border/20 pl-3">
        {steps.map((step, idx) => (
          <StepRow
            key={`${step.stepNumber}-${step.stepName}`}
            step={step}
            index={idx}
          />
        ))}
      </div>
    </div>
  );
}

interface PipelineSummaryProps {
  steps: PipelineStep[];
}

export function PipelineSummary({ steps }: PipelineSummaryProps) {
  const [expanded, setExpanded] = useState(false);
  const done = steps.filter((s) => s.status === 'completed' || s.durationMs !== undefined);
  if (done.length === 0) return null;

  return (
    <div className="mb-3">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center gap-1 font-mono text-mono-sm text-muted/35 transition-colors hover:text-muted/55 focus-visible:outline-none"
      >
        <ChevronRight
          className={cn('h-3 w-3 transition-transform duration-150', expanded && 'rotate-90')}
          strokeWidth={2}
        />
        <span>
          {done.length} {done.length === 1 ? 'step' : 'steps'}
        </span>
      </button>

      {expanded && (
        <div className="mt-2 border-l border-border/20 pl-3 animate-fade-up">
          {done.map((step, idx) => (
            <StepRow key={idx} step={step} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}
