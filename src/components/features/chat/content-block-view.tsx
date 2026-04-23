'use client';

import type { MessageContentBlock } from '@/types/chat';
import { QueryResultBlock } from './query-result-block';
import { MarkdownContent } from './markdown-content';

interface ContentBlockViewProps {
  block: MessageContentBlock;
}

export function ContentBlockView({ block }: ContentBlockViewProps) {
  if (block.type === 'text' && block.text) {
    return <MarkdownContent>{block.text}</MarkdownContent>;
  }

  if (block.type === 'query_result' && block.query_result) {
    return <QueryResultBlock qr={block.query_result} />;
  }

  if (block.type === 'report_link' && block.report) {
    return (
      <a
        href={block.report.page_url}
        className="mt-2 inline-flex items-center gap-2 rounded-md border border-border bg-surface-300 px-3 py-2 font-sans text-button text-foreground transition-colors hover:opacity-80"
      >
        {block.report.title ?? 'View Report'} →
      </a>
    );
  }

  if (block.type === 'search_result' && block.search_results) {
    return (
      <div className="mt-2 space-y-2">
        {block.search_results.results.slice(0, 5).map((item, i) => (
          <div key={i} className="rounded-md border border-border px-3 py-2">
            <p className="font-sans text-button font-medium text-foreground">{item.title}</p>
            <p className="mt-1 font-sans text-caption text-muted">{item.snippet}</p>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
