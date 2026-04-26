/**
 * React Query hook for paginated chat message loading.
 */

import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import * as chatApi from '../api/chat';

const PAGE_SIZE = 50;

export function useChatMessages(sessionId: string | undefined, companyId?: string) {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: ['chat-messages', sessionId, companyId],
    queryFn: ({ pageParam = 0 }) =>
      chatApi.listMessages(sessionId!, pageParam, PAGE_SIZE, companyId),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.has_more) {
        return allPages.reduce((acc, page) => acc + page.messages.length, 0);
      }
      return undefined;
    },
    enabled: !!sessionId,
    staleTime: Infinity,         // manually invalidated after each stream — no auto-refetch
    refetchOnWindowFocus: false, // prevents spurious refetches on tab focus
  });

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['chat-messages', sessionId] }),
    [queryClient, sessionId],
  );

  // Flatten all pages into a single messages array
  const messages = useMemo(
    () => query.data?.pages.flatMap((page) => page.messages) ?? [],
    [query.data],
  );

  return {
    ...query,
    messages,
    invalidate,
  };
}
