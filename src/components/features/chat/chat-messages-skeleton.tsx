'use client';

import { Skeleton } from '@/components/shared/skeleton';

export function ChatMessagesSkeleton() {
  return (
    <div className="space-y-6 pt-4">
      {/* Assistant Skeleton */}
      <div className="flex gap-3">
        <div className="mt-0.5 shrink-0">
          <Skeleton className="h-[22px] w-[22px] rounded-full" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4 rounded-md" />
          <Skeleton className="h-4 w-1/2 rounded-md" />
        </div>
      </div>

      {/* User Skeleton */}
      <div className="flex justify-end">
        <div className="max-w-[75%] w-[400px] rounded-2xl border border-border bg-surface-300 px-4 py-3">
          <Skeleton className="h-4 w-full rounded-md" />
        </div>
      </div>

      {/* Assistant Skeleton */}
      <div className="flex gap-3">
        <div className="mt-0.5 shrink-0">
          <Skeleton className="h-[22px] w-[22px] rounded-full" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-5/6 rounded-md" />
          <Skeleton className="h-4 w-4/6 rounded-md" />
          <Skeleton className="h-4 w-2/6 rounded-md" />
        </div>
      </div>
    </div>
  );
}
