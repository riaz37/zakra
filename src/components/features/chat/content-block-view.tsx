'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart2, ArrowRight, Check, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MessageContentBlock, ReportPickerData } from '@/types/chat';
import { QueryResultBlock } from './query-result-block';
import { MarkdownContent } from './markdown-content';

function ReportPickerBlock({ data }: { data: ReportPickerData }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!selected) return;
    router.push(`/reports/${selected}`);
  };

  return (
    <div className="mt-2 space-y-3 animate-fade-in">
      <p className="font-sans text-button text-muted/65">{data.question}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {data.reports.map((item) => {
          const isSelected = selected === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSelected(item.id === selected ? null : item.id)}
              className={cn(
                'relative rounded-xl border p-3 text-left transition-all duration-150',
                isSelected
                  ? 'border-accent/40 bg-accent-soft shadow-[0_0_0_1px_var(--color-accent-border)]'
                  : 'border-border bg-surface-200 hover:border-border-medium hover:bg-surface-300/60',
              )}
            >
              {isSelected && (
                <div className="absolute right-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent/20 animate-scale-in">
                  <Check className="h-[9px] w-[9px] text-accent" strokeWidth={2.5} />
                </div>
              )}
              <p className="pr-5 font-sans text-button font-medium text-foreground">
                {item.title}
              </p>
              <p className="mt-0.5 font-mono text-mono-sm text-muted/40">
                {item.section_count} {item.section_count === 1 ? 'section' : 'sections'}
              </p>
              <p className="mt-1 line-clamp-2 font-sans text-caption text-muted/55">
                {item.executive_summary}
              </p>
            </button>
          );
        })}
      </div>
      <button
        onClick={handleConfirm}
        disabled={!selected}
        className={cn(
          'flex items-center gap-2 rounded-lg px-4 py-2 font-sans text-button font-medium transition-all duration-150',
          selected
            ? 'bg-accent text-primary-foreground hover:bg-accent/90'
            : 'cursor-not-allowed bg-surface-300 text-muted/35',
        )}
      >
        Open Report
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}

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
        className="group mt-2 flex items-center gap-3 rounded-xl border border-border bg-surface-200 px-4 py-3 transition-all duration-150 hover:border-accent/30 hover:bg-surface-300/60 animate-fade-in"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
          <BarChart2 className="h-4 w-4 text-accent/65" strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-sans text-button font-medium text-foreground">
            {block.report.title ?? 'View Report'}
          </p>
          {block.report.suggestion && (
            <p className="line-clamp-1 font-sans text-caption text-muted/50">
              {block.report.suggestion}
            </p>
          )}
        </div>
        <ArrowRight
          className="h-4 w-4 shrink-0 text-muted/35 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-accent/55"
          strokeWidth={1.5}
        />
      </a>
    );
  }

  if (block.type === 'search_result' && block.search_results) {
    const { results, query } = block.search_results;
    return (
      <div className="mt-2 space-y-2 animate-fade-in">
        <p className="font-mono text-mono-sm text-muted/35">
          Search: &ldquo;{query}&rdquo;
        </p>
        {results.slice(0, 5).map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-0.5 rounded-lg border border-border bg-surface-200 px-3 py-2.5 transition-all duration-150 hover:border-accent/25 hover:bg-surface-300/60 animate-fade-up"
            style={{ animationDelay: `${i * 45}ms` }}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="line-clamp-1 font-sans text-button font-medium text-foreground transition-colors group-hover:text-accent/85">
                {item.title}
              </p>
              <ExternalLink
                className="mt-0.5 h-3 w-3 shrink-0 text-muted/30 transition-colors group-hover:text-accent/45"
                strokeWidth={1.5}
              />
            </div>
            <p className="line-clamp-2 font-sans text-caption text-muted/55">{item.snippet}</p>
            <p className="line-clamp-1 font-mono text-mono-sm text-muted/25">{item.url}</p>
          </a>
        ))}
      </div>
    );
  }

  if (block.type === 'report_picker' && block.report_picker) {
    return <ReportPickerBlock data={block.report_picker} />;
  }

  return null;
}
