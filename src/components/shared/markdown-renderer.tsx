'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { buildMarkdownComponents } from '@/components/features/chat/markdown-content';

export interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const components = buildMarkdownComponents({ bodySize: 'text-[16px]' });

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
