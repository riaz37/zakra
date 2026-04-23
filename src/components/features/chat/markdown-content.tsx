'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

export const markdownComponents: Components = {
  p: ({ children }) => (
    <p className="mb-3 font-sans text-[14px] leading-[1.7] text-foreground last:mb-0">
      {children}
    </p>
  ),
  ul: ({ children }) => <ul className="my-2 space-y-1.5">{children}</ul>,
  ol: ({ children }) => (
    <ol className="my-2 list-decimal space-y-1.5 pl-4">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="flex gap-2 font-sans text-[14px] leading-[1.7] text-foreground">
      <span
        aria-hidden
        className="mt-[0.65em] h-[4px] w-[4px] shrink-0 rounded-full bg-muted"
      />
      <span>{children}</span>
    </li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-muted">{children}</em>,
  code: ({ children, className }) => {
    const isBlock = className?.startsWith('language-');
    if (isBlock) return <code className={className}>{children}</code>;
    return (
      <code className="rounded bg-surface-400 px-1.5 py-0.5 font-mono text-[12px] text-accent">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-3 overflow-x-auto rounded-lg border border-border bg-[var(--color-code-canvas)] p-3 font-mono text-[12px] leading-relaxed text-foreground">
      {children}
    </pre>
  ),
  h1: ({ children }) => (
    <h1 className="mb-2 mt-4 font-sans text-[16px] font-semibold tracking-tight text-foreground first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-3 font-sans text-[15px] font-semibold tracking-tight text-foreground first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1.5 mt-3 font-sans text-[14px] font-semibold text-foreground first:mt-0">
      {children}
    </h3>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-border pl-3 text-muted">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-border" />,
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-accent underline underline-offset-2 transition-opacity hover:opacity-80"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-[13px]">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-border bg-surface-300">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 text-left font-sans text-[12px] font-medium text-muted">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-border px-3 py-2 font-sans last:border-0">
      {children}
    </td>
  ),
};

export function normalizeMarkdown(text: string): string {
  return text
    .split('\n')
    .map((line) => (line.startsWith('• ') ? `- ${line.slice(2)}` : line))
    .join('\n');
}

interface MarkdownContentProps {
  children: string;
}

export function MarkdownContent({ children }: MarkdownContentProps) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {normalizeMarkdown(children)}
    </ReactMarkdown>
  );
}
