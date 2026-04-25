'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAIReportGeneration } from '@/hooks/useAIReportGeneration';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { useDbConnections } from '@/hooks/useDbConnections';
import { AIPipelineTimeline } from '@/components/shared/ai-pipeline-timeline';
import type { PipelineStep as TimelineStep } from '@/components/shared/ai-pipeline-timeline';
import type { ReportPipelineStep } from '@/types';
import { Square, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
        <h1 className="font-sans text-[28px] font-normal tracking-[-0.56px] text-foreground">
          AI Report Generator
        </h1>
        <p className="mt-1 font-sans text-[15px] text-muted">
          Describe the report you want and AI will generate it from your data.
        </p>
      </div>

      {/* Form — hide while generating or done */}
      {!hasStarted && (
        <div className="rounded-xl border border-border bg-surface-100 p-6">
          <FieldGroup className="gap-6">
            {/* Report description */}
            <Field>
              <FieldLabel htmlFor="query-textarea">What report do you need? *</FieldLabel>
              <textarea
                id="query-textarea"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Monthly sales performance report with revenue trends and top products"
                rows={3}
                className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 font-sans text-[14px] text-foreground outline-none transition-shadow focus:shadow-focus"
              />
            </Field>

            {/* Optional title */}
            <Field>
              <FieldLabel htmlFor="title-input">Report title (optional)</FieldLabel>
              <input
                id="title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Auto-generated if left blank"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 font-sans text-[14px] text-foreground outline-none transition-shadow focus:shadow-focus"
              />
            </Field>

            {/* Connection selector */}
            {connections.length > 1 && (
              <Field>
                <FieldLabel htmlFor="connection-select">Database Connection</FieldLabel>
                <Select value={connectionId} onValueChange={(v) => v && setConnectionId(v)}>
                  <SelectTrigger id="connection-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {connections.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}

            {/* Form error */}
            {formError && (
              <p className="font-sans text-[13px] text-error">
                {formError}
              </p>
            )}

            <div className="flex justify-end">
              <Button
                onClick={() => void handleGenerate()}
                disabled={!query.trim()}
                className="h-10 px-5"
              >
                Generate report
              </Button>
            </div>
          </FieldGroup>
        </div>
      )}

      {/* Pipeline while generating */}
      {hasStarted && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-surface-100 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-sans text-[14px] font-medium text-foreground">
                  {isGenerating
                    ? 'Generating report…'
                    : isCompleted
                      ? 'Report ready'
                      : hasError
                        ? 'Generation failed'
                        : 'Stopped'}
                </p>
                {query && (
                  <p className="mt-1 font-sans text-[13px] text-muted">
                    {query.length > 80 ? `${query.slice(0, 80)}…` : query}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isGenerating && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleStop}
                  >
                    <Square aria-hidden size={14} />
                    Stop
                  </Button>
                )}
                {(isCompleted || hasError) && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleReset}
                  >
                    New report
                  </Button>
                )}
              </div>
            </div>

            <AIPipelineTimeline steps={timelineSteps} />
          </div>

          {/* Error */}
          {hasError && state.error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
              <p className="font-sans text-[14px] text-error">
                {state.error.message}
              </p>
            </div>
          )}

          {/* Executive summary preview */}
          {state.executiveSummary && (
            <div className="rounded-xl border border-border bg-surface-100 p-5">
              <p className="mb-2 font-mono text-[11px] font-medium uppercase tracking-wider text-muted">
                Executive Summary
              </p>
              <p className="font-sans text-[15px] leading-relaxed text-foreground">
                {state.executiveSummary}
              </p>
            </div>
          )}

          {/* View report CTA */}
          {isCompleted && state.generationId && (
            <div className="flex justify-center">
              <Button
                onClick={() => router.push(`/reports/${state.generationId}`)}
                size="lg"
                className="px-8"
              >
                <ExternalLink aria-hidden size={16} />
                View Report
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
