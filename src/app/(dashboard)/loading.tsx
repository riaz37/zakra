import { Skeleton } from '@/components/shared/skeleton';

export default function DashboardLoading() {
  return (
    <div className="px-6 py-8">
      {/* PageHeader skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-9 w-28" />
      </div>

      {/* Search bar skeleton */}
      <Skeleton className="mb-4 h-9 w-64" />

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="border-b border-border bg-surface-200/50 px-4 py-3">
          <div className="flex gap-8">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-border px-4 py-4 last:border-0"
          >
            <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="ml-4 h-4 w-28" />
            <Skeleton className="ml-auto h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
