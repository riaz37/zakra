/**
 * React Query hooks for chat session CRUD.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as chatApi from '../api/chat';
import type { ChatSessionCreate, ChatSessionUpdate } from '../types/chat';

const SESSIONS_KEY = ['chat-sessions'];

export function useChatSessions(companyId?: string) {
  return useQuery({
    queryKey: [...SESSIONS_KEY, companyId],
    queryFn: () => chatApi.listSessions(0, 200, companyId),
    staleTime: 30_000,
  });
}

export function useChatSession(sessionId: string | undefined, companyId?: string) {
  return useQuery({
    queryKey: ['chat-session', sessionId, companyId],
    queryFn: () => chatApi.getSession(sessionId!, companyId),
    enabled: !!sessionId,
  });
}

export function useCreateSession(companyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ChatSessionCreate) => chatApi.createSession(data, companyId),
    onSuccess: (newSession) => {
      // Optimistically prepend the new session to the cache instead of
      // refetching all sessions. A full refetch can trigger sidebar
      // re-renders that race with navigation to the new chat URL.
      queryClient.setQueriesData<{ sessions: typeof newSession[] }>(
        { queryKey: SESSIONS_KEY },
        (old) => {
          if (!old) return { sessions: [newSession] };
          return { sessions: [newSession, ...old.sessions] };
        },
      );
    },
  });
}

export function useUpdateSession(companyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      data,
    }: {
      sessionId: string;
      data: ChatSessionUpdate;
    }) => chatApi.updateSession(sessionId, data, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
    },
  });
}

export function useDeleteSession(companyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => chatApi.deleteSession(sessionId, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
    },
  });
}
