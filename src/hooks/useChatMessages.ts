/**
 * React Query hook for paginated chat message loading.
 */

import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
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
    staleTime: 10_000,
  });

  const invalidate = () => {
    return queryClient.invalidateQueries({ queryKey: ['chat-messages', sessionId] });
  };

  // Flatten all pages into a single messages array
  const messages = query.data?.pages.flatMap((page) => page.messages) ?? [];

  return {
    ...query,
    messages,
    invalidate,
  };
}
