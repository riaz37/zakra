"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  AlertTriangle,
  Database,
  ExternalLink,
  FileText,
  Search,
} from "lucide-react";
import type {
  MessageContentBlock,
  QueryResultData,
  ReportLinkData,
  ReportPickerData,
  SearchResultData,
} from "@/types/chat";
import { HighlightedSql } from "./sql-highlight";

interface MessageContentProps {
  blocks: MessageContentBlock[];
}

export function MessageContent({ blocks }: MessageContentProps) {
  return (
    <div className="flex flex-col gap-3">
      {blocks.map((block, idx) => (
        <BlockRenderer key={idx} block={block} />
      ))}
    </div>
  );
}

function BlockRenderer({ block }: { block: MessageContentBlock }) {
  switch (block.type) {
    case "text":
      return block.text ? <TextBlock text={block.text} /> : null;
    case "query_result":
      return block.query_result ? <QueryResultBlock data={block.query_result} /> : null;
    case "report_link":
      return block.report ? <ReportLinkBlock data={block.report} /> : null;
    case "search_result":
      return block.search_results ? <SearchResultBlock data={block.search_results} /> : null;
    case "report_picker":
      return block.report_picker ? <ReportPickerBlock data={block.report_picker} /> : null;
    case "error":
      return (
        <ErrorBlock
          code={block.error?.code ?? "error"}
          message={block.error?.message ?? "Something went wrong."}
        />
      );
    default:
      return null;
  }
}

const markdownComponents: Components = {
  p: ({ children }) => (
    <p className="m-0 text-[14px] leading-[22px] [&:not(:first-child)]:mt-2.5">{children}</p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--primary)] underline underline-offset-2 hover:no-underline"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="mt-2 ml-5 list-disc text-[14px] leading-[22px] marker:text-[var(--fg-subtle)]">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-2 ml-5 list-decimal text-[14px] leading-[22px] marker:text-[var(--fg-subtle)]">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="mt-1">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-[var(--fg)]">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  hr: () => <hr className="my-3 border-[var(--border)]" />,
  blockquote: ({ children }) => (
    <blockquote className="mt-2 border-l-2 border-[var(--border-strong)] pl-3 text-[var(--fg-muted)]">
      {children}
    </blockquote>
  ),
  h1: ({ children }) => (
    <h3 className="mt-3 font-display text-[17px] font-semibold -tracking-[0.01em]">
      {children}
    </h3>
  ),
  h2: ({ children }) => (
    <h4 className="mt-3 font-display text-[15px] font-semibold -tracking-[0.01em]">
      {children}
    </h4>
  ),
  h3: ({ children }) => (
    <h5 className="mt-3 font-display text-[14px] font-semibold -tracking-[0.01em]">
      {children}
    </h5>
  ),
  code: ({ className, children }) => {
    const content = String(children ?? "").replace(/\n$/, "");
    const lang = /language-(\w+)/.exec(className ?? "")?.[1];
    // Inline code
    if (!lang && !content.includes("\n")) {
      return (
        <code className="rounded bg-[var(--surface-muted)] px-1 py-[1px] font-mono text-[0.92em] text-[var(--fg)]">
          {children}
        </code>
      );
    }
    // Fenced code block
    return (
      <pre className="my-2 overflow-x-auto rounded-[10px] border border-[var(--border)] bg-[var(--surface-muted)] px-3.5 py-3 font-mono text-[13px] leading-[20px]">
        <code>
          {lang === "sql" ? <HighlightedSql sql={content} /> : content}
        </code>
      </pre>
    );
  },
  pre: ({ children }) => <>{children}</>,
  table: ({ children }) => (
    <div className="my-2 overflow-hidden rounded-[10px] border border-[var(--border)]">
      <table className="w-full border-collapse text-[13px]">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-[var(--surface-muted)]">{children}</thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-[var(--border)] last:border-b-0">{children}</tr>
  ),
  th: ({ children, style }) => (
    <th
      className="caption-upper px-3 py-2 text-[11px] font-semibold text-[var(--fg-muted)]"
      style={{ textAlign: style?.textAlign ?? "left" }}
    >
      {children}
    </th>
  ),
  td: ({ children, style }) => (
    <td
      className="px-3 py-2 text-[13px] font-mono tabular-nums"
      style={{ textAlign: style?.textAlign ?? "left" }}
    >
      {children}
    </td>
  ),
};

function TextBlock({ text }: { text: string }) {
  return (
    <div className="text-[14px] leading-[22px] text-[var(--fg)]">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {text}
      </ReactMarkdown>
    </div>
  );
}

interface QueryResultBlockProps {
  data: QueryResultData;
}

function QueryResultBlock({ data }: QueryResultBlockProps) {
  const previewRows = data.rows.slice(0, 10);
  const extraRows = data.row_count - previewRows.length;

  return (
    <div className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface-muted)] px-3.5 py-2">
        <Database className="size-3.5 text-[var(--fg-muted)]" strokeWidth={1.75} />
        <span className="caption-upper text-[11px]">Query result</span>
        {typeof data.execution_time_ms === "number" && (
          <span className="ml-auto font-mono text-[11px] text-[var(--fg-subtle)]">
            {data.execution_time_ms.toLocaleString()} ms
          </span>
        )}
      </div>

      <pre className="overflow-x-auto px-3.5 py-3 font-mono text-[13px] leading-[20px]">
        <code>
          <HighlightedSql sql={data.sql} />
        </code>
      </pre>

      {data.explanation && (
        <div className="border-t border-[var(--border)] px-3.5 py-2.5 text-[12px] text-[var(--fg-muted)]">
          {data.explanation}
        </div>
      )}

      {previewRows.length > 0 && data.columns.length > 0 && (
        <div className="overflow-x-auto border-t border-[var(--border)]">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="bg-[var(--surface-muted)]">
                {data.columns.map((col) => (
                  <th
                    key={col}
                    className="caption-upper border-b border-[var(--border)] px-3 py-2 text-left text-[11px] font-semibold text-[var(--fg-muted)]"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, ri) => (
                <tr
                  key={ri}
                  className="border-b border-[var(--border)] last:border-b-0"
                >
                  {data.columns.map((col) => {
                    const v = row[col];
                    return (
                      <td
                        key={col}
                        className="px-3 py-1.5 font-mono tabular-nums text-[12px] text-[var(--fg)]"
                      >
                        {v === null || v === undefined ? (
                          <span className="text-[var(--fg-subtle)]">NULL</span>
                        ) : (
                          String(v)
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-[var(--border)] px-3.5 py-2 text-[12px] text-[var(--fg-subtle)]">
        <span>
          {data.row_count.toLocaleString()} {data.row_count === 1 ? "row" : "rows"}
          {extraRows > 0 ? ` · showing first ${previewRows.length}` : ""}
        </span>
        {extraRows > 0 && (
          <Link
            href="/query"
            className="inline-flex items-center gap-1 font-medium text-[var(--primary)] hover:underline"
          >
            View full results <ExternalLink className="size-3" strokeWidth={1.75} />
          </Link>
        )}
      </div>
    </div>
  );
}

function ReportLinkBlock({ data }: { data: ReportLinkData }) {
  const router = useRouter();
  const title = data.title ?? "Report ready";
  const suggestion = data.suggestion ?? "Open to view the full report.";

  const handleOpen = () => {
    router.push(data.page_url || "/reports");
  };

  return (
    <div className="flex items-start gap-3 rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-token-sm transition-colors hover:border-[var(--primary)]">
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--primary-soft)] text-[var(--primary)]">
        <FileText className="size-[18px]" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 grow">
        <div className="text-[14px] font-medium text-[var(--fg)]">{title}</div>
        <div className="mt-0.5 text-[12px] text-[var(--fg-muted)]">{suggestion}</div>
      </div>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex h-8 items-center gap-1.5 rounded-[8px] bg-[var(--primary)] px-3 text-[13px] font-medium text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)]"
      >
        Open report
      </button>
    </div>
  );
}

function SearchResultBlock({ data }: { data: SearchResultData }) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface-muted)] px-3.5 py-2">
        <Search className="size-3.5 text-[var(--fg-muted)]" strokeWidth={1.75} />
        <span className="caption-upper text-[11px]">Search</span>
        <span className="ml-2 text-[12px] text-[var(--fg-muted)]">{data.query}</span>
        <span className="ml-auto font-mono text-[11px] text-[var(--fg-subtle)]">
          {data.result_count} {data.result_count === 1 ? "result" : "results"}
        </span>
      </div>
      <ul className="divide-y divide-[var(--border)]">
        {data.results.map((r, i) => (
          <li key={i} className="px-3.5 py-2.5">
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] font-medium text-[var(--primary)] hover:underline"
            >
              {r.title}
            </a>
            <div className="mt-0.5 text-[12px] text-[var(--fg-muted)]">{r.snippet}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReportPickerBlock({ data }: { data: ReportPickerData }) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface-muted)] px-3.5 py-2">
        <FileText className="size-3.5 text-[var(--fg-muted)]" strokeWidth={1.75} />
        <span className="caption-upper text-[11px]">Related reports</span>
      </div>
      {data.question && (
        <p className="border-b border-[var(--border)] px-3.5 py-2 text-[12px] text-[var(--fg-muted)]">
          {data.question}
        </p>
      )}
      <ul className="divide-y divide-[var(--border)]">
        {data.reports.map((r) => (
          <li key={r.id} className="px-3.5 py-2.5">
            <Link
              href={`/reports?id=${r.id}`}
              className="text-[13px] font-medium text-[var(--primary)] hover:underline"
            >
              {r.title}
            </Link>
            <div className="mt-0.5 flex items-center gap-2 text-[12px] text-[var(--fg-muted)]">
              <span className="font-mono text-[11px]">
                {new Date(r.created_at).toLocaleDateString()}
              </span>
              <span aria-hidden>·</span>
              <span>
                {r.section_count} {r.section_count === 1 ? "section" : "sections"}
              </span>
            </div>
            {r.executive_summary && (
              <div className="mt-1 text-[12px] text-[var(--fg-muted)]">
                {r.executive_summary}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ErrorBlock({ code, message }: { code: string; message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-[10px] border border-[var(--destructive-soft)] bg-[var(--destructive-soft)] px-3.5 py-3">
      <AlertTriangle
        className="mt-0.5 size-4 text-[var(--destructive)]"
        strokeWidth={1.75}
      />
      <div className="min-w-0">
        <div className="text-[13px] font-medium text-[var(--destructive)]">
          {code || "Error"}
        </div>
        <div className="mt-0.5 text-[13px] text-[var(--destructive)]">{message}</div>
      </div>
    </div>
  );
}
