export function UserQueryBubble({ query }: { query: string }) {
  return (
    <div className="flex justify-end animate-slide-in-bottom">
      <div className="max-w-[78%] rounded-2xl border border-border/60 bg-surface-300 px-4 py-2.5 shadow-[var(--shadow-ring)]">
        <p className="whitespace-pre-wrap font-sans text-[15px] leading-[1.65] text-foreground">
          {query}
        </p>
      </div>
    </div>
  );
}
