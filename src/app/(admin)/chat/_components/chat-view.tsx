"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useCurrentCompanyId } from "@/hooks/useCurrentCompany";
import {
  useChatSession,
  useCreateSession,
  useUpdateSession,
} from "@/hooks/useChatSessions";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useChatStream } from "@/hooks/useChatStream";
import { useUIStore } from "@/store/uiStore";
import { SessionList } from "./session-list";
import { Transcript } from "./transcript";
import { Composer } from "./composer";
import { ChatEmptyState } from "./empty-state";

interface ChatViewProps {
  sessionId: string | null;
}

export function ChatView({ sessionId }: ChatViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = useCurrentCompanyId();

  const session = useChatSession(sessionId ?? undefined, companyId);
  const messagesQuery = useChatMessages(sessionId ?? undefined, companyId);
  const updateSession = useUpdateSession(companyId);
  const createSession = useCreateSession(companyId);

  // All messages, oldest-first for display.
  const orderedMessages = useMemo(() => {
    const arr = [...messagesQuery.messages];
    arr.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    return arr;
  }, [messagesQuery.messages]);

  const stream = useChatStream({
    onComplete: () => {
      messagesQuery.invalidate();
    },
  });

  const [input, setInput] = useState("");
  const language = useUIStore((s) => s.reportLanguage);

  // When session changes, reset stream + composer.
  useEffect(() => {
    stream.reset();
    setInput("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Auto-consume ?prompt= seed (from empty-state "Try" suggestions).
  useEffect(() => {
    if (!sessionId) return;
    const seed = searchParams.get("prompt");
    if (!seed) return;
    setInput(seed);
    // clear the query param so it doesn't reapply on back-forward nav
    const url = new URL(window.location.href);
    url.searchParams.delete("prompt");
    window.history.replaceState({}, "", url.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    let targetSessionId = sessionId;

    // Create on the fly if the user somehow lands here without a session.
    if (!targetSessionId) {
      try {
        const created = await createSession.mutateAsync({
          title: trimmed.slice(0, 64),
        });
        targetSessionId = created.id;
        router.replace(`/chat/${created.id}`);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to start chat",
        );
        return;
      }
    }

    setInput("");

    // Auto-rename an untitled session on first message.
    if (
      session.data &&
      (!session.data.title || session.data.title === "New chat")
    ) {
      updateSession
        .mutateAsync({
          sessionId: targetSessionId,
          data: { title: trimmed.slice(0, 64) },
        })
        .catch(() => {
          // non-fatal
        });
    }

    stream.send(targetSessionId, trimmed, companyId, language);
  };

  const handleStop = () => {
    stream.cancel();
  };

  return (
    <div
      className="-mx-6 -mb-12 -mt-8 flex md:-mx-8 lg:-mx-10"
      style={{ height: "calc(100vh - var(--topbar-h))" }}
    >
      <SessionList companyId={companyId} activeSessionId={sessionId} />

      <div className="flex min-w-0 grow flex-col bg-[var(--bg)]">
        {!sessionId ? (
          <ChatEmptyState />
        ) : (
          <>
            <ChatHeader title={session.data?.title ?? "New chat"} />
            <Transcript
              messages={orderedMessages}
              isLoading={messagesQuery.isLoading}
              streamingMessage={stream.streamingMessage}
              pendingUserMessage={stream.pendingUserMessage}
              pipelineSteps={stream.pipelineSteps}
              isStreaming={stream.isStreaming}
              error={stream.error}
            />
            <Composer
              value={input}
              onChange={setInput}
              onSubmit={handleSend}
              onStop={handleStop}
              disabled={!companyId}
              isStreaming={stream.isStreaming}
            />
          </>
        )}
      </div>
    </div>
  );
}

function ChatHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-6 py-3">
      <h1 className="min-w-0 grow truncate font-display text-[15px] font-semibold leading-[22px] -tracking-[0.01em] text-[var(--fg)]">
        {title}
      </h1>
    </div>
  );
}
