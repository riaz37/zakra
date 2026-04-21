"use client";

import { Download, Loader2, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { useReportGenerationDetail } from "@/hooks/useReportGenerations";
import { useReportDownload } from "@/hooks/useReportDownload";
import { formatDateTime } from "@/utils/formatters";
import type { GeneratedReport } from "@/types";
import { HighlightedSql } from "../../chat/_components/sql-highlight";

interface HistoryDetailProps {
  report: GeneratedReport | null;
  companyId: string | undefined;
  onClose: () => void;
}

export function HistoryDetail({ report, companyId, onClose }: HistoryDetailProps) {
  const detail = useReportGenerationDetail(report?.id, companyId);
  const download = useReportDownload();
  const data = detail.data ?? report;

  const open = Boolean(report);

  const handleDownload = () => {
    if (!data) return;
    download.download(
      data.id,
      companyId,
      `${data.title || "report"}.pdf`.replace(/\s+/g, "-"),
    );
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 data-[side=right]:sm:max-w-[720px]"
        showCloseButton={false}
      >
        <header className="flex items-start gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-6 py-4">
          <div className="min-w-0 grow">
            <div className="caption-upper text-[11px]">Report</div>
            <h2 className="mt-0.5 truncate font-display text-[18px] font-semibold -tracking-[0.01em]">
              {data?.title || "Untitled report"}
            </h2>
            {data && (
              <div className="mt-1 flex items-center gap-3 text-[12px] text-[var(--fg-muted)]">
                <span>
                  Started {formatDateTime(data.started_at ?? data.created_at)}
                </span>
                {typeof data.duration_ms === "number" && (
                  <span className="font-mono">
                    {(data.duration_ms / 1000).toFixed(1)}s
                  </span>
                )}
              </div>
            )}
          </div>
          {data?.has_pdf && data.status === "completed" && (
            <button
              type="button"
              onClick={handleDownload}
              disabled={download.isDownloading}
              className="inline-flex h-9 items-center gap-2 rounded-[var(--radius-btn)] bg-[var(--primary)] px-3 text-[13px] font-medium text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {download.isDownloading ? (
                <Loader2 className="size-3.5 animate-spin" strokeWidth={1.75} />
              ) : (
                <Download className="size-3.5" strokeWidth={1.75} />
              )}
              Download PDF
            </button>
          )}
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="inline-flex size-8 items-center justify-center rounded-md text-[var(--fg-subtle)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--fg)]"
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        </header>

        <div className="min-h-0 grow overflow-y-auto px-6 py-5">
          {!data ? (
            <DetailSkeleton />
          ) : data.status === "failed" ? (
            <div className="rounded-[10px] border border-[var(--destructive-soft)] bg-[var(--destructive-soft)] px-4 py-3 text-[13px] text-[var(--destructive)]">
              {data.error_message ?? "Generation failed."}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {data.executive_summary && (
                <section>
                  <div className="caption-upper mb-2 text-[11px]">
                    Executive summary
                  </div>
                  <p className="whitespace-pre-wrap text-[14px] leading-[22px] text-[var(--fg)]">
                    {data.executive_summary}
                  </p>
                </section>
              )}

              {data.sections.length > 0 && (
                <section>
                  <div className="caption-upper mb-2 text-[11px]">Sections</div>
                  <ol className="flex flex-col gap-3">
                    {data.sections
                      .slice()
                      .sort((a, b) => a.section_index - b.section_index)
                      .map((s) => (
                        <li
                          key={s.id}
                          className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-4"
                        >
                          <div className="flex items-center gap-2">
                            <span className="inline-flex size-5 items-center justify-center rounded bg-[var(--surface-muted)] font-mono text-[11px] text-[var(--fg-muted)]">
                              {s.section_index + 1}
                            </span>
                            <h3 className="grow font-display text-[14px] font-semibold -tracking-[0.01em]">
                              {s.title}
                            </h3>
                            {s.status !== "completed" && (
                              <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--fg-subtle)]">
                                {s.status}
                              </span>
                            )}
                          </div>

                          {s.generated_query && (
                            <pre className="mt-3 overflow-x-auto rounded-[8px] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 font-mono text-[12px] leading-[20px]">
                              <code>
                                <HighlightedSql sql={s.generated_query} />
                              </code>
                            </pre>
                          )}

                          {s.analysis_text && (
                            <p className="mt-3 whitespace-pre-wrap text-[13px] leading-[20px] text-[var(--fg)]">
                              {s.analysis_text}
                            </p>
                          )}

                          {s.query_result && s.query_result.row_count > 0 && (
                            <div className="mt-3 text-[11px] text-[var(--fg-subtle)]">
                              {s.query_result.row_count.toLocaleString()} rows
                              returned
                            </div>
                          )}

                          {s.error_message && (
                            <div className="mt-3 rounded-[8px] border border-[var(--destructive-soft)] bg-[var(--destructive-soft)] px-3 py-2 text-[12px] text-[var(--destructive)]">
                              {s.error_message}
                            </div>
                          )}
                        </li>
                      ))}
                  </ol>
                </section>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <span className="skel h-4 w-1/3" />
      <span className="skel h-3 w-full" />
      <span className="skel h-3 w-5/6" />
      <span className="skel h-3 w-2/3" />
      <span className="skel mt-4 h-32 w-full" />
    </div>
  );
}
