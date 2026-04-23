'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useChatSessions, useCreateSession } from '@/hooks/useChatSessions';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { useDbConnections } from '@/hooks/useDbConnections';
import { MessageSquarePlus, Plus } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { cn } from '@/lib/utils';

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

const DELAY_CLASSES = [
  'animation-delay-50',
  'animation-delay-100',
  'animation-delay-150',
  'animation-delay-200',
  'animation-delay-300',
];

export default function ChatPage() {
  const router = useRouter();
  const companyId = useCurrentCompanyId();
  const { data, isLoading } = useChatSessions(companyId);
  const createSession = useCreateSession(companyId);

  const sessions = data?.sessions ?? [];
  const { data: connectionsData, isLoading: connectionsLoading } =
    useDbConnections(
      companyId ? { company_id: companyId, page: 1, page_size: 1 } : undefined,
    );
  const showDbBanner =
    !connectionsLoading && (connectionsData?.total ?? 0) === 0 && !!companyId;

  const handleNewChat = async () => {
    if (!companyId) {
      toast.error('Select a company before starting a chat.');
      return;
    }
    const session = await createSession.mutateAsync({});
    router.push(`/chat/${session.id}`);
  };

  return (
    <div className="mx-auto max-w-[760px] px-6 py-10">
      {/* Header */}
      <header className="mb-8 flex items-end justify-between border-b border-border pb-5 animate-fade-up">
        <div>
          <h1 className="font-sans text-[28px] font-normal leading-[1.2] tracking-[-0.56px] text-foreground">
            Chat
          </h1>
          <p className="mt-1.5 font-sans text-caption text-muted">
            Conversations with your data
          </p>
        </div>

        <button
          onClick={() => void handleNewChat()}
          disabled={createSession.isPending}
          className={cn(
            'flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 font-sans text-button font-medium text-[#111] transition-colors duration-150',
            'hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <MessageSquarePlus className="h-4 w-4" aria-hidden />
          New chat
        </button>
      </header>

      {/* No company selected banner */}
      {!companyId && (
        <div className="mb-6 flex items-start gap-4 rounded-lg border border-border bg-surface-200 px-5 py-4 animate-fade-up">
          <div className="flex-1">
            <p className="font-sans text-button font-medium text-foreground">
              No company selected
            </p>
            <p className="mt-1 font-sans text-caption text-muted">
              Select a company from the switcher to view and start
              conversations.
            </p>
          </div>
        </div>
      )}

      {/* No DB connection banner */}
      {showDbBanner && (
        <div className="mb-6 flex items-start gap-4 rounded-lg border border-border bg-surface-200 px-5 py-4 animate-fade-up">
          <div className="flex-1">
            <p className="font-sans text-button font-medium text-foreground">
              Connect a database to start querying data
            </p>
            <p className="mt-1 font-sans text-caption text-muted">
              Chat can answer questions about your data once a database
              connection is added.
            </p>
          </div>
          <Link
            href="/db-connections"
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 font-sans text-button font-medium text-[#111] transition-colors duration-150 hover:bg-accent/90"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Add connection
          </Link>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[72px] rounded-lg"
              style={{
                background:
                  'linear-gradient(90deg, var(--color-surface-200) 25%, var(--color-surface-300) 50%, var(--color-surface-200) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && sessions.length === 0 && companyId && (
        <EmptyState
          title="Start your first conversation"
          description="Ask questions about your data in plain language. Queries become SQL, results stream back, and your history lives here."
          action={
            <button
              onClick={() => void handleNewChat()}
              disabled={createSession.isPending}
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-sans text-button font-medium text-[#111] transition-colors duration-150 hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MessageSquarePlus className="h-4 w-4" aria-hidden />
              New chat
            </button>
          }
        />
      )}

      {/* Sessions list */}
      {!isLoading && sessions.length > 0 && (
        <ul className="space-y-2">
          {sessions.map((session, i) => (
            <li
              key={session.id}
              className={cn(
                'animate-fade-up',
                DELAY_CLASSES[i] ?? 'animation-delay-300',
              )}
            >
              <button
                onClick={() => router.push(`/chat/${session.id}`)}
                className={cn(
                  'w-full rounded-lg border border-border bg-surface-200 px-4 py-3 text-left',
                  'transition-colors duration-150 hover:bg-surface-300 focus-visible:outline-none',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans text-button font-medium text-foreground">
                      {session.title || 'Untitled conversation'}
                    </p>
                    {session.last_message_preview && (
                      <p className="mt-1 truncate font-sans text-caption text-muted">
                        {session.last_message_preview}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 font-mono text-mono-sm text-muted">
                    {formatRelative(session.created_at)}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
