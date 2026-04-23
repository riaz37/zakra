'use client';

export function ChatMessagesSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-9 w-3/5 animate-pulse rounded-lg bg-surface-300" />
      <div className="ml-auto h-9 w-2/5 animate-pulse rounded-xl bg-surface-300" />
      <div className="space-y-1.5">
        <div className="h-4 w-full animate-pulse rounded bg-surface-300" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-surface-300" />
      </div>
    </div>
  );
}
