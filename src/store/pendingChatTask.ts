/**
 * Module-level store for the task_id produced when a message is sent before
 * navigating to the session page. Keyed by sessionId.
 *
 * Unlike pendingChatQuery (consumed once), this entry persists until the stream
 * completes so that a React Strict Mode remount can reconnect to the in-progress
 * SSE task instead of sending a duplicate POST.
 */
const pending = new Map<string, { taskId: string; userMessage: string }>();

export function setPendingTask(
  sessionId: string,
  task: { taskId: string; userMessage: string },
) {
  pending.set(sessionId, task);
}

export function getPendingTask(
  sessionId: string,
): { taskId: string; userMessage: string } | undefined {
  return pending.get(sessionId);
}

export function clearPendingTask(sessionId: string) {
  pending.delete(sessionId);
}
