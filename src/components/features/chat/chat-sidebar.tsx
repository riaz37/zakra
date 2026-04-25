'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useChatSessions } from '@/hooks/useChatSessions';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { MessageSquarePlus, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/shared/skeleton';
import { ChatSession } from '@/types/chat';

function groupSessions(sessions: ChatSession[]) {
  const today: ChatSession[] = [];
  const previous7Days: ChatSession[] = [];
  const older: ChatSession[] = [];

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(todayStart);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  sessions.forEach((session) => {
    const sessionDate = new Date(session.created_at);
    if (sessionDate >= todayStart) {
      today.push(session);
    } else if (sessionDate >= sevenDaysAgo) {
      previous7Days.push(session);
    } else {
      older.push(session);
    }
  });

  return { today, previous7Days, older };
}

export function ChatSidebar() {
  const router = useRouter();
  const params = useParams<{ sessionId: string }>();
  const activeSessionId = params?.sessionId;
  const companyId = useCurrentCompanyId();
  
  const { data, isLoading } = useChatSessions(companyId);
  const sessions = data?.sessions ?? [];

  const { today, previous7Days, older } = groupSessions(sessions);

  const renderGroup = (title: string, groupSessions: ChatSession[]) => {
    if (groupSessions.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
        <ul className="space-y-1 px-2">
          {groupSessions.map((session) => {
            const isActive = activeSessionId === session.id;
            return (
              <li key={session.id}>
                <Link
                  href={`/chat/${session.id}`}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-accent/10 text-accent font-medium'
                      : 'text-foreground hover:bg-surface-300'
                  )}
                >
                  <MessageSquare
                    className={cn(
                      'h-4 w-4 shrink-0',
                      isActive ? 'text-accent' : 'text-muted-foreground'
                    )}
                  />
                  <span className="truncate">{session.title || 'Untitled conversation'}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col border-r border-border bg-surface-200">
      <div className="p-4 border-b border-border">
        <button
          onClick={() => router.push('/chat')}
          className="flex w-full items-center justify-between rounded-lg bg-accent px-4 py-2.5 font-sans text-button font-medium text-[#111] transition-colors duration-150 hover:bg-accent/90"
        >
          <span>New chat</span>
          <MessageSquarePlus className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-surface-400 scrollbar-track-transparent hover:scrollbar-thumb-surface-500">
        {!companyId && (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            Select a company to view chat history.
          </div>
        )}

        {isLoading && companyId && (
          <div className="space-y-4 px-4 mt-2">
            <Skeleton className="h-3 w-16 mb-2" />
            <div className="space-y-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2">
                  <Skeleton className="h-4 w-4 shrink-0" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && sessions.length === 0 && companyId && (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            No past conversations found.
          </div>
        )}

        {!isLoading && sessions.length > 0 && (
          <>
            {renderGroup('Today', today)}
            {renderGroup('Previous 7 Days', previous7Days)}
            {renderGroup('Older', older)}
          </>
        )}
      </div>
    </div>
  );
}
