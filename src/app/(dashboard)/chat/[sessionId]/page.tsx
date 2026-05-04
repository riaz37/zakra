'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { ChevronDown, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useChatStream } from '@/hooks/useChatStream';
import { getPendingTask, clearPendingTask } from '@/store/pendingChatTask';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useChatSession, SESSIONS_KEY } from '@/hooks/useChatSessions';
import { useDbConnection } from '@/hooks/useDbConnections';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { ChatInput } from '@/components/ui/chat-input';
import { ChatMessageView, UserMessage } from '@/components/features/chat/chat-message';
import { ThinkingIndicator } from '@/components/features/chat/thinking-indicator';
import { PipelineStepList, type NormalizedStep } from '@/components/features/chat/pipeline-step-list';
import { StreamingResponse } from '@/components/features/chat/streaming-response';
import { ChatWelcome } from '@/components/features/chat/chat-welcome';
import { ChatMessagesSkeleton } from '@/components/features/chat/chat-messages-skeleton';
import { AnimatedPage } from '@/components/shared/animated-container';
import { fadeUp, slideInBottom, fadeIn, staggerContainer } from '@/lib/motion';

export default function ChatSessionPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;
  const companyId = useCurrentCompanyId();
  const queryClient = useQueryClient();
  const { data: session } = useChatSession(sessionId, companyId);
  const { data: connection } = useDbConnection(
    session?.connection_id ?? undefined,
    companyId,
  );

  const { messages, invalidate, isLoading: messagesLoading } = useChatMessages(sessionId, companyId);

  const {
    send,
    connect,
    cancel,
    reset,
    streamingMessage,
    pendingUserMessage,
    pipelineSteps,
    isStreaming,
    error,
    status,
  } = useChatStream({
    onComplete: () => {
      clearPendingTask(sessionId);
      void queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
      void queryClient.invalidateQueries({ queryKey: ['chat-session', sessionId] });
      void invalidate().then(() => reset());
    },
  });

  // CRITICAL: close EventSource on unmount
  useEffect(() => {
    return () => { cancel(); };
  }, [cancel]);

  const {
    containerRef: scrollContainerRef,
    checkAtBottom,
    scrollToBottom,
  } = useSmoothScroll(
    [messages, streamingMessage, pendingUserMessage, pipelineSteps],
    isStreaming || !!pendingUserMessage
  );

  const [showScrollDown, setShowScrollDown] = useState(false);

  // Track scroll distance for "Latest" button
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const check = () => {
      checkAtBottom();
      const dist = container.scrollHeight - container.scrollTop - container.clientHeight;
      setShowScrollDown(dist > 300);
    };
    container.addEventListener('scroll', check, { passive: true });
    return () => container.removeEventListener('scroll', check);
  }, [checkAtBottom]);

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || !sessionId) return;
      await send(sessionId, text.trim(), companyId);
    },
    [sessionId, send, companyId],
  );

  const hasContent = messages.length > 0 || !!pendingUserMessage || !!streamingMessage;

  // Connect to the in-progress SSE stream for the initial question.
  // The message was already POSTed in the new-chat page before navigation,
  // so we only need to subscribe — no duplicate POST, Strict Mode safe.
  useEffect(() => {
    if (!sessionId || !companyId) return;
    const pending = getPendingTask(sessionId);
    if (!pending) return;
    connect(pending.taskId, pending.userMessage);
  }, [sessionId, companyId, connect]);


  const sessionTitle = session?.title?.trim() || 'Chat';

  return (
    <AnimatedPage className="relative flex h-full flex-col overflow-hidden">
      {/* Sticky session header */}
      <header className="shrink-0 border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-[720px] items-center justify-between gap-4 px-6 py-3">
          <h1
            className="min-w-0 truncate font-sans text-button font-medium text-foreground"
            title={sessionTitle}
          >
            {sessionTitle}
          </h1>
          {connection ? (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-pill border border-border bg-surface-200 px-2.5 py-1 font-mono text-micro text-muted">
              <span aria-hidden className="size-1.5 rounded-full bg-accent" />
              <span className="max-w-[180px] truncate">{connection.name}</span>
            </span>
          ) : null}
        </div>
      </header>

      {/* Reconnecting banner */}
      <AnimatePresence>
        {status === 'reconnecting' && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center gap-2 border-b border-warning-border bg-warning-bg px-4 py-2"
          >
            <RefreshCw className="h-3.5 w-3.5 text-warning animate-spin" strokeWidth={2} />
            <span className="font-sans text-caption text-warning">Reconnecting…</span>
          </motion.div>
        )}
      </AnimatePresence>


      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 pb-6">
        {/* Top fade mask — sits above content so first message is never covered */}
        <div
          className="pointer-events-none sticky top-0 z-10 h-8 w-full"
          style={{
            background:
              'linear-gradient(to bottom, var(--color-background) 0%, transparent 100%)',
          }}
        />

        <div className="mx-auto max-w-[720px]">
          {/* Only show skeleton when loading history with no streaming content yet */}
          {messagesLoading && !pendingUserMessage && !isStreaming && <ChatMessagesSkeleton />}

          {!messagesLoading && !hasContent && (
            <ChatWelcome onPrompt={(text) => void handleSend(text)} />
          )}

          {(messages.length > 0 || !!pendingUserMessage || !!streamingMessage) && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {messages.map((msg) => (
              <ChatMessageView 
                key={msg.id} 
                message={msg} 
                onReRun={() => void handleSend(msg.content)}
              />
            ))}

            {pendingUserMessage &&
              !messages.some((m) => m.role === 'user' && m.content === pendingUserMessage) && (
                <UserMessage content={pendingUserMessage} onReRun={() => void handleSend(pendingUserMessage)} />
              )}

            {isStreaming && pipelineSteps.length === 0 && !streamingMessage && (
              <ThinkingIndicator />
            )}

            {pipelineSteps.length > 0 && !streamingMessage && (
              <PipelineStepList
                steps={pipelineSteps.map((s): NormalizedStep => ({
                  key: `${s.stepNumber}-${s.stepName}`,
                  name: s.stepName,
                  status: s.status,
                  durationMs: s.durationMs,
                }))}
              />
            )}

            {streamingMessage && (
              <StreamingResponse
                streamingMessage={streamingMessage}
                pipelineSteps={pipelineSteps}
              />
            )}

            <AnimatePresence>
              {error && (
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="rounded-card border border-error/20 bg-error/5 px-4 py-3 font-sans text-button text-error"
                  role="alert"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          )}
        </div>
      </div>

      {/* Jump to latest button */}
      <AnimatePresence>
        {showScrollDown && (
          <motion.button
            type="button"
            aria-label="Jump to latest message"
            onClick={() => scrollToBottom()}
            variants={slideInBottom}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute bottom-28 right-6 z-10 flex items-center gap-1.5 rounded-pill border border-border bg-surface-300 px-3 py-1.5 font-sans text-caption text-foreground transition-colors duration-[120ms] hover:border-border-strong hover:bg-surface-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
            Latest
          </motion.button>
        )}
      </AnimatePresence>

      <div className="bg-background px-6 pb-6 pt-3">
        <div className="mx-auto max-w-[720px]">
          <ChatInput
            onSendMessage={(message) => void handleSend(message)}
            onStop={cancel}
            isStreaming={isStreaming}
            connections={connection ? [connection] : []}
            selectedConnectionId={connection?.id ?? null}
            connectionLocked
          />
        </div>
      </div>
    </AnimatedPage>
  );
}
