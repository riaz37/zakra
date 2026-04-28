'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  BarChart2,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { useDbConnections } from '@/hooks/useDbConnections';
import { useAIReportGeneration } from '@/hooks/useAIReportGeneration';
import { ChatInput } from '@/components/ui/chat-input';
import { PipelineStepList, PipelineSummary, type NormalizedStep } from '@/components/features/chat/pipeline-step-list';
import type { AIReportPipelineState, ReportPipelineStep } from '@/types';

function normalizeReportSteps(steps: ReportPipelineStep[]): NormalizedStep[] {
  return steps.map((s) => ({
    key: String(s.number),
    name: s.name,
    status: s.status,
    durationMs: s.durationMs,
  }));
}

// ── Types ────────────────────────────────────────────────────────────────────

interface CompletedTurn {
  query: string;
  generationId: string | null;
  title: string | null;
  executiveSummary: string | null;
  keyMetrics: AIReportPipelineState['keyMetrics'];
  steps: ReportPipelineStep[];
}

// ── User query bubble ─────────────────────────────────────────────────────────

function UserQueryBubble({ query }: { query: string }) {
  return (
    <div className="flex justify-end animate-slide-in-bottom">
      <div className="max-w-[78%] rounded-2xl border border-border/60 bg-surface-300 px-4 py-2.5 shadow-[var(--shadow-ring)]">
        <p className="whitespace-pre-wrap font-sans text-[15px] leading-[1.65] text-foreground">
          {query}
        </p>
      </div>
    </div>
  );
}

// ── Completed report card ─────────────────────────────────────────────────────

function ReportCard({ turn }: { turn: CompletedTurn }) {
  const viewUrl = turn.generationId ? `/reports/${turn.generationId}` : '#';

  return (
    <div className="rounded-xl border border-border bg-surface-200 animate-fade-in">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
            <BarChart2 className="h-4 w-4 text-accent/65" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-sans text-button font-medium text-foreground">
              {turn.title ?? 'Report Ready'}
            </p>
            {turn.executiveSummary && (
              <p className="mt-0.5 line-clamp-2 font-sans text-caption text-muted">
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
                className="rounded-lg border border-border bg-surface-300/60 px-3 py-1.5"
              >
                <p className="font-mono text-mono-sm text-subtle">{m.metric}</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-sans text-button font-medium text-foreground">
                    {m.value}
                  </span>
                  {m.change_percent != null && (
                    <span
                      className={cn(
                        'font-mono text-mono-sm',
                        m.change_percent >= 0 ? 'text-accent/80' : 'text-destructive/80',
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

      <div className="border-t border-border px-4 py-3">
        <a
          href={viewUrl}
          className="flex items-center justify-between gap-3"
        >
          <span className="font-sans text-caption text-muted">View full report</span>
          <span className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 font-sans text-button font-medium text-[#111] transition-colors duration-150 hover:bg-accent/90">
            View Report
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
        </a>
      </div>
    </div>
  );
}

// ── Completed turn (query + summary + card) ───────────────────────────────────

function CompletedTurnView({ turn }: { turn: CompletedTurn }) {
  return (
    <div className="space-y-4">
      <UserQueryBubble query={turn.query} />
      <div className="space-y-3">
        <PipelineSummary steps={normalizeReportSteps(turn.steps)} />
        <ReportCard turn={turn} />
      </div>
    </div>
  );
}

// ── Welcome state ─────────────────────────────────────────────────────────────

const REPORT_PROMPTS = [
  'Generate a Q1 sales performance report',
  'Create a monthly user growth report',
  'Summarize top revenue drivers this quarter',
  'Build a retention and churn analysis report',
];

function ReportWelcome({ onPrompt }: { onPrompt: (text: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center animate-fade-up">
      <div className="mb-5 flex h-[52px] w-[52px] items-center justify-center">
        <Image src="/logo/esaplogo.webp" alt="ESAP" width={48} height={48} priority />
      </div>

      <h2 className="font-sans text-[22px] font-normal leading-[1.25] tracking-[-0.44px] text-foreground">
        Generate a report with AI
      </h2>
      <p className="mt-2.5 max-w-[360px] font-sans text-button leading-[1.6] text-muted">
        Describe what you want to know. The AI picks the right template, runs the
        queries, and builds the report — delivered right here.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {REPORT_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onPrompt(prompt)}
            className="flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-3.5 py-2 font-sans text-button text-muted transition-colors duration-150 hover:border-accent/40 hover:bg-accent/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <BarChart2 className="h-3.5 w-3.5 shrink-0 text-accent/65" strokeWidth={1.5} />
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}


// ── Main page ─────────────────────────────────────────────────────────────────

export default function AIReportChatPage() {
  const companyId = useCurrentCompanyId();
  const { data: connectionsData } = useDbConnections({ company_id: companyId });
  const connections = connectionsData?.items ?? [];

  const [selectedConnectionId, setSelectedConnectionId] = useState<string | undefined>();
  const [completedTurns, setCompletedTurns] = useState<CompletedTurn[]>([]);
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);

  const { state, isGenerating, generate, cancel, reset } = useAIReportGeneration();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevStatusRef = useRef(state.status);

  // Auto-select default connection
  useEffect(() => {
    if (!selectedConnectionId && connections.length > 0) {
      const def = connections.find((c) => c.is_default) ?? connections[0];
      setSelectedConnectionId(def.id);
    }
  }, [connections, selectedConnectionId]);

  // Freeze completed turn and reset for next query
  useEffect(() => {
    if (prevStatusRef.current === 'running' && state.status === 'completed' && pendingQuery) {
      setCompletedTurns((prev) => [
        ...prev,
        {
          query: pendingQuery,
          generationId: state.generationId,
          title: state.queryAdaptation?.report_title ?? null,
          executiveSummary: state.executiveSummary,
          keyMetrics: state.keyMetrics,
          steps: state.steps,
        },
      ]);
      setPendingQuery(null);
      reset();
    }
    prevStatusRef.current = state.status;
  }, [state, pendingQuery, reset]);

  // Scroll to bottom during generation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [completedTurns, state.steps, isGenerating, pendingQuery]);

  const handleSend = useCallback(
    async (query: string) => {
      if (!query.trim() || isGenerating) return;
      setPendingQuery(query);
      await generate(query, companyId, selectedConnectionId);
    },
    [isGenerating, generate, companyId, selectedConnectionId],
  );

  const hasContent = completedTurns.length > 0 || !!pendingQuery || isGenerating;

  return (
    <div className="relative flex h-full flex-col overflow-hidden">

      {/* Message thread */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 py-6">
        <div
          className="pointer-events-none sticky top-0 z-10 -mt-6 h-8 w-full"
          style={{
            background:
              'linear-gradient(to bottom, var(--color-background) 0%, transparent 100%)',
          }}
        />

        <div className="mx-auto max-w-[720px]">
          {!hasContent && (
            <ReportWelcome onPrompt={(text) => void handleSend(text)} />
          )}

          <div className="space-y-8">
            {completedTurns.map((turn, i) => (
              <CompletedTurnView key={i} turn={turn} />
            ))}

            {pendingQuery && (
              <div className="space-y-4">
                <UserQueryBubble query={pendingQuery} />
                {state.steps.some((s) => s.status !== 'pending') && (
                  <PipelineStepList steps={normalizeReportSteps(state.steps)} />
                )}
                {isGenerating && !state.steps.some((s) => s.status !== 'pending') && (
                  <div className="flex items-center gap-2 animate-fade-in">
                    <div className="flex h-5 w-5 items-center justify-center">
                      <Image
                        src="/logo/esaplogo.webp"
                        alt="ESAP"
                        width={18}
                        height={18}
                        className="opacity-60"
                      />
                    </div>
                    <span className="font-mono text-mono-sm text-subtle animate-pulse">
                      Starting…
                    </span>
                  </div>
                )}
              </div>
            )}

            {state.status === 'error' && state.error && (
              <div
                className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 font-sans text-button text-destructive animate-fade-in"
                role="alert"
              >
                {state.error.message}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input area */}
      <div className="shrink-0 bg-background px-6 pb-6 pt-3">
        <div className="mx-auto max-w-[720px]">
          <ChatInput
            onSendMessage={(message) => void handleSend(message)}
            onStop={cancel}
            isStreaming={isGenerating}
            disabled={!companyId}
            placeholder="Describe the report you want to generate…"
            connections={connections}
            selectedConnectionId={selectedConnectionId ?? null}
            onConnectionChange={setSelectedConnectionId}
          />
        </div>
      </div>
    </div>
  );
}
