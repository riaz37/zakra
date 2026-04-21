'use client';

import { useEffect, useRef, useState } from 'react';
import { useExecuteQuery } from '@/hooks/useDbQuery';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { useDbConnections } from '@/hooks/useDbConnections';
import { AIPipelineTimeline } from '@/components/shared/ai-pipeline-timeline';
import type { PipelineStep as TimelineStep } from '@/components/shared/ai-pipeline-timeline';
import type { PipelineStep, StepStatus } from '@/types';
import { Square, Send, RotateCcw } from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────────────

const STEP_TYPE_MAP: Record<string, TimelineStep['type']> = {
  'Business Rules': 'thinking',
  'Table Selection': 'search',
  'Column Selection': 'search',
  'Query Generation': 'write',
  'Query Validation': 'query',
  'Column Masking': 'query',
  'Query Execution': 'query',
  'Chart Recommendation': 'thinking',
};

function toTimelineSteps(steps: PipelineStep[]): TimelineStep[] {
  return steps.map((s) => ({
    id: String(s.number),
    label: s.name,
    type: STEP_TYPE_MAP[s.name] ?? 'thinking',
    status:
      s.status === 'running'
        ? 'active'
        : s.status === 'completed'
          ? 'completed'
          : s.status === 'failed'
            ? 'error'
            : 'pending',
    elapsed: s.durationMs,
  }));
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function QueryPage() {
  const companyId = useCurrentCompanyId();
  const { data: connectionsData } = useDbConnections({ company_id: companyId });
  const connections = connectionsData?.items ?? [];

  const [query, setQuery] = useState('');
  const [selectedConnection, setSelectedConnection] = useState<string>('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const { execute, reset, pipeline, isLoading } = useExecuteQuery();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<(() => void) | null>(null);

  // SSE abort cleanup
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  // Auto-select first connection
  useEffect(() => {
    if (connections.length > 0 && !selectedConnection) {
      setSelectedConnection(connections[0].id);
    }
  }, [connections, selectedConnection]);

  const handleSubmit = async () => {
    if (!query.trim() || !selectedConnection) return;
    setHasSubmitted(true);
    await execute(
      {
        query: query.trim(),
        connection_id: selectedConnection,
        include_explanation: true,
      },
      companyId,
    );
  };

  const handleStop = () => {
    reset();
  };

  const handleRequery = () => {
    reset();
    setHasSubmitted(false);
    setQuery('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  const isStreaming = pipeline.status === 'running';
  const isCompleted = pipeline.status === 'completed';
  const hasError = pipeline.status === 'error';

  return (
    <div className="mx-auto max-w-[900px] px-6 py-8">
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
          Query
        </h1>
        <p
          className="mt-1 text-[15px]"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-muted)' }}
        >
          Ask questions about your data in plain language.
        </p>
      </div>

      {/* Input section */}
      <div
        className="rounded-[var(--radius-xl)] border p-5"
        style={{
          background: 'var(--color-surface-100)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Connection selector */}
        {connections.length > 1 && (
          <div className="mb-3">
            <select
              value={selectedConnection}
              onChange={(e) => setSelectedConnection(e.target.value)}
              className="rounded-[var(--radius-md)] border px-3 py-2 text-[13px] outline-none"
              style={{
                background: 'var(--color-surface-300)',
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

        <textarea
          ref={textareaRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Show me monthly revenue for the last 6 months"
          rows={3}
          disabled={isStreaming}
          className="w-full resize-none rounded-[var(--radius-md)] border px-4 py-3 text-[15px] outline-none transition-shadow focus:shadow-[var(--shadow-focus)] disabled:opacity-50"
          style={{
            background: 'var(--color-background)',
            borderColor: 'var(--color-border)',
            fontFamily: 'var(--font-serif)',
            color: 'var(--color-foreground)',
            lineHeight: 1.5,
          }}
        />

        <div className="mt-3 flex items-center justify-between">
          <span
            className="text-[12px]"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}
          >
            {isStreaming ? 'Processing...' : 'Cmd+Enter to run'}
          </span>

          <div className="flex items-center gap-2">
            {(isCompleted || hasError) && (
              <button
                onClick={handleRequery}
                className="flex items-center gap-2 rounded-[var(--radius-lg)] px-3 py-2 text-[13px] transition-colors hover:opacity-80"
                style={{
                  background: 'var(--color-surface-300)',
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-foreground)',
                }}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                New query
              </button>
            )}

            {isStreaming ? (
              <button
                onClick={handleStop}
                className="flex items-center gap-2 rounded-[var(--radius-lg)] px-4 py-2 text-[13px] transition-colors hover:opacity-80"
                style={{
                  background: 'var(--color-error)',
                  color: '#fff',
                  fontFamily: 'var(--font-display)',
                }}
              >
                <Square className="h-3.5 w-3.5" />
                Stop
              </button>
            ) : (
              <button
                onClick={() => void handleSubmit()}
                disabled={!query.trim() || !selectedConnection || isStreaming}
                className="flex items-center gap-2 rounded-[var(--radius-lg)] px-4 py-2 text-[13px] transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  background: 'var(--color-foreground)',
                  color: 'var(--color-background)',
                  fontFamily: 'var(--font-display)',
                }}
              >
                <Send className="h-3.5 w-3.5" />
                Run query
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {hasError && pipeline.error && (
        <div
          className="mt-4 rounded-[var(--radius-lg)] border px-4 py-3"
          style={{
            background: 'rgba(207,45,86,0.06)',
            borderColor: 'rgba(207,45,86,0.2)',
          }}
        >
          <p
            className="text-[14px]"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-error)' }}
          >
            {pipeline.error.message}
          </p>
        </div>
      )}

      {/* Pipeline timeline */}
      {hasSubmitted && (
        <div className="mt-6">
          <AIPipelineTimeline steps={toTimelineSteps(pipeline.steps)} />
        </div>
      )}

      {/* SQL preview */}
      {pipeline.generatedSql && (
        <div
          className="mt-6 rounded-[var(--radius-xl)] border p-5"
          style={{
            background: 'var(--color-surface-100)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <span
              className="text-[11px] uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}
            >
              Generated SQL
            </span>
            {pipeline.confidenceScore !== null && (
              <span
                className="text-[11px]"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}
              >
                {Math.round(pipeline.confidenceScore * 100)}% confidence
              </span>
            )}
          </div>
          <pre
            className="overflow-x-auto rounded-[var(--radius-md)] p-4 text-[13px]"
            style={{
              fontFamily: 'var(--font-mono)',
              background: 'var(--color-surface-400)',
              color: 'var(--color-foreground)',
              lineHeight: 1.6,
            }}
          >
            {pipeline.generatedSql}
          </pre>
          {pipeline.queryExplanation && (
            <p
              className="mt-3 text-[14px]"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-muted-strong)' }}
            >
              {pipeline.queryExplanation}
            </p>
          )}
        </div>
      )}

      {/* Query results */}
      {pipeline.queryResult && (
        <div
          className="mt-6 rounded-[var(--radius-xl)] border"
          style={{
            background: 'var(--color-surface-100)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
            <span
              className="text-[14px] font-medium"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}
            >
              Results
            </span>
            <span
              className="text-[12px]"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}
            >
              {pipeline.queryResult.row_count} rows
              {pipeline.queryResult.truncated && ' (truncated)'}
              {pipeline.durationMs !== null &&
                ` · ${(pipeline.durationMs / 1000).toFixed(2)}s`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {pipeline.queryResult.columns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-2 text-left font-medium"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-muted)',
                        background: 'var(--color-surface-300)',
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pipeline.queryResult.rows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    style={{ borderBottom: '1px solid var(--color-border)' }}
                    className="transition-colors hover:bg-[var(--color-surface-200)]"
                  >
                    {pipeline.queryResult!.columns.map((col) => (
                      <td
                        key={col}
                        className="px-4 py-2"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--color-foreground)',
                        }}
                      >
                        {String(row[col] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
