'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

export interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mb-4 mt-8 text-[24px] first:mt-0 font-sans font-semibold leading-[1.25] tracking-[-0.48px] text-foreground">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-3 mt-6 text-[20px] first:mt-0 font-sans font-semibold leading-[1.3] tracking-[-0.2px] text-foreground">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-5 text-[17px] first:mt-0 font-sans font-semibold leading-[1.35] text-foreground">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-4 text-[16px] last:mb-0 font-sans leading-[1.6] text-foreground">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 list-disc space-y-1 pl-6 text-[16px] font-sans text-foreground">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 list-decimal space-y-1 pl-6 text-[16px] font-sans text-foreground">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.includes('language-');
    if (isBlock) {
      return (
        <code className="block font-mono text-[13px] text-foreground">
          {children}
        </code>
      );
    }
    return (
      <code className="rounded px-[4px] py-[2px] text-[13px] font-mono bg-surface-300 text-foreground">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mb-4 overflow-x-auto rounded-[var(--radius-md)] p-3 text-[13px] font-mono bg-surface-300 text-foreground leading-[1.6]">
      {children}
    </pre>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-foreground">{children}</em>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-4 rounded-md bg-surface-200 px-4 py-2 italic text-[16px] text-muted font-sans leading-[1.6]">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-6 border-border" />,
};

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
