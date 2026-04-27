/**
 * Module-level map for passing an initial query from the new-chat page to the
 * session page. Keyed by sessionId so concurrent sessions don't collide.
 * Not persisted — lives only for the duration of the client-side navigation.
 */
const pending = new Map<string, string>();

export function setPendingChatQuery(sessionId: string, query: string) {
  pending.set(sessionId, query);
}

export function consumePendingChatQuery(sessionId: string): string | undefined {
  const q = pending.get(sessionId);
  pending.delete(sessionId);
  return q;
}
