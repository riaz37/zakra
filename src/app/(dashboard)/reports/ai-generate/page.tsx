'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Database,
  BarChart2,
  ArrowRight,
  ChevronRight,
  Check,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { useDbConnections } from '@/hooks/useDbConnections';
import { useAIReportGeneration } from '@/hooks/useAIReportGeneration';
import { ChatInput } from '@/components/ui/chat-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AIReportPipelineState, DatabaseConnection, ReportPipelineStep } from '@/types';

// ── Types ────────────────────────────────────────────────────────────────────

interface CompletedTurn {
  query: string;
  generationId: string | null;
  title: string | null;
  executiveSummary: string | null;
  keyMetrics: AIReportPipelineState['keyMetrics'];
  steps: ReportPipelineStep[];
}

// ── Step row (shared between live + summary) ─────────────────────────────────

function StepRow({ step, index }: { step: ReportPipelineStep; index: number }) {
  const isDone = step.status === 'completed';
  const isFailed = step.status === 'failed';
  const isRunning = step.status === 'running';

  return (
    <div
      className="flex h-6 items-center gap-2.5 animate-fade-up"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
        {isRunning && (
          <div className="h-[6px] w-[6px] rounded-full bg-accent animate-pulse" />
        )}
        {isDone && (
          <Check className="h-3 w-3 text-accent/60" strokeWidth={2.5} />
        )}
        {isFailed && (
          <X className="h-3 w-3 text-destructive" strokeWidth={2.5} />
        )}
        {!isRunning && !isDone && !isFailed && (
          <div className="h-[5px] w-[5px] rounded-full bg-border" />
        )}
      </div>

      <span
        className={cn(
          'font-mono text-mono-sm leading-none transition-[color,opacity] duration-500',
          isFailed && 'text-destructive',
          isRunning && 'text-accent',
          isDone && 'text-muted opacity-40',
          !isRunning && !isDone && !isFailed && 'text-subtle',
        )}
      >
        {step.name}
        {isRunning && <span className="ml-0.5 animate-pulse opacity-40">…</span>}
      </span>

      {isDone && step.durationMs !== undefined && (
        <span className="ml-auto font-mono text-mono-sm text-subtle animate-fade-in">
          {step.durationMs < 1000
            ? `${step.durationMs}ms`
            : `${(step.durationMs / 1000).toFixed(1)}s`}
        </span>
      )}
    </div>
  );
}

// ── Collapsible step summary (after completion) ───────────────────────────────

function StepSummary({ steps }: { steps: ReportPipelineStep[] }) {
  const [expanded, setExpanded] = useState(false);
  const done = steps.filter((s) => s.status === 'completed');
  if (done.length === 0) return null;

  return (
    <div className="mb-3">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1 font-mono text-mono-sm text-subtle transition-colors hover:text-muted focus-visible:outline-none"
      >
        <ChevronRight
          className={cn('h-3 w-3 transition-transform duration-150', expanded && 'rotate-90')}
          strokeWidth={2}
        />
        <span>{done.length} steps</span>
      </button>

      {expanded && (
        <div className="mt-2 border-l border-border/20 pl-3 animate-fade-up">
          {done.map((step, idx) => (
            <StepRow key={step.number} step={step} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
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

// ── Active pipeline view (live streaming) ─────────────────────────────────────

function ActivePipelineView({
  steps,
}: {
  steps: ReportPipelineStep[];
}) {
  const visible = steps.filter((s) => s.status !== 'pending');

  return (
    <div className="flex gap-3 animate-slide-in-bottom" aria-live="polite">
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
      <div className="border-l border-border/20 pl-3">
        {visible.map((step, idx) => (
          <StepRow key={step.number} step={step} index={idx} />
        ))}
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
        <StepSummary steps={turn.steps} />
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

// ── Persistent DB context bar (always visible, always switchable) ─────────────

function ConnectionBar({
  connections,
  selectedId,
  onSelect,
}: {
  connections: DatabaseConnection[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}) {
  const selected = connections.find((c) => c.id === selectedId);

  if (connections.length === 0) {
    return (
      <div className="flex shrink-0 items-center gap-2 border-b border-border bg-surface-200 px-6 py-2">
        <Database className="h-3.5 w-3.5 shrink-0 text-muted" strokeWidth={1.5} />
        <span className="font-sans text-caption text-muted">
          No database connections — add one in{' '}
          <a href="/connections" className="text-accent/80 hover:text-accent underline-offset-2 hover:underline">
            Connections
          </a>
          .
        </span>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-border bg-surface-200 px-6 py-2">
      <Database className="h-3.5 w-3.5 shrink-0 text-muted" strokeWidth={1.5} />
      <Select value={selectedId ?? ''} onValueChange={(v) => { if (v) onSelect(v); }}>
        <SelectTrigger className="h-6 w-auto min-w-[140px] border-border bg-transparent px-2 py-0 font-sans text-caption text-foreground focus:ring-0 focus:ring-offset-0 focus-visible:ring-1 focus-visible:ring-accent/40">
          <SelectValue>
            {selected?.name ?? (
              <span className="text-muted-foreground">Select a connection…</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {connections.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selected && (
        <>
          <span className="font-sans text-caption text-subtle">·</span>
          <span className="truncate font-mono text-mono-sm text-subtle">
            {selected.database_name}
          </span>
          <span className="ml-auto rounded-md border border-border bg-surface-300 px-1.5 py-0.5 font-mono text-mono-sm uppercase tracking-wide text-subtle">
            {selected.database_type}
          </span>
        </>
      )}
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
      {/* Persistent DB context bar — always shown, always switchable */}
      <ConnectionBar
        connections={connections}
        selectedId={selectedConnectionId}
        onSelect={setSelectedConnectionId}
      />

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
                  <ActivePipelineView steps={state.steps} />
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
            disabled={!companyId || !selectedConnectionId}
            placeholder="Describe the report you want to generate…"
          />
        </div>
      </div>
    </div>
  );
}
