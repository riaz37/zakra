'use client';

import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
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

function Cursor() {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0.4] }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="ml-1 inline-block h-4 w-1.5 translate-y-0.5 rounded-[1px] bg-accent/60"
      aria-hidden
    />
  );
}

export const StreamingTextBlock = memo(function StreamingTextBlock({
  text,
  isStreaming = false,
  className,
}: StreamingTextBlockProps) {
  if (!text && isStreaming) {
    return (
      <div className="flex items-center py-1">
        <Cursor />
      </div>
    );
  }

  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={streamingComponents}>
        {normalizeMarkdown(text)}
      </ReactMarkdown>
      {isStreaming && <Cursor />}
    </div>
  );
});
