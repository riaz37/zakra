'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
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
  const router = useRouter();
  const sessionId = params.sessionId;
  const companyId = useCurrentCompanyId();

  const { messages, invalidate, isLoading: messagesLoading } = useChatMessages(sessionId, companyId);

  const {
    send,
    cancel,
    streamingMessage,
    pendingUserMessage,
    pipelineSteps,
    isStreaming,
    error,
  } = useChatStream({
    onComplete: () => {
      void invalidate();
    },
  });

  // CRITICAL: close EventSource on unmount
  useEffect(() => {
    return () => { cancel(); };
  }, [cancel]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage, pendingUserMessage]);

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || !sessionId) return;
      await send(sessionId, text.trim(), companyId);
    },
    [sessionId, send, companyId],
  );

  const hasContent = messages.length > 0 || !!pendingUserMessage || !!streamingMessage;

  // Handle initial query from the "New Chat" page
  useEffect(() => {
    const initialQuery = searchParams.get('q');
    if (initialQuery && sessionId && companyId) {
      // Clear the query param so we don't resend on refresh
      const newUrl = `/chat/${sessionId}`;
      window.history.replaceState({}, '', newUrl);
      
      // Fire the message
      void send(sessionId, initialQuery, companyId);
    }
  }, [searchParams, sessionId, companyId, send]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-6 py-6">
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
                className="rounded-lg border border-error/20 bg-error/5 px-4 py-3 font-sans text-button text-error"
                role="alert"
              >
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

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
