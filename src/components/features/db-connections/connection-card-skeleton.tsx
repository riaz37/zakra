export function ConnectionCardSkeleton() {
  return (
    <div
      className="animate-pulse rounded-lg border border-border bg-background p-4"
      aria-hidden="true"
    >
      <div className="flex items-start gap-2.5">
        <div className="h-8 w-8 shrink-0 rounded-md bg-surface-300" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded bg-surface-300" />
          <div className="h-3 w-40 rounded bg-surface-300" />
        </div>
        <div className="h-5 w-14 rounded-full bg-surface-300" />
      </div>
      <div className="mt-3 flex justify-between">
        <div className="h-3 w-28 rounded bg-surface-300" />
        <div className="h-6 w-24 rounded bg-surface-300" />
      </div>
    </div>
  );
}
