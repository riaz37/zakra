'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAIReportGeneration } from '@/hooks/useAIReportGeneration';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { useDbConnections } from '@/hooks/useDbConnections';
import { AIPipelineTimeline } from '@/components/shared/ai-pipeline-timeline';
import type { PipelineStep as TimelineStep } from '@/components/shared/ai-pipeline-timeline';
import type { ReportPipelineStep } from '@/types';
import { Sparkles, Square, ExternalLink } from 'lucide-react';

// ── Map pipeline steps to timeline visual types ────────────────────────────

function toTimelineSteps(steps: ReportPipelineStep[]): TimelineStep[] {
  return steps.map((s) => {
    let type: TimelineStep['type'] = 'thinking';
    const n = s.name.toLowerCase();
    if (n.includes('selection') || n.includes('search')) type = 'search';
    else if (n.includes('query') || n.includes('execution')) type = 'query';
    else if (n.includes('writing') || n.includes('summary') || n.includes('analysis') || n.includes('html') || n.includes('pdf')) type = 'write';
    else if (s.status === 'completed') type = 'complete';

    return {
      id: String(s.number),
      label: s.name,
      type,
      status:
        s.status === 'running'
          ? 'active'
          : s.status === 'completed'
            ? 'completed'
            : s.status === 'failed'
              ? 'error'
              : 'pending',
      elapsed: s.durationMs,
    };
  });
}

export default function AIGeneratePage() {
  const router = useRouter();
  const companyId = useCurrentCompanyId();
  const { data: connectionsData } = useDbConnections({ company_id: companyId });
  const connections = connectionsData?.items ?? [];

  const { state, isGenerating, generate, cancel, reset } = useAIReportGeneration();

  const [query, setQuery] = useState('');
  const [title, setTitle] = useState('');
  const [connectionId, setConnectionId] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // SSE abort cleanup — CRITICAL
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  // Auto-select first connection
  useEffect(() => {
    if (connections.length > 0 && !connectionId) {
      setConnectionId(connections[0].id);
    }
  }, [connections, connectionId]);

  const handleGenerate = async () => {
    if (!query.trim()) {
      setFormError('Please describe what report you need.');
      return;
    }
    setFormError(null);
    setHasStarted(true);
    await generate(
      query.trim(),
      companyId,
      connectionId || undefined,
      title.trim() || undefined,
    );
  };

  const handleStop = () => {
    cancel();
  };

  const handleReset = () => {
    reset();
    setHasStarted(false);
    setQuery('');
    setTitle('');
  };

  const isCompleted = state.status === 'completed';
  const hasError = state.status === 'error';
  const timelineSteps = toTimelineSteps(state.steps);

  return (
    <div className="mx-auto max-w-[760px] px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-[28px]"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            letterSpacing: '-0.56px',
            color: 'var(--color-foreground)',
          }}
        >
          AI Report Generator
        </h1>
        <p
          className="mt-1 text-[15px]"
          style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-muted)' }}
        >
          Describe the report you want and AI will generate it from your data.
        </p>
      </div>

      {/* Form — hide while generating or done */}
      {!hasStarted && (
        <div
          className="rounded-[var(--radius-xl)] border p-6"
          style={{ background: 'var(--color-surface-100)', borderColor: 'var(--color-border)' }}
        >
          <div className="space-y-4">
            {/* Report description */}
            <div>
              <label
                className="mb-1.5 block text-[13px] font-medium"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}
              >
                What report do you need? <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Monthly sales performance report with revenue trends and top products"
                rows={3}
                className="w-full resize-none rounded-[var(--radius-md)] border px-4 py-3 text-[14px] outline-none transition-shadow focus:shadow-[var(--shadow-focus)]"
                style={{
                  background: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  fontFamily: 'var(--font-sans)',
                  color: 'var(--color-foreground)',
                  lineHeight: 1.5,
                }}
              />
            </div>

            {/* Optional title */}
            <div>
              <label
                className="mb-1.5 block text-[13px] font-medium"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}
              >
                Report title <span style={{ color: 'var(--color-muted)' }}>(optional)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Auto-generated if left blank"
                className="w-full rounded-[var(--radius-md)] border px-4 py-2.5 text-[14px] outline-none transition-shadow focus:shadow-[var(--shadow-focus)]"
                style={{
                  background: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  fontFamily: 'var(--font-sans)',
                  color: 'var(--color-foreground)',
                }}
              />
            </div>

            {/* Connection selector */}
            {connections.length > 1 && (
              <div>
                <label
                  className="mb-1.5 block text-[13px] font-medium"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}
                >
                  Database Connection
                </label>
                <select
                  value={connectionId}
                  onChange={(e) => setConnectionId(e.target.value)}
                  className="w-full rounded-[var(--radius-md)] border px-4 py-2.5 text-[14px] outline-none"
                  style={{
                    background: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    fontFamily: 'var(--font-display)',
                    color: 'var(--color-foreground)',
                  }}
                >
                  {connections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Form error */}
            {formError && (
              <p
                className="text-[13px]"
                style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-error)' }}
              >
                {formError}
              </p>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => void handleGenerate()}
                disabled={!query.trim()}
                className="flex items-center gap-2 rounded-[var(--radius-lg)] px-5 py-[10px] text-[14px] transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  background: 'var(--color-foreground)',
                  color: 'var(--color-background)',
                  fontFamily: 'var(--font-display)',
                }}
              >
                <Sparkles className="h-4 w-4" />
                Generate report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline while generating */}
      {hasStarted && (
        <div className="space-y-6">
          <div
            className="rounded-[var(--radius-xl)] border p-5"
            style={{ background: 'var(--color-surface-100)', borderColor: 'var(--color-border)' }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p
                  className="text-[14px] font-medium"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}
                >
                  {isGenerating
                    ? 'Generating report…'
                    : isCompleted
                      ? 'Report ready'
                      : hasError
                        ? 'Generation failed'
                        : 'Stopped'}
                </p>
                {query && (
                  <p
                    className="mt-1 text-[13px]"
                    style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-muted)' }}
                  >
                    {query.length > 80 ? `${query.slice(0, 80)}…` : query}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isGenerating && (
                  <button
                    onClick={handleStop}
                    className="flex items-center gap-2 rounded-[var(--radius-lg)] px-3 py-2 text-[13px] transition-colors hover:opacity-80"
                    style={{
                      background: 'var(--color-error)',
                      color: '#fff',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    <Square className="h-3.5 w-3.5" />
                    Stop
                  </button>
                )}
                {(isCompleted || hasError) && (
                  <button
                    onClick={handleReset}
                    className="rounded-[var(--radius-lg)] px-3 py-2 text-[13px] transition-colors hover:opacity-80"
                    style={{
                      background: 'var(--color-surface-300)',
                      fontFamily: 'var(--font-display)',
                      color: 'var(--color-foreground)',
                    }}
                  >
                    New report
                  </button>
                )}
              </div>
            </div>

            <AIPipelineTimeline steps={timelineSteps} />
          </div>

          {/* Error */}
          {hasError && state.error && (
            <div
              className="rounded-[var(--radius-lg)] border px-4 py-3"
              style={{
                background: 'rgba(207,45,86,0.06)',
                borderColor: 'rgba(207,45,86,0.2)',
              }}
            >
              <p
                className="text-[14px]"
                style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-error)' }}
              >
                {state.error.message}
              </p>
            </div>
          )}

          {/* Executive summary preview */}
          {state.executiveSummary && (
            <div
              className="rounded-[var(--radius-xl)] border p-5"
              style={{ background: 'var(--color-surface-100)', borderColor: 'var(--color-border)' }}
            >
              <p
                className="mb-2 text-[11px] font-medium uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}
              >
                Executive Summary
              </p>
              <p
                className="text-[15px] leading-relaxed"
                style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-foreground)' }}
              >
                {state.executiveSummary}
              </p>
            </div>
          )}

          {/* View report CTA */}
          {isCompleted && state.generationId && (
            <div className="flex justify-center">
              <button
                onClick={() => router.push(`/reports/${state.generationId}`)}
                className="flex items-center gap-2 rounded-[var(--radius-lg)] px-6 py-3 text-[14px] transition-colors hover:opacity-90"
                style={{
                  background: 'var(--color-foreground)',
                  color: 'var(--color-background)',
                  fontFamily: 'var(--font-display)',
                }}
              >
                <ExternalLink className="h-4 w-4" />
                View Report
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
