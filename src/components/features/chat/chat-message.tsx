'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Copy, Check, RotateCcw } from 'lucide-react';
import type { ChatMessage, MessageContentBlock } from '@/types/chat';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeUp, staggerContainer, staggerItem } from '@/lib/motion';
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

function MessageActions({
  content,
  onReRun,
  createdAt
}: {
  content: string;
  onReRun?: () => void;
  createdAt?: string;
}) {
  const t = useTranslations('dashboard.chat.message');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center gap-1 rounded-md border border-border bg-surface-200 p-0.5 shadow-sm">
      <button
        onClick={handleCopy}
        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-sm text-fg-subtle transition-colors hover:bg-surface-400 hover:text-foreground"
        title={t('copyMessage')}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-accent" strokeWidth={2.5} />
        ) : (
          <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
        )}
      </button>
      {onReRun && (
        <button
          onClick={onReRun}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-sm text-fg-subtle transition-colors hover:bg-surface-400 hover:text-foreground"
          title={t('reRunQuery')}
        >
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      )}
      {createdAt && (
        <span className="px-2 font-mono text-[10px] tabular-nums text-muted/60 select-none border-l border-border/50 ml-1">
          {formatTime(createdAt)}
        </span>
      )}
    </div>
  );
}

export function UserMessage({
  content,
  createdAt,
  onReRun,
}: {
  content: string;
  createdAt?: string;
  onReRun?: () => void;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="group flex flex-col items-end gap-1.5"
    >
      <div className="max-w-[85%] rounded-2xl border border-border/50 bg-surface-200 px-4 py-3 shadow-sm transition-colors group-hover:border-border">
        <p className="whitespace-pre-wrap font-sans text-subheading leading-[1.65] text-foreground">
          {content}
        </p>
      </div>
      
      <div className="flex items-center gap-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <MessageActions content={content} onReRun={onReRun} createdAt={createdAt} />
      </div>
    </motion.div>
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
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="group flex gap-4"
    >
      <div className="mt-1 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-200 shadow-sm">
          <Image
            src="/logo/esaplogo.webp"
            alt="ESAP"
            width={20}
            height={20}
            className="opacity-90"
          />
        </div>
      </div>
      
      <div className="min-w-0 flex-1">
        <div className="space-y-4 border-l-2 border-accent/15 pl-5">
          <div className="prose-custom prose-sm max-w-none text-foreground leading-[1.7]">
            <MarkdownContent>{content}</MarkdownContent>
          </div>
          
          {blocks && blocks.length > 0 && (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-5"
            >
              {blocks.map((block, idx) => (
                <motion.div key={idx} variants={staggerItem}>
                  <ContentBlockView block={block} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        <div className="mt-2.5 flex items-center gap-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <MessageActions content={content} createdAt={createdAt} />
        </div>
      </div>
    </motion.div>
  );
}

export function ChatMessageView({ 
  message, 
  onReRun 
}: { 
  message: ChatMessage;
  onReRun?: () => void;
}) {
  if (message.role === 'user') {
    return <UserMessage content={message.content} createdAt={message.created_at} onReRun={onReRun} />;
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
