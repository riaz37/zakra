'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useChatSessions } from '@/hooks/useChatSessions';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/shared/skeleton';
import { ChatSession } from '@/types/chat';

function groupSessions(sessions: ChatSession[]) {
  const today: ChatSession[] = [];
  const yesterday: ChatSession[] = [];
  const previous7Days: ChatSession[] = [];
  const older: ChatSession[] = [];

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  
  const sevenDaysAgo = new Date(todayStart);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  sessions.forEach((session) => {
    const sessionDate = new Date(session.created_at);
    if (sessionDate >= todayStart) {
      today.push(session);
    } else if (sessionDate >= yesterdayStart) {
      yesterday.push(session);
    } else if (sessionDate >= sevenDaysAgo) {
      previous7Days.push(session);
    } else {
      older.push(session);
    }
  });

  return { today, yesterday, previous7Days, older };
}

export function ChatSidebar() {
  const router = useRouter();
  const params = useParams<{ sessionId: string }>();
  const activeSessionId = params?.sessionId;
  const companyId = useCurrentCompanyId();
  
  const { data, isLoading } = useChatSessions(companyId);
  const sessions = data?.sessions ?? [];

  const { today, yesterday, previous7Days, older } = groupSessions(sessions);

  const renderGroup = (title: string, groupSessions: ChatSession[]) => {
    if (groupSessions.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="mb-2 px-4 font-mono text-[10px] font-semibold text-fg-subtle/60 uppercase tracking-widest">
          {title}
        </h3>
        <ul className="space-y-0.5 px-2">
          {groupSessions.map((session) => {
            const isActive = activeSessionId === session.id;
            return (
              <li key={session.id}>
                <Link
                  href={`/chat/${session.id}`}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-md px-3 py-2 text-body transition-all duration-200',
                    isActive
                      ? 'bg-accent/10 text-accent font-medium'
                      : 'text-fg-muted hover:bg-surface-300 hover:text-foreground'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute left-0 h-4 w-0.5 rounded-full bg-accent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
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
    <div className="flex h-full flex-col border-r border-border bg-surface-100">
      <div className="p-4 border-b border-border/50">
        <button
          onClick={() => router.push('/chat')}
          className="flex w-full cursor-pointer items-center justify-center rounded-lg bg-accent px-4 py-2.5 font-sans text-button font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-accent/90 hover:shadow-md active:scale-[0.98]"
        >
          New chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-surface-400 scrollbar-track-transparent hover:scrollbar-thumb-surface-500">
        {!companyId && (
          <div className="px-4 py-6 text-center text-body text-fg-muted">
            Select a company to view chat history.
          </div>
        )}

        {isLoading && companyId && (
          <div className="mt-2 space-y-6 px-4">
            {/* Today group */}
            <div>
              <Skeleton className="mb-3 h-2.5 w-10" />
              <div className="space-y-1">
                {[0.75, 1, 0.6].map((w, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2">
                    <Skeleton className="h-4 w-4 shrink-0" />
                    <Skeleton className="h-3.5" style={{ width: `${w * 100}%` }} />
                  </div>
                ))}
              </div>
            </div>
            {/* Previous 7 Days group */}
            <div>
              <Skeleton className="mb-3 h-2.5 w-20" />
              <div className="space-y-1">
                {[0.85, 0.55].map((w, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2">
                    <Skeleton className="h-4 w-4 shrink-0" />
                    <Skeleton className="h-3.5" style={{ width: `${w * 100}%` }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!isLoading && sessions.length === 0 && companyId && (
          <div className="px-4 py-6 text-center text-body text-fg-muted">
            No past conversations found.
          </div>
        )}

        {!isLoading && sessions.length > 0 && (
          <>
            {renderGroup('Today', today)}
            {renderGroup('Yesterday', yesterday)}
            {renderGroup('Previous 7 Days', previous7Days)}
            {renderGroup('Older', older)}
          </>
        )}
      </div>
    </div>
  );
}
