"use client";

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ZakraMark } from "@/components/admin/zakra-mark";
import { useCreateSession } from "@/hooks/useChatSessions";
import { useCurrentCompanyId } from "@/hooks/useCurrentCompany";
import { toast } from "sonner";

const SUGGESTIONS = [
  "Show me the 10 largest accounts by MRR this quarter.",
  "How has week-2 retention shifted over the last 8 cohorts?",
  "Break down open invoices into 30 / 60 / 90+ day buckets.",
  "Summarize the heaviest queries from pg_stat_statements this week.",
];

export function ChatEmptyState() {
  const router = useRouter();
  const companyId = useCurrentCompanyId();
  const createSession = useCreateSession(companyId);

  const handleStart = async (seed?: string) => {
    try {
      const session = await createSession.mutateAsync({
        title: seed ? seed.slice(0, 64) : undefined,
      });
      const url = seed
        ? `/chat/${session.id}?prompt=${encodeURIComponent(seed)}`
        : `/chat/${session.id}`;
      router.push(url);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create session",
      );
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center px-8 py-10">
      <div className="flex w-full max-w-[560px] flex-col items-center text-center">
        <ZakraMark size={44} />
        <h2 className="mt-5 font-display text-[22px] font-semibold leading-[28px] -tracking-[0.01em] text-[var(--fg)]">
          Start a new conversation
        </h2>
        <p className="mt-1.5 max-w-[42ch] text-[14px] leading-[22px] text-[var(--fg-muted)]">
          Ask questions about your data. The assistant has read access to every
          connection you&rsquo;ve configured for this workspace.
        </p>

        <button
          type="button"
          onClick={() => handleStart()}
          disabled={createSession.isPending || !companyId}
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-[var(--radius-btn)] bg-[var(--primary)] px-4 text-[14px] font-medium text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {createSession.isPending ? (
            <Loader2 className="size-4 animate-spin" strokeWidth={1.75} />
          ) : null}
          New chat
        </button>

        <div className="mt-10 w-full">
          <div className="caption-upper mb-3 text-left">Try</div>
          <ul className="flex flex-col gap-1.5 text-left">
            {SUGGESTIONS.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => handleStart(s)}
                  disabled={createSession.isPending}
                  className="block w-full rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[13px] leading-[18px] text-[var(--fg)] transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
