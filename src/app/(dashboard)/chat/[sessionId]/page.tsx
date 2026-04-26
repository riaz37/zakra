'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ChevronDown, RefreshCw } from 'lucide-react';
import { useChatStream } from '@/hooks/useChatStream';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { ChatInput } from '@/components/ui/chat-input';
import { ChatMessageView, UserMessage } from '@/components/features/chat/chat-message';
import { ThinkingIndicator } from '@/components/features/chat/thinking-indicator';
import { PipelineStepList } from '@/components/features/chat/pipeline-step-list';
import { StreamingResponse } from '@/components/features/chat/streaming-response';
import { ChatWelcome } from '@/components/features/chat/chat-welcome';
import { ChatMessagesSkeleton } from '@/components/features/chat/chat-messages-skeleton';

export default function ChatSessionPage() {
  const params = useParams<{ sessionId: string }>();
  const searchParams = useSearchParams();
  const sessionId = params.sessionId;
  const companyId = useCurrentCompanyId();

  const { messages, invalidate, isLoading: messagesLoading } = useChatMessages(sessionId, companyId);

  const {
    send,
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
      void invalidate().then(() => reset());
    },
  });

  // CRITICAL: close EventSource on unmount
  useEffect(() => {
    return () => { cancel(); };
  }, [cancel]);

  const initialQuerySentRef = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
  }, []);

  const scrollToBottomIfNear = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceFromBottom < 200) {
      scrollToBottom();
    }
  }, [scrollToBottom]);

  // Track scroll distance from bottom for jump button
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const check = () => {
      const dist = container.scrollHeight - container.scrollTop - container.clientHeight;
      setShowScrollDown(dist > 300);
    };
    container.addEventListener('scroll', check, { passive: true });
    return () => container.removeEventListener('scroll', check);
  }, []);

  // During active streaming always track bottom; otherwise only when near
  useEffect(() => {
    if (isStreaming || pendingUserMessage) {
      scrollToBottom();
    } else {
      scrollToBottomIfNear();
    }
  }, [messages, streamingMessage, pendingUserMessage, pipelineSteps, isStreaming, scrollToBottom, scrollToBottomIfNear]);

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || !sessionId) return;
      await send(sessionId, text.trim(), companyId);
    },
    [sessionId, send, companyId],
  );

  const hasContent = messages.length > 0 || !!pendingUserMessage || !!streamingMessage;

  // Handle initial query from the "New Chat" page — ref guards against double-fire
  // if companyId hydrates after searchParams (auth store loads late)
  useEffect(() => {
    if (initialQuerySentRef.current) return;
    const initialQuery = searchParams.get('q');
    if (initialQuery && sessionId && companyId) {
      initialQuerySentRef.current = true;
      window.history.replaceState({}, '', `/chat/${sessionId}`);
      void send(sessionId, initialQuery, companyId);
    }
  }, [searchParams, sessionId, companyId, send]);

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      {/* Reconnecting banner */}
      {status === 'reconnecting' && (
        <div className="flex items-center justify-center gap-2 border-b border-warning-border bg-warning-bg px-4 py-2 animate-fade-in">
          <RefreshCw className="h-3.5 w-3.5 text-warning animate-spin" strokeWidth={2} />
          <span className="font-sans text-caption text-warning">Reconnecting…</span>
        </div>
      )}

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 py-6">
        {/* Top fade mask */}
        <div
          className="pointer-events-none sticky top-0 z-10 -mt-6 h-8 w-full"
          style={{
            background:
              'linear-gradient(to bottom, var(--color-background) 0%, transparent 100%)',
          }}
        />

        <div className="mx-auto max-w-[720px]">
          {messagesLoading && <ChatMessagesSkeleton />}

          {!messagesLoading && !hasContent && (
            <ChatWelcome onPrompt={(text) => void handleSend(text)} />
          )}

          <div className="space-y-6">
            {messages.map((msg) => (
              <ChatMessageView key={msg.id} message={msg} />
            ))}

            {pendingUserMessage && <UserMessage content={pendingUserMessage} />}

            {isStreaming && pipelineSteps.length === 0 && !streamingMessage && (
              <ThinkingIndicator />
            )}

            {pipelineSteps.length > 0 && !streamingMessage && (
              <PipelineStepList steps={pipelineSteps} />
            )}

            {streamingMessage && (
              <StreamingResponse
                streamingMessage={streamingMessage}
                pipelineSteps={pipelineSteps}
              />
            )}

            {error && (
              <div
                className="rounded-lg border border-error/20 bg-error/5 px-4 py-3 font-sans text-button text-error animate-fade-in"
                role="alert"
              >
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Jump to latest button */}
      {showScrollDown && (
        <button
          onClick={() => scrollToBottom()}
          className="absolute bottom-28 right-6 z-10 flex items-center gap-1.5 rounded-full border border-border bg-surface-400 px-3 py-1.5 font-sans text-caption text-muted shadow-[var(--shadow-elevated)] transition-all duration-150 hover:border-border-medium hover:bg-surface-500 hover:text-foreground animate-slide-in-bottom"
        >
          <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
          Latest
        </button>
      )}

      <div className="bg-background px-6 pb-6 pt-3">
        <div className="mx-auto max-w-[720px]">
          <ChatInput
            onSendMessage={(message) => void handleSend(message)}
            onStop={cancel}
            isStreaming={isStreaming}
          />
        </div>
      </div>
    </div>
  );
}
