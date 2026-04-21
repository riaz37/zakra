"use client";

import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import type {
  ChatMessage,
  MessageContentBlock,
  StreamingMessage,
} from "@/types/chat";
import type { PipelineStep } from "@/hooks/useChatStream";
import { MessageContent } from "./message-content";
import { messageToBlocks } from "./message-to-blocks";

interface TranscriptProps {
  messages: ChatMessage[];
  isLoading: boolean;
  streamingMessage: StreamingMessage | null;
  pendingUserMessage: string | null;
  pipelineSteps: PipelineStep[];
  isStreaming: boolean;
  error: string | null;
}

export function Transcript({
  messages,
  isLoading,
  streamingMessage,
  pendingUserMessage,
  pipelineSteps,
  isStreaming,
  error,
}: TranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, streamingMessage, pendingUserMessage, isStreaming]);

  // Dedupe: if streaming has completed and a persisted assistant message
  // with similar content is present as the last message, prefer the persisted.
  const showStreamingMessage =
    streamingMessage &&
    (isStreaming || !isLastAssistantSimilar(messages, streamingMessage));

  const showPendingUser =
    pendingUserMessage &&
    !messages.some(
      (m) => m.role === "user" && m.content === pendingUserMessage,
    );

  return (
    <div ref={scrollRef} className="min-h-0 grow overflow-y-auto">
      <div className="mx-auto flex max-w-[920px] flex-col gap-5 px-6 py-8">
        {isLoading && messages.length === 0 ? (
          <TranscriptSkeleton />
        ) : (
          <>
            {messages.map((m) => {
              if (m.role === "user") {
                return <UserBubble key={m.id} text={m.content} />;
              }
              return (
                <AssistantBubble
                  key={m.id}
                  blocks={messageToBlocks(m)}
                  isStreaming={false}
                />
              );
            })}

            {showPendingUser && <UserBubble text={pendingUserMessage ?? ""} />}

            {pipelineSteps.length > 0 && isStreaming && (
              <PipelineProgress steps={pipelineSteps} />
            )}

            {showStreamingMessage && streamingMessage && (
              <AssistantBubble
                blocks={streamingMessage.contentBlocks}
                isStreaming={isStreaming}
              />
            )}

            {isStreaming && !streamingMessage && (
              <AssistantTyping />
            )}

            {error && (
              <div className="rounded-[10px] border border-[var(--destructive-soft)] bg-[var(--destructive-soft)] px-3.5 py-3 text-[13px] text-[var(--destructive)]">
                {error}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function isLastAssistantSimilar(
  messages: ChatMessage[],
  streaming: StreamingMessage,
): boolean {
  const last = messages[messages.length - 1];
  if (!last || last.role !== "assistant") return false;
  const streamedText = streaming.contentBlocks
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("");
  if (!streamedText) return true;
  return last.content.startsWith(streamedText.slice(0, 32));
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[75%] whitespace-pre-wrap rounded-[12px] bg-[var(--primary-soft)] px-4 py-2.5 text-[14px] leading-[22px] text-[var(--fg)]">
        {text}
      </div>
    </div>
  );
}

interface AssistantBubbleProps {
  blocks: MessageContentBlock[];
  isStreaming: boolean;
}

function AssistantBubble({ blocks, isStreaming }: AssistantBubbleProps) {
  return (
    <div className="flex gap-3">
      <span
        aria-hidden
        className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-[var(--primary-soft)] text-[var(--primary)]"
      >
        <Sparkles className="size-3.5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 grow rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-token-sm">
        <MessageContent blocks={blocks} />
        {isStreaming && (
          <span
            aria-hidden
            className="ml-0.5 inline-block h-[15px] w-[7px] translate-y-[2px] animate-pulse bg-[var(--primary)]"
          />
        )}
      </div>
    </div>
  );
}

function AssistantTyping() {
  return (
    <div className="flex gap-3">
      <span
        aria-hidden
        className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-[var(--primary-soft)] text-[var(--primary)]"
      >
        <Sparkles className="size-3.5" strokeWidth={1.75} />
      </span>
      <div className="inline-flex items-center gap-1.5 rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-token-sm">
        <TypingDot delay={0} />
        <TypingDot delay={180} />
        <TypingDot delay={360} />
      </div>
    </div>
  );
}

function TypingDot({ delay }: { delay: number }) {
  return (
    <span
      className="inline-block size-1.5 rounded-full bg-[var(--fg-subtle)] [animation:typing-pulse_1.2s_ease-in-out_infinite]"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}

function PipelineProgress({ steps }: { steps: PipelineStep[] }) {
  return (
    <div className="flex gap-3">
      <span
        aria-hidden
        className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-[var(--primary-soft)] text-[var(--primary)]"
      >
        <Sparkles className="size-3.5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 grow rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-token-sm">
        <div className="caption-upper mb-2 text-[11px]">Thinking</div>
        <ul className="flex flex-col gap-1.5">
          {steps.map((s) => (
            <li
              key={`${s.stepNumber}-${s.stepName}`}
              className="flex items-center gap-2 text-[12px]"
            >
              <StepDot status={s.status} />
              <span className="min-w-0 grow truncate text-[var(--fg)]">
                {s.stepName}
              </span>
              {s.status === "completed" && typeof s.durationMs === "number" && (
                <span className="font-mono text-[11px] text-[var(--fg-subtle)]">
                  {s.durationMs}ms
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StepDot({
  status,
}: {
  status: PipelineStep["status"];
}) {
  if (status === "completed") {
    return (
      <span
        aria-hidden
        className="inline-block size-2 shrink-0 rounded-full bg-[var(--primary)]"
      />
    );
  }
  if (status === "failed") {
    return (
      <span
        aria-hidden
        className="inline-block size-2 shrink-0 rounded-full bg-[var(--destructive)]"
      />
    );
  }
  // running
  return (
    <span
      aria-hidden
      className="inline-block size-2 shrink-0 rounded-full bg-[var(--primary)]"
      style={{ boxShadow: "0 0 0 3px var(--primary-soft)" }}
    />
  );
}

function TranscriptSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <span className="skel h-10 w-2/5 rounded-[12px]" />
      </div>
      <div className="flex gap-3">
        <span className="skel size-7 rounded-[8px]" />
        <div className="grow">
          <span className="skel h-3 w-4/5" />
          <span className="skel mt-2 h-3 w-3/5" />
          <span className="skel mt-2 h-3 w-2/5" />
        </div>
      </div>
    </div>
  );
}
