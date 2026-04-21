"use client";

import { ArrowRight, Check, Loader2, X } from "lucide-react";
import Link from "next/link";
import type { ReportPipelineStep } from "@/types";

interface PipelineStepsProps {
  steps: ReportPipelineStep[];
  status: "idle" | "running" | "completed" | "error";
  generationId: string | null;
  error: string | null;
  title: string;
}

export function PipelineSteps({
  steps,
  status,
  generationId,
  error,
  title,
}: PipelineStepsProps) {
  if (status === "idle") return null;

  return (
    <section
      aria-label="Generation progress"
      className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-token-sm"
    >
      <header className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-3">
        <div className="min-w-0 grow">
          <h3 className="font-display text-[14px] font-semibold -tracking-[0.01em]">
            {title}
          </h3>
          <p className="mt-0.5 text-[12px] text-[var(--fg-muted)]">
            {status === "running" && "Generating — streaming events below."}
            {status === "completed" && "Generation complete."}
            {status === "error" && "Generation failed."}
          </p>
        </div>
        {status === "completed" && generationId && (
          <Link
            href={`/reports?generation=${generationId}#history`}
            className="inline-flex h-8 items-center gap-1 rounded-[8px] bg-[var(--primary)] px-3 text-[13px] font-medium text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)]"
          >
            View report
            <ArrowRight className="size-3.5" strokeWidth={1.75} />
          </Link>
        )}
      </header>

      <ol className="flex flex-col">
        {steps.map((step, i) => (
          <li
            key={step.number}
            className="flex items-start gap-3 border-b border-[var(--border)] px-5 py-3 last:border-b-0"
          >
            <StepIndicator status={step.status} index={i + 1} />
            <div className="min-w-0 grow">
              <div className="flex items-center gap-2">
                <span className="truncate text-[13px] font-medium text-[var(--fg)]">
                  {step.name}
                </span>
                {typeof step.durationMs === "number" && (
                  <span className="font-mono text-[11px] text-[var(--fg-subtle)]">
                    {step.durationMs}ms
                  </span>
                )}
              </div>
              <div className="mt-0.5 text-[12px] text-[var(--fg-muted)]">
                {step.resultSummary ?? step.description}
              </div>
              {step.status === "running" &&
                typeof step.progress === "number" && (
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                    <div
                      className="h-full rounded-full bg-[var(--primary)] transition-[width] duration-300 ease-out"
                      style={{ width: `${Math.max(4, step.progress)}%` }}
                    />
                  </div>
                )}
            </div>
          </li>
        ))}
      </ol>

      {error && (
        <div className="border-t border-[var(--border)] bg-[var(--destructive-soft)] px-5 py-3 text-[13px] text-[var(--destructive)]">
          {error}
        </div>
      )}
    </section>
  );
}

function StepIndicator({
  status,
  index,
}: {
  status: ReportPipelineStep["status"];
  index: number;
}) {
  if (status === "completed") {
    return (
      <span
        aria-hidden
        className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-fg)]"
      >
        <Check className="size-3.5" strokeWidth={2} />
      </span>
    );
  }
  if (status === "running") {
    return (
      <span
        aria-hidden
        className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-[var(--primary)] text-[var(--primary)]"
      >
        <Loader2 className="size-3.5 animate-spin" strokeWidth={1.75} />
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span
        aria-hidden
        className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--destructive-soft)] text-[var(--destructive)]"
      >
        <X className="size-3.5" strokeWidth={2} />
      </span>
    );
  }
  if (status === "skipped") {
    return (
      <span
        aria-hidden
        className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--fg-subtle)] text-[11px] font-mono"
      >
        —
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface)] font-mono text-[11px] text-[var(--fg-subtle)]"
    >
      {index}
    </span>
  );
}
