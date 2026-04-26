'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Copy, Check } from 'lucide-react';
import type { ChatMessage, MessageContentBlock } from '@/types/chat';
import { MarkdownContent } from './markdown-content';
import { ContentBlockView } from './content-block-view';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function parseContentBlocks(metadata: Record<string, unknown>): MessageContentBlock[] | null {
  // Try structured content_blocks first
  try {
    const raw = metadata.content_blocks;
    if (Array.isArray(raw) && raw.length > 0) {
      const specialBlocks = (raw as MessageContentBlock[]).filter((b) => b.type !== 'text');
      if (specialBlocks.length > 0) return specialBlocks;
    }
  } catch { /* ignore */ }

  // Backend also stores query results directly in metadata_json (not inside content_blocks)
  if (
    typeof metadata.sql === 'string' &&
    Array.isArray(metadata.columns) &&
    Array.isArray(metadata.rows)
  ) {
    return [
      {
        type: 'query_result',
        query_result: {
          sql: metadata.sql,
          columns: metadata.columns as string[],
          rows: metadata.rows as Record<string, unknown>[],
          row_count: typeof metadata.row_count === 'number'
            ? metadata.row_count
            : (metadata.rows as unknown[]).length,
          execution_time_ms: typeof metadata.execution_time_ms === 'number'
            ? metadata.execution_time_ms
            : undefined,
          explanation: typeof metadata.explanation === 'string'
            ? metadata.explanation
            : undefined,
          confidence: typeof metadata.confidence === 'number'
            ? metadata.confidence
            : undefined,
          chart_config: metadata.chart_config != null
            ? (metadata.chart_config as Record<string, unknown>)
            : undefined,
        },
      },
    ];
  }

  return null;
}

// Backend streaming storage bug: content = t₁ + t₂ + … + tN (each tᵢ is the full
// accumulated text at that SSE event, so each is a prefix of the next). The longest
// segment between re-occurrences of the opening key is tN — the complete final text.
function deduplicateStreamContent(content: string): string {
  const KEY_LEN = 25;
  if (content.length <= KEY_LEN) return content;

  const key = content.slice(0, KEY_LEN);
  const positions: number[] = [];
  let pos = 0;
  while ((pos = content.indexOf(key, pos)) !== -1) {
    positions.push(pos);
    pos += 1;
  }

  if (positions.length <= 1) return content;

  let longest = '';
  for (let i = 0; i < positions.length; i++) {
    const end = i + 1 < positions.length ? positions[i + 1] : content.length;
    const seg = content.slice(positions[i], end);
    if (seg.length > longest.length) longest = seg;
  }
  return longest;
}

export function UserMessage({
  content,
  createdAt,
}: {
  content: string;
  createdAt?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group flex flex-col items-end gap-1 animate-slide-in-bottom">
      <div className="max-w-[78%] rounded-2xl border border-border/60 bg-surface-300 px-4 py-2.5 shadow-[var(--shadow-ring)]">
        <p className="whitespace-pre-wrap font-sans text-button leading-[1.65] text-foreground">
          {content}
        </p>
      </div>
      <div className="flex items-center gap-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        {createdAt && (
          <span className="font-mono text-mono-sm text-subtle">
            {formatTime(createdAt)}
          </span>
        )}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 font-mono text-mono-sm text-subtle transition-colors hover:text-muted"
          title="Copy message"
        >
          {copied ? (
            <Check className="h-3 w-3 text-accent/60" strokeWidth={2.5} />
          ) : (
            <Copy className="h-3 w-3" strokeWidth={2} />
          )}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

export function AssistantMessage({
  content,
  blocks,
  createdAt,
}: {
  content: string;
  blocks?: MessageContentBlock[] | null;
  createdAt?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group flex gap-3 animate-slide-in-bottom">
      <div className="mt-[3px] shrink-0">
        <Image
          src="/logo/esaplogo.webp"
          alt="ESAP"
          width={22}
          height={22}
          className="opacity-70"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="space-y-3 border-l-2 border-accent/[0.13] pl-3">
          <MarkdownContent>{content}</MarkdownContent>
          {blocks?.map((block, idx) => (
            <div key={idx} className="animate-fade-in animation-delay-100">
              <ContentBlockView block={block} />
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 font-mono text-mono-sm text-subtle transition-colors hover:text-muted"
            title="Copy response"
          >
            {copied ? (
              <Check className="h-3 w-3 text-accent/60" strokeWidth={2.5} />
            ) : (
              <Copy className="h-3 w-3" strokeWidth={2} />
            )}
            {copied ? 'Copied' : 'Copy'}
          </button>
          {createdAt && (
            <span className="font-mono text-mono-sm text-subtle">
              {formatTime(createdAt)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChatMessageView({ message }: { message: ChatMessage }) {
  if (message.role === 'user') {
    return <UserMessage content={message.content} createdAt={message.created_at} />;
  }
  const blocks = parseContentBlocks(message.metadata_json);
  return (
    <AssistantMessage
      content={deduplicateStreamContent(message.content)}
      blocks={blocks}
      createdAt={message.created_at}
    />
  );
}
