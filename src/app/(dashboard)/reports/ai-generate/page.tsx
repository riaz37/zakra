'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { useDbConnections } from '@/hooks/useDbConnections';
import { useAIReportGeneration } from '@/hooks/useAIReportGeneration';
import { ChatInput } from '@/components/ui/chat-input';
import { PipelineStepList } from '@/components/features/chat/pipeline-step-list';
import { UserQueryBubble } from '@/components/features/reports/user-query-bubble';
import { normalizeReportSteps, type CompletedTurn } from '@/components/features/reports/report-card';
import { ReportWelcome } from '@/components/features/reports/report-welcome';
import { CompletedTurnView } from '@/components/features/reports/completed-turn-view';
import { PageHeader } from '@/components/shared/page-header';
import { ScaffoldContainer } from '@/components/shared/scaffold';
import { reportNavigationItems } from '@/components/features/reports/nav';
import { fadeUp, fadeIn, staggerContainer, staggerItem } from '@/lib/motion';

const ERROR_MESSAGES: Record<string, { title: string; hint: string }> = {
  REPORT_TEMPLATE_VALIDATION_ERROR: {
    title: 'No report templates configured',
    hint: 'This company has no active report templates. Ask your admin to create one first.',
  },
  SSE_CONNECTION_ERROR: {
    title: 'Connection lost',
    hint: 'The connection was interrupted. Please try again.',
  },
  SUBMIT_ERROR: {
    title: 'Failed to start report generation',
    hint: 'Something went wrong submitting your request. Please try again.',
  },
};

const MESSAGE_PATTERNS: Array<{ match: string; title: string; hint: string }> = [
  {
    match: 'no templates found',
    title: 'No matching report template',
    hint: 'No template covers this topic. Try rephrasing your request or browse available templates.',
  },
  {
    match: 'connection not found',
    title: 'Database connection not found',
    hint: 'The selected database connection is unavailable. Check your connections and try again.',
  },
  {
    match: 'no active report templates',
    title: 'No report templates configured',
    hint: 'This company has no active report templates. Ask your admin to create one first.',
  },
];

function getFriendlyError(code: string, message: string, recoverable: boolean) {
  if (ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  const lower = message.toLowerCase();
  const matched = MESSAGE_PATTERNS.find((p) => lower.includes(p.match));
  if (matched) return { title: matched.title, hint: matched.hint };
  return {
    title: recoverable ? 'Something went wrong' : 'Report generation failed',
    hint: recoverable ? 'Please try again.' : 'Contact support if the issue persists.',
  };
}


// ── Main page ─────────────────────────────────────────────────────────────────

export default function AIReportChatPage() {
  const pathname = usePathname();
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
      {/* Page header — kept outside the scroll area so the nav stays fixed */}
      <div className="shrink-0 bg-background">
        <ScaffoldContainer bottomPadding={false}>
          <PageHeader
            title="Reports"
            subtitle="Generate AI-driven reports from your connected data."
            navigationItems={reportNavigationItems(pathname)}
            isCompact
          />
        </ScaffoldContainer>
      </div>

      {/* Message thread */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-[720px]">
          <AnimatePresence mode="popLayout">
            {!hasContent ? (
              <motion.div
                key="welcome"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <ReportWelcome onPrompt={(text) => void handleSend(text)} />
              </motion.div>
            ) : (
              <motion.div
                key="messages"
                className="space-y-8"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {completedTurns.map((turn, i) => (
                  <motion.div key={i} variants={staggerItem}>
                    <CompletedTurnView turn={turn} />
                  </motion.div>
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

                <AnimatePresence>
                  {state.status === 'error' && state.error && (() => {
                    const { title, hint } = getFriendlyError(
                      state.error.code,
                      state.error.message,
                      state.error.recoverable,
                    );
                    return (
                      <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="rounded-card border border-error/20 bg-error/5 px-4 py-3 space-y-1"
                        role="alert"
                      >
                        <p className="font-sans text-button text-error">{title}</p>
                        <p className="font-sans text-body-sm text-subtle">{hint}</p>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </motion.div>
            )}
          </AnimatePresence>
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
