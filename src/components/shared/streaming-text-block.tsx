'use client';

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
  const isEmpty = !text || text.length === 0;

  if (isEmpty && isStreaming) {
    return (
      <span
        className={`inline-block text-[16px] ${className ?? ''}`}
        style={{
          fontFamily: 'var(--font-serif)',
          color: 'var(--color-muted)',
        }}
      >
        <span className="animate-pulse">…</span>
      </span>
    );
  }

  return (
    <span
      className={`text-[16px] ${className ?? ''}`}
      style={{
        fontFamily: 'var(--font-serif)',
        lineHeight: 1.6,
        color: 'var(--color-foreground)',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {text}
      {isStreaming && (
        <span
          className="ml-[1px] animate-pulse select-none"
          style={{ color: 'var(--color-muted)' }}
          aria-hidden
        >
          |
        </span>
      )}
    </span>
  );
}
