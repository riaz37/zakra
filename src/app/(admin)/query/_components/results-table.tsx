"use client";

import type { QueryResult } from "@/types";

interface ResultsTableProps {
  result: QueryResult;
}

export function ResultsTable({ result }: ResultsTableProps) {
  const { columns, rows, row_count, execution_time_ms, truncated } = result;

  return (
    <div className="flex min-h-0 flex-col">
      <header className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-3">
        <span className="caption-upper">Results</span>
        <span className="text-[12px] text-[var(--fg-muted)]">
          {row_count.toLocaleString()} {row_count === 1 ? "row" : "rows"}
        </span>
        <span className="text-[var(--fg-subtle)]">·</span>
        <span className="font-mono text-[12px] text-[var(--primary)]">
          {execution_time_ms}ms
        </span>
        {truncated && (
          <span className="ml-2 rounded-[4px] bg-[var(--warning-soft)] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--warning)]">
            truncated
          </span>
        )}
      </header>

      <div className="min-h-0 grow overflow-auto">
        {rows.length === 0 ? (
          <div className="flex h-full min-h-[200px] items-center justify-center text-center text-[13px] text-[var(--fg-subtle)]">
            Query executed successfully but returned no rows.
          </div>
        ) : (
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <th className="sticky top-0 z-10 w-[48px] border-b border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--fg-subtle)]">
                  #
                </th>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--fg-subtle)]"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-muted)]/60"
                >
                  <td className="px-3 py-2 text-right font-mono text-[10px] text-[var(--fg-subtle)]">
                    {i + 1}
                  </td>
                  {columns.map((col) => (
                    <td
                      key={col}
                      className="max-w-[300px] truncate px-3 py-2 font-mono text-[12px] align-top"
                      style={{
                        textAlign: typeof row[col] === "number" ? "right" : "left",
                      }}
                    >
                      {formatCellValue(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") return value.toLocaleString();
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
