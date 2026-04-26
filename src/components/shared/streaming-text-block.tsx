'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  buildMarkdownComponents,
  normalizeMarkdown,
} from '@/components/features/chat/markdown-content';

const streamingComponents = buildMarkdownComponents({
  bodySize: 'text-button',
  tables: false,
});

export interface StreamingTextBlockProps {
  text: string;
  isStreaming?: boolean;
  className?: string;
}

export function StreamingTextBlock({
  text,
  isStreaming = false,
  className,
}: StreamingTextBlockProps) {
  if (!text && isStreaming) {
    return (
      <div className="flex items-center py-0.5">
        <span
          className="inline-block h-[16px] w-[2px] rounded-sm bg-accent/60 animate-cursor-blink align-middle"
          aria-label="Generating response"
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={streamingComponents}>
        {normalizeMarkdown(text)}
      </ReactMarkdown>
      {isStreaming && (
        <span
          className="ml-0.5 inline-block h-[14px] w-[2px] rounded-sm bg-accent/50 animate-cursor-blink align-text-bottom"
          aria-hidden
        />
      )}
    </div>
  );
}
