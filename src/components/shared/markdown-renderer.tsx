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
    <h1
      className="mb-4 mt-8 text-[24px] first:mt-0"
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        lineHeight: 1.25,
        letterSpacing: '-0.48px',
        color: 'var(--color-foreground)',
      }}
    >
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2
      className="mb-3 mt-6 text-[20px] first:mt-0"
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: '-0.2px',
        color: 'var(--color-foreground)',
      }}
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3
      className="mb-2 mt-5 text-[17px] first:mt-0"
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        lineHeight: 1.35,
        color: 'var(--color-foreground)',
      }}
    >
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p
      className="mb-4 text-[16px] last:mb-0"
      style={{
        fontFamily: 'var(--font-serif)',
        lineHeight: 1.6,
        color: 'var(--color-foreground)',
      }}
    >
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul
      className="mb-4 list-disc space-y-1 pl-6 text-[16px]"
      style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-foreground)' }}
    >
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol
      className="mb-4 list-decimal space-y-1 pl-6 text-[16px]"
      style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-foreground)' }}
    >
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed" style={{ lineHeight: 1.6 }}>
      {children}
    </li>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.includes('language-');
    if (isBlock) {
      return (
        <code
          className="block"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--color-foreground)',
          }}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded px-[4px] py-[2px] text-[13px]"
        style={{
          fontFamily: 'var(--font-mono)',
          background: 'var(--color-surface-300)',
          color: 'var(--color-foreground)',
        }}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre
      className="mb-4 overflow-x-auto rounded-[var(--radius-md)] p-3 text-[13px]"
      style={{
        fontFamily: 'var(--font-mono)',
        background: 'var(--color-surface-300)',
        color: 'var(--color-foreground)',
        lineHeight: 1.6,
      }}
    >
      {children}
    </pre>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold" style={{ color: 'var(--color-foreground)' }}>
      {children}
    </strong>
  ),
  em: ({ children }) => (
    <em style={{ fontStyle: 'italic', color: 'var(--color-foreground)' }}>{children}</em>
  ),
  blockquote: ({ children }) => (
    <blockquote
      className="my-4 border-l-2 pl-4 text-[16px]"
      style={{
        borderColor: 'var(--color-border-medium)',
        fontFamily: 'var(--font-serif)',
        color: 'var(--color-muted-strong)',
        lineHeight: 1.6,
      }}
    >
      {children}
    </blockquote>
  ),
  hr: () => (
    <hr
      className="my-6"
      style={{ borderColor: 'var(--color-border)' }}
    />
  ),
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
