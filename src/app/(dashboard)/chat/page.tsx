'use client';

import { useRouter } from 'next/navigation';
import { useChatSessions, useCreateSession } from '@/hooks/useChatSessions';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { MessageSquarePlus, MessageSquare } from 'lucide-react';

function formatRelative(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function ChatPage() {
  const router = useRouter();
  const companyId = useCurrentCompanyId();
  const { data, isLoading } = useChatSessions(companyId);
  const createSession = useCreateSession(companyId);

  const sessions = data?.sessions ?? [];

  const handleNewChat = async () => {
    const session = await createSession.mutateAsync({});
    router.push(`/chat/${session.id}`);
  };

  return (
    <div className="mx-auto max-w-[760px] px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1
            className="text-[28px]"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              letterSpacing: '-0.56px',
              color: 'var(--color-foreground)',
            }}
          >
            Chat
          </h1>
          <p
            className="mt-1 text-[15px]"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-muted)' }}
          >
            Conversations with your data
          </p>
        </div>

        <button
          onClick={() => void handleNewChat()}
          disabled={createSession.isPending}
          className="flex items-center gap-2 rounded-[var(--radius-lg)] px-4 py-2 text-[13px] transition-colors hover:opacity-90 disabled:opacity-50"
          style={{
            background: 'var(--color-foreground)',
            color: 'var(--color-background)',
            fontFamily: 'var(--font-display)',
          }}
        >
          <MessageSquarePlus className="h-4 w-4" />
          New Chat
        </button>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[72px] animate-pulse rounded-[var(--radius-lg)]"
              style={{ background: 'var(--color-surface-300)' }}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && sessions.length === 0 && (
        <div
          className="flex flex-col items-center rounded-[var(--radius-xl)] border px-8 py-16 text-center"
          style={{
            background: 'var(--color-surface-100)',
            borderColor: 'var(--color-border)',
          }}
        >
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{ background: 'var(--color-surface-400)' }}
          >
            <MessageSquare className="h-6 w-6" style={{ color: 'var(--color-muted)' }} />
          </span>
          <h2
            className="mt-4 text-[18px]"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}
          >
            Start your first conversation
          </h2>
          <p
            className="mt-2 max-w-[340px] text-[15px]"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-muted)' }}
          >
            Ask questions about your data in plain language.
          </p>
          <button
            onClick={() => void handleNewChat()}
            disabled={createSession.isPending}
            className="mt-6 flex items-center gap-2 rounded-[var(--radius-lg)] px-5 py-[10px] text-[14px] transition-colors hover:opacity-90 disabled:opacity-50"
            style={{
              background: 'var(--color-foreground)',
              color: 'var(--color-background)',
              fontFamily: 'var(--font-display)',
            }}
          >
            <MessageSquarePlus className="h-4 w-4" />
            New Chat
          </button>
        </div>
      )}

      {/* Sessions list */}
      {!isLoading && sessions.length > 0 && (
        <div className="space-y-2">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => router.push(`/chat/${session.id}`)}
              className="w-full rounded-[var(--radius-lg)] border px-4 py-3 text-left transition-colors hover:bg-[var(--color-surface-200)]"
              style={{
                background: 'var(--color-background)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-[14px] font-medium"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}
                  >
                    {session.title || 'Untitled conversation'}
                  </p>
                  {session.last_message_preview && (
                    <p
                      className="mt-1 truncate text-[13px]"
                      style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-muted)' }}
                    >
                      {session.last_message_preview}
                    </p>
                  )}
                </div>
                <span
                  className="shrink-0 text-[11px]"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}
                >
                  {formatRelative(session.created_at)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
