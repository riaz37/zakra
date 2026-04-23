'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { MessageContentBlock } from '@/types/chat';

type QueryResult = NonNullable<MessageContentBlock['query_result']>;

interface QueryResultBlockProps {
  qr: QueryResult;
}

export function QueryResultBlock({ qr }: QueryResultBlockProps) {
  const [sqlOpen, setSqlOpen] = useState(false);

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border bg-surface-300 px-3 py-2">
        <span className="font-mono text-mono-sm text-muted">
          {qr.row_count} rows
          {qr.execution_time_ms != null && ` · ${(qr.execution_time_ms / 1000).toFixed(2)}s`}
        </span>
        {qr.sql && (
          <button
            onClick={() => setSqlOpen((o) => !o)}
            className="flex items-center gap-1 font-mono text-mono-sm text-muted transition-opacity hover:opacity-80"
          >
            {sqlOpen ? (
              <ChevronDown className="h-3 w-3" aria-hidden />
            ) : (
              <ChevronRight className="h-3 w-3" aria-hidden />
            )}
            SQL
            {qr.confidence != null && (
              <span className="ml-1 opacity-60">{Math.round(qr.confidence * 100)}%</span>
            )}
          </button>
        )}
      </div>

      {sqlOpen && qr.sql && (
        <div className="border-b border-border">
          <pre className="overflow-x-auto bg-surface-400 p-3 font-mono text-mono leading-relaxed text-foreground">
            {qr.sql}
          </pre>
          {qr.explanation && (
            <p className="px-3 pb-2 font-sans text-mono-sm text-muted">{qr.explanation}</p>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table
          className="w-full text-[12px]"
          aria-label={`Query result: ${qr.row_count} rows`}
        >
          <thead>
            <tr className="border-b border-border">
              {qr.columns.map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 text-left font-mono font-medium text-caption text-muted"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {qr.rows.slice(0, 10).map((row, i) => (
              <tr key={i} className="border-b border-border">
                {qr.columns.map((col) => (
                  <td key={col} className="px-3 py-2 font-mono text-caption text-foreground">
                    {String(row[col] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
