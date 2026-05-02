export function UserQueryBubble({ query }: { query: string }) {
  return (
    <div className="flex justify-end animate-slide-in-bottom">
      <div className="max-w-[78%] rounded-xl border border-border bg-surface-300 px-4 py-2.5 shadow-[var(--shadow-ring)]">
        <p className="whitespace-pre-wrap font-sans text-subheading leading-[1.65] text-foreground">
          {query}
        </p>
      </div>
    </div>
  );
}
