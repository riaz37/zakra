'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useChatStream } from '@/hooks/useChatStream';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useChatSessions, useCreateSession } from '@/hooks/useChatSessions';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { StreamingTextBlock } from '@/components/shared/streaming-text-block';
import type { ChatMessage, MessageContentBlock } from '@/types/chat';
import { Send, Square, MessageSquarePlus } from 'lucide-react';

// ── Step type colors ───────────────────────────────────────────────────────

function stepColor(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('think') || lower.includes('plan') || lower.includes('reason')) {
    return '#dfa88f';
  }
  if (lower.includes('search') || lower.includes('grep') || lower.includes('find')) {
    return '#9fc9a2';
  }
  if (lower.includes('read') || lower.includes('query') || lower.includes('fetch')) {
    return '#9fbbe0';
  }
  if (lower.includes('write') || lower.includes('edit') || lower.includes('generat')) {
    return '#c0a8dd';
  }
  return '#dfa88f';
}

// ── Message content block renderer ────────────────────────────────────────

function ContentBlockView({ block }: { block: MessageContentBlock }) {
  if (block.type === 'text' && block.text) {
    return (
      <p
        className="text-[16px] leading-relaxed"
        style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-foreground)' }}
      >
        {block.text}
      </p>
    );
  }

  if (block.type === 'query_result' && block.query_result) {
    const qr = block.query_result;
    return (
      <div
        className="mt-3 overflow-hidden rounded-[var(--radius-lg)] border"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div
          className="px-3 py-2"
          style={{
            background: 'var(--color-surface-300)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <span
            className="text-[11px] uppercase"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}
          >
            {qr.row_count} rows
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {qr.columns.map((col) => (
                  <th
                    key={col}
                    className="px-3 py-2 text-left font-medium"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {qr.rows.slice(0, 10).map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {qr.columns.map((col) => (
                    <td
                      key={col}
                      className="px-3 py-2"
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
    );
  }

  if (block.type === 'report_link' && block.report) {
    return (
      <a
        href={block.report.page_url}
        className="mt-2 inline-flex items-center gap-2 rounded-[var(--radius-md)] border px-3 py-2 text-[13px] transition-colors hover:opacity-80"
        style={{
          background: 'var(--color-surface-300)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-foreground)',
          fontFamily: 'var(--font-display)',
        }}
      >
        {block.report.title ?? 'View Report'} →
      </a>
    );
  }

  if (block.type === 'search_result' && block.search_results) {
    return (
      <div className="mt-2 space-y-2">
        {block.search_results.results.slice(0, 5).map((item, i) => (
          <div
            key={i}
            className="rounded-[var(--radius-md)] border px-3 py-2"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <p
              className="text-[13px] font-medium"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}
            >
              {item.title}
            </p>
            <p
              className="mt-1 text-[12px]"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-muted)' }}
            >
              {item.snippet}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

// ── Persisted message ──────────────────────────────────────────────────────

function PersistedMessageView({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-2xl rounded-xl px-4 py-3 text-[15px]"
          style={{
            background: 'var(--color-surface-400)',
            fontFamily: 'var(--font-display)',
            color: 'var(--color-foreground)',
          }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-2xl">
        <p
          className="text-[16px] leading-relaxed"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-foreground)' }}
        >
          {message.content}
        </p>
      </div>
    </div>
  );
}

// ── Session sidebar item ───────────────────────────────────────────────────

interface SessionLike {
  id: string;
  title: string;
  created_at: string;
  last_message_preview: string | null;
}

function SessionItem({
  session,
  isActive,
  onClick,
}: {
  session: SessionLike;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-[var(--radius-lg)] px-3 py-2 text-left transition-colors"
      style={{
        background: isActive ? 'var(--color-surface-400)' : 'transparent',
        borderLeft: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
      }}
    >
      <p
        className="truncate text-[13px] font-medium"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}
      >
        {session.title || 'Untitled'}
      </p>
      {session.last_message_preview && (
        <p
          className="mt-0.5 truncate text-[11px]"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-muted)' }}
        >
          {session.last_message_preview}
        </p>
      )}
    </button>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function ChatSessionPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;
  const router = useRouter();
  const companyId = useCurrentCompanyId();

  const { data: sessionsData } = useChatSessions(companyId);
  const sessions = sessionsData?.sessions ?? [];
  const createSession = useCreateSession(companyId);

  const { messages, invalidate, isLoading: messagesLoading } = useChatMessages(
    sessionId,
    companyId,
  );

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

  // SSE abort cleanup — CRITICAL
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage, pendingUserMessage]);

  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || !sessionId || isStreaming) return;
    setInputValue('');
    await send(sessionId, text, companyId);
  }, [inputValue, sessionId, isStreaming, send, companyId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleNewChat = async () => {
    const session = await createSession.mutateAsync({});
    router.push(`/chat/${session.id}`);
  };

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">
      {/* Sidebar */}
      <aside
        className="hidden w-[220px] shrink-0 flex-col border-r md:flex"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-100)' }}
      >
        <div
          className="flex items-center justify-between px-3 py-3"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <span
            className="text-[12px] font-medium uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}
          >
            Chats
          </span>
          <button
            onClick={() => void handleNewChat()}
            className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:opacity-80"
            style={{ background: 'var(--color-surface-300)' }}
            title="New chat"
          >
            <MessageSquarePlus
              className="h-3.5 w-3.5"
              style={{ color: 'var(--color-foreground)' }}
            />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {sessions.map((s) => (
            <SessionItem
              key={s.id}
              session={s}
              isActive={s.id === sessionId}
              onClick={() => router.push(`/chat/${s.id}`)}
            />
          ))}
        </div>
      </aside>

      {/* Main chat area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-[720px] space-y-6">
            {messagesLoading && (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-12 animate-pulse rounded-[var(--radius-lg)]"
                    style={{ background: 'var(--color-surface-300)' }}
                  />
                ))}
              </div>
            )}

            {messages.map((msg) => (
              <PersistedMessageView key={msg.id} message={msg} />
            ))}

            {/* Pending user message (optimistic) */}
            {pendingUserMessage && (
              <div className="flex justify-end">
                <div
                  className="max-w-2xl rounded-xl px-4 py-3 text-[15px]"
                  style={{
                    background: 'var(--color-surface-400)',
                    fontFamily: 'var(--font-display)',
                    color: 'var(--color-foreground)',
                  }}
                >
                  {pendingUserMessage}
                </div>
              </div>
            )}

            {/* Pipeline step pills */}
            {pipelineSteps.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {pipelineSteps.map((step, idx) => (
                  <span
                    key={idx}
                    className="rounded-full px-3 py-1 text-[11px] font-medium"
                    style={{
                      background: stepColor(step.stepName),
                      color: '#fff',
                      fontFamily: 'var(--font-mono)',
                      opacity: step.status === 'completed' ? 0.65 : 1,
                    }}
                  >
                    {step.stepName}
                    {step.status === 'running' && '…'}
                    {step.durationMs !== undefined && step.status === 'completed' && (
                      <span className="ml-1 opacity-75">
                        {step.durationMs < 1000
                          ? `${step.durationMs}ms`
                          : `${(step.durationMs / 1000).toFixed(1)}s`}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            )}

            {/* Streaming AI response */}
            {streamingMessage && (
              <div className="flex justify-start">
                <div className="max-w-2xl space-y-2">
                  {streamingMessage.contentBlocks.map((block, idx) => {
                    if (block.type === 'text') {
                      const isLastBlock = idx === streamingMessage.contentBlocks.length - 1;
                      return (
                        <StreamingTextBlock
                          key={idx}
                          text={block.text ?? ''}
                          isStreaming={streamingMessage.isStreaming && isLastBlock}
                        />
                      );
                    }
                    return <ContentBlockView key={idx} block={block} />;
                  })}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                className="rounded-[var(--radius-lg)] border px-4 py-3 text-[14px]"
                style={{
                  background: 'rgba(207,45,86,0.06)',
                  borderColor: 'rgba(207,45,86,0.2)',
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--color-error)',
                }}
              >
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area — pinned to bottom */}
        <div
          className="border-t px-6 py-4"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-background)',
          }}
        >
          <div className="mx-auto max-w-[720px]">
            <div
              className="flex items-end gap-3 rounded-[var(--radius-xl)] border px-4 py-3"
              style={{
                background: 'var(--color-surface-100)',
                borderColor: 'var(--color-border)',
              }}
            >
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question… (Shift+Enter for new line)"
                rows={1}
                disabled={isStreaming}
                className="flex-1 resize-none bg-transparent text-[15px] outline-none disabled:opacity-50"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--color-foreground)',
                  lineHeight: 1.5,
                  maxHeight: '120px',
                  overflowY: 'auto',
                }}
              />

              {isStreaming ? (
                <button
                  onClick={cancel}
                  className="flex shrink-0 items-center gap-1.5 rounded-[var(--radius-lg)] px-3 py-2 text-[13px] transition-colors hover:opacity-80"
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
                  onClick={() => void handleSend()}
                  disabled={!inputValue.trim() || isStreaming}
                  className="flex shrink-0 items-center gap-1.5 rounded-[var(--radius-lg)] px-3 py-2 text-[13px] transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    background: 'var(--color-foreground)',
                    color: 'var(--color-background)',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  <Send className="h-3.5 w-3.5" />
                  Send
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
