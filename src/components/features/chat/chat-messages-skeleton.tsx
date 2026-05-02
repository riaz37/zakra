'use client';

import { SkeletonAvatar, SkeletonText } from '@/components/shared/skeleton';
import { Skeleton } from '@/components/shared/skeleton';

export function ChatMessagesSkeleton() {
  return (
    <div className="space-y-6 pt-2">
      {/* User bubble */}
      <div className="flex justify-end">
        <div className="max-w-[75%] w-[360px] rounded-xl border border-border bg-surface-300 px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </div>
      </div>

      {/* Assistant reply */}
      <div className="flex gap-3">
        <SkeletonAvatar size={22} />
        <div className="min-w-0 flex-1 pt-0.5">
          <SkeletonText lines={3} lastLineWidth="w-2/5" />
        </div>
      </div>

      {/* User bubble */}
      <div className="flex justify-end">
        <div className="max-w-[75%] w-[280px] rounded-xl border border-border bg-surface-300 px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </div>
      </div>

      {/* Assistant reply */}
      <div className="flex gap-3">
        <SkeletonAvatar size={22} />
        <div className="min-w-0 flex-1 pt-0.5">
          <SkeletonText lines={2} lastLineWidth="w-3/5" />
        </div>
      </div>
    </div>
  );
}
