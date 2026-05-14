import Link from 'next/link';
import { BarChart2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AIReportPipelineState, ReportPipelineStep } from '@/types';
import type { NormalizedStep } from '@/components/features/chat/pipeline-step-list';

export interface CompletedTurn {
  query: string;
  generationId: string | null;
  title: string | null;
  executiveSummary: string | null;
  keyMetrics: AIReportPipelineState['keyMetrics'];
  steps: ReportPipelineStep[];
}

export function normalizeReportSteps(steps: ReportPipelineStep[]): NormalizedStep[] {
  return steps.map((s) => ({
    key: String(s.number),
    name: s.name,
    status: s.status,
    durationMs: s.durationMs,
  }));
}

export function ReportCard({ turn }: { turn: CompletedTurn }) {
  const viewUrl = turn.generationId ? `/reports/${turn.generationId}` : '#';

  return (
    <div className="rounded-lg border border-border bg-surface-200 animate-fade-in">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-300">
            <BarChart2 className="h-4 w-4 text-accent" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-sans text-body font-medium text-foreground">
              {turn.title ?? 'Report Ready'}
            </p>
            {turn.executiveSummary && (
              <p className="mt-0.5 line-clamp-2 font-sans text-body text-fg-muted">
                {turn.executiveSummary}
              </p>
            )}
          </div>
        </div>

        {turn.keyMetrics.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {turn.keyMetrics.slice(0, 4).map((m, i) => (
              <div
                key={i}
                className="rounded-lg bg-surface-300 px-3 py-1.5"
              >
                <p className="font-mono text-mono-sm text-fg-subtle">{m.metric}</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-sans text-body font-medium text-foreground">
                    {m.value}
                  </span>
                  {m.change_percent != null && (
                    <span
                      className={cn(
                        'font-mono text-mono-sm',
                        m.change_percent >= 0 ? 'text-accent' : 'text-error',
                      )}
                    >
                      {m.change_percent >= 0 ? '+' : ''}
                      {m.change_percent}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border px-4 py-3 flex justify-end">
        <Link href={viewUrl} className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 font-sans text-body font-medium text-background transition-colors duration-150 hover:opacity-90">
          View Report
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}
