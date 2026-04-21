"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useChatSessions,
  useCreateSession,
  useDeleteSession,
} from "@/hooks/useChatSessions";
import { formatRelativeTime } from "@/utils/formatters";
import { cn } from "@/lib/utils";

interface SessionListProps {
  companyId: string | undefined;
  activeSessionId: string | null;
}

export function SessionList({ companyId, activeSessionId }: SessionListProps) {
  const router = useRouter();
  const sessions = useChatSessions(companyId);
  const createSession = useCreateSession(companyId);
  const deleteSession = useDeleteSession(companyId);
  const [search, setSearch] = useState("");

  const items = sessions.data?.sessions ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((s) => {
      const title = s.title?.toLowerCase() ?? "";
      const preview = s.last_message_preview?.toLowerCase() ?? "";
      return title.includes(q) || preview.includes(q);
    });
  }, [items, search]);

  const handleCreate = async () => {
    try {
      const session = await createSession.mutateAsync({});
      router.push(`/chat/${session.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create session");
    }
  };

  const handleDelete = async (
    e: React.MouseEvent<HTMLButtonElement>,
    id: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await deleteSession.mutateAsync(id);
      toast.success("Chat deleted");
      if (activeSessionId === id) {
        router.push("/chat");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete chat");
    }
  };

  return (
    <aside
      className="flex w-[260px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)]"
      aria-label="Chat sessions"
    >
      <div className="p-3">
        <button
          type="button"
          onClick={handleCreate}
          disabled={createSession.isPending || !companyId}
          className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-[var(--radius-btn)] bg-[var(--primary)] px-3 text-[13px] font-medium text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {createSession.isPending ? (
            <Loader2 className="size-3.5 animate-spin" strokeWidth={1.75} />
          ) : (
            <Plus className="size-3.5" strokeWidth={1.75} />
          )}
          New chat
        </button>
      </div>

      <div className="px-3 pb-2">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[var(--fg-subtle)]"
            strokeWidth={1.75}
          />
          <input
            type="search"
            placeholder="Search chats"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full rounded-[var(--radius-input)] border border-[var(--border-strong)] bg-[var(--surface)] pl-8 pr-2 text-[13px] text-[var(--fg)] placeholder:text-[var(--fg-subtle)] focus:border-[var(--primary)] focus:outline-none focus:ring-3 focus:ring-[var(--ring)]"
          />
        </div>
      </div>

      <div className="min-h-0 grow overflow-y-auto px-2 pb-3">
        {sessions.isLoading ? (
          <SessionsSkeleton />
        ) : filtered.length === 0 ? (
          <div className="px-3 py-8 text-center text-[12px] text-[var(--fg-subtle)]">
            {search ? "No matches." : "No chats yet. Start a new conversation."}
          </div>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {filtered.map((s) => {
              const isActive = s.id === activeSessionId;
              return (
                <li key={s.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push(`/chat/${s.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(`/chat/${s.id}`);
                      }
                    }}
                    className={cn(
                      "group relative block w-full cursor-pointer rounded-[8px] px-3 py-2.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                      isActive
                        ? "bg-[var(--primary-soft)]"
                        : "hover:bg-[var(--surface-muted)]",
                    )}
                  >
                    {isActive && (
                      <span
                        aria-hidden
                        className="absolute left-[-6px] top-2 bottom-2 w-[2px] rounded-full bg-[var(--primary)]"
                      />
                    )}
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "min-w-0 grow truncate text-[13px] font-medium",
                          isActive
                            ? "text-[var(--primary)]"
                            : "text-[var(--fg)]",
                        )}
                      >
                        {s.title || "Untitled chat"}
                      </div>
                      <button
                        type="button"
                        aria-label="Delete chat"
                        onClick={(e) => handleDelete(e, s.id)}
                        className="invisible inline-flex size-6 items-center justify-center rounded-md text-[var(--fg-subtle)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--destructive)] group-hover:visible"
                      >
                        <Trash2 className="size-3.5" strokeWidth={1.75} />
                      </button>
                    </div>
                    {s.last_message_preview && (
                      <div
                        className={cn(
                          "mt-1 truncate text-[12px] leading-[16px]",
                          isActive
                            ? "text-[var(--primary)]/80"
                            : "text-[var(--fg-muted)]",
                        )}
                      >
                        {s.last_message_preview}
                      </div>
                    )}
                    <div className="mt-1 text-[11px] text-[var(--fg-subtle)]">
                      {formatRelativeTime(s.updated_at)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}

function SessionsSkeleton() {
  return (
    <ul className="flex flex-col gap-1 px-1 py-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="px-2 py-2.5">
          <span className="skel h-3.5 w-3/4" />
          <span className="skel mt-2 h-3 w-5/6" />
          <span className="skel mt-2 h-2.5 w-1/3" />
        </li>
      ))}
    </ul>
  );
}
