"use client";

import { AlertCircle, CheckCircle2, Circle, Loader2 } from "lucide-react";
import type { PipelineStep } from "@/types";

interface PipelinePanelProps {
  steps: PipelineStep[];
  confidenceScore: number | null;
  queryExplanation: string | null;
  durationMs: number | null;
  error: { code: string; message: string; stepName?: string; recoverable: boolean } | null;
  totalRows: number | null;
}

export function PipelinePanel({
  steps,
  confidenceScore,
  queryExplanation,
  durationMs,
  error,
  totalRows,
}: PipelinePanelProps) {
  return (
    <div className="flex min-h-0 flex-col">
      <header className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
        <span className="caption-upper">Pipeline</span>
        {durationMs !== null && (
          <span className="ml-auto font-mono text-[11px] text-[var(--primary)]">
            {durationMs}ms
          </span>
        )}
      </header>

      <ol className="flex flex-col">
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;
          return (
            <li key={step.number} className="relative flex gap-3 px-4 py-2.5">
              {!isLast && (
                <span
                  aria-hidden
                  className={`absolute left-[27px] top-[30px] bottom-0 w-px ${
                    step.status === "completed"
                      ? "bg-[var(--primary)]/50"
                      : "bg-[var(--border)]"
                  }`}
                />
              )}
              <StepIcon status={step.status} />
              <div className="min-w-0 grow">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-[10px] text-[var(--fg-subtle)]">
                    0{step.number}
                  </span>
                  <span
                    className={`truncate text-[13px] font-medium ${
                      step.status === "failed"
                        ? "text-[var(--destructive)]"
                        : step.status === "completed"
                          ? "text-[var(--fg)]"
                          : step.status === "running"
                            ? "text-[var(--primary)]"
                            : "text-[var(--fg-muted)]"
                    }`}
                  >
                    {step.name}
                  </span>
                  {step.durationMs !== undefined && step.status === "completed" && (
                    <span className="ml-auto shrink-0 font-mono text-[10px] text-[var(--fg-subtle)]">
                      {step.durationMs}ms
                    </span>
                  )}
                </div>
                {step.resultSummary ? (
                  <p className="mt-0.5 truncate text-[11px] text-[var(--fg-subtle)]">
                    {step.resultSummary}
                  </p>
                ) : (
                  <p className="mt-0.5 truncate text-[11px] text-[var(--fg-subtle)]">
                    {step.description}
                  </p>
                )}
                {step.status === "running" && step.progress !== undefined && (
                  <div className="mt-1.5 h-0.5 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]">
                    <div
                      className="h-full rounded-full bg-[var(--primary)] transition-[width]"
                      style={{ width: `${Math.min(100, step.progress)}%` }}
                    />
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {error && (
        <div className="mx-4 mt-2 flex items-start gap-2 rounded-[var(--radius-input)] bg-[var(--destructive-soft)] p-3 text-[12px] text-[var(--destructive)]">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.75} />
          <div className="min-w-0">
            <div className="font-medium">
              {error.stepName ? `${error.stepName} failed` : "Pipeline error"}
            </div>
            <p className="mt-0.5 opacity-90">{error.message}</p>
            <p className="mt-1 font-mono text-[10px] opacity-60">{error.code}</p>
          </div>
        </div>
      )}

      {(confidenceScore !== null || queryExplanation || totalRows !== null) && (
        <div className="mx-4 mt-3 rounded-[var(--radius-input)] border border-[var(--border)] bg-[var(--surface-muted)]/60 p-3">
          {confidenceScore !== null && (
            <div className="flex items-center gap-2">
              <span className="caption-upper text-[var(--fg-subtle)]">Confidence</span>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="h-1 w-24 overflow-hidden rounded-full bg-[var(--surface)]">
                  <div
                    className="h-full rounded-full bg-[var(--primary)]"
                    style={{ width: `${Math.round(confidenceScore * 100)}%` }}
                  />
                </div>
                <span className="font-mono text-[11px] font-medium text-[var(--primary)]">
                  {Math.round(confidenceScore * 100)}%
                </span>
              </div>
            </div>
          )}
          {totalRows !== null && (
            <div className="mt-1.5 flex items-center gap-2 text-[12px]">
              <span className="text-[var(--fg-subtle)]">Rows returned</span>
              <span className="ml-auto font-mono text-[11px] font-medium">
                {totalRows.toLocaleString()}
              </span>
            </div>
          )}
          {queryExplanation && (
            <p className="mt-2.5 text-[12px] leading-[18px] text-[var(--fg-muted)]">
              {queryExplanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function StepIcon({ status }: { status: PipelineStep["status"] }) {
  if (status === "completed") {
    return (
      <span className="relative z-10 inline-flex size-[22px] shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-fg)]">
        <CheckCircle2 className="size-3" strokeWidth={2.2} />
      </span>
    );
  }
  if (status === "running") {
    return (
      <span className="relative z-10 inline-flex size-[22px] shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
        <Loader2 className="size-3 animate-spin" strokeWidth={2.2} />
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="relative z-10 inline-flex size-[22px] shrink-0 items-center justify-center rounded-full bg-[var(--destructive-soft)] text-[var(--destructive)]">
        <AlertCircle className="size-3" strokeWidth={2.2} />
      </span>
    );
  }
  return (
    <span className="relative z-10 inline-flex size-[22px] shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--fg-subtle)]">
      <Circle className="size-2" strokeWidth={2.2} fill="currentColor" />
    </span>
  );
}
