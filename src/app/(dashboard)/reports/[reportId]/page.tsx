'use client';

import { useParams, useRouter } from 'next/navigation';
import { useReportGenerationDetail } from '@/hooks/useReportGenerations';
import { useReportDownload } from '@/hooks/useReportDownload';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { MarkdownRenderer } from '@/components/shared/markdown-renderer';
import type { ReportGenerationStatus } from '@/types';
import { ChevronLeft, Download, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/format-date';
import { cn } from '@/lib/utils';

const STATUS_VARIANTS: Record<ReportGenerationStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  running: "secondary",
  completed: "default",
  failed: "destructive",
};

export default function ReportViewerPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const router = useRouter();
  const companyId = useCurrentCompanyId();

  const { data: report, isLoading } = useReportGenerationDetail(reportId, companyId);
  const { download, isDownloading, error: downloadError } = useReportDownload();

  const handleDownload = () => {
    void download(reportId, companyId, `report-${reportId.slice(0, 8)}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[760px] px-6 py-8">
        <div className="mb-8 h-8 w-32 animate-pulse rounded bg-surface-300" />
        <div className="h-32 animate-pulse rounded-xl bg-surface-300" />
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-surface-300" />
          ))}
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="mx-auto max-w-[760px] px-6 py-8">
        <div className="flex flex-col items-center py-16 text-center">
          <AlertCircle aria-hidden className="h-10 w-10 text-muted" />
          <h2 className="mt-4 font-display text-[18px] text-foreground font-medium">
            Report not found
          </h2>
          <Button
            variant="link"
            onClick={() => router.push('/reports/history')}
            className="mt-4 text-muted no-underline hover:text-foreground"
          >
            <ChevronLeft aria-hidden size={14} strokeWidth={2} />
            Back to history
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-[1000px]">
        {/* Back + breadcrumb */}
        <div className="mb-8 flex items-center justify-between">
          <Button
            variant="link"
            onClick={() => router.push('/reports/history')}
            className="h-auto p-0 font-sans text-button text-muted hover:text-foreground no-underline gap-1.5"
          >
            <ChevronLeft aria-hidden size={14} strokeWidth={1.75} />
            Report History
          </Button>

          <div className="flex items-center gap-3">
            <Badge variant={STATUS_VARIANTS[report.status] ?? "outline"}>
              {report.status}
            </Badge>
            {report.has_pdf && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={isDownloading}
                className="h-8 gap-2"
              >
                <Download aria-hidden size={14} strokeWidth={1.75} />
                {isDownloading ? 'Downloading…' : 'Download PDF'}
              </Button>
            )}
          </div>
        </div>

        {/* Title & meta */}
        <div className="mb-10">
          <h1 className="font-display text-[42px] font-normal tracking-[-0.84px] leading-[1.1] text-foreground">
            {report.title || 'Untitled Report'}
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-mono text-button text-muted">
              <Clock aria-hidden size={14} strokeWidth={1.75} />
              {formatDate(report.created_at)}
            </span>
            {report.duration_ms && (
              <span className="font-mono text-button text-muted">
                · {(report.duration_ms / 1000).toFixed(1)}s
              </span>
            )}
          </div>
        </div>

        {/* Download error */}
        {downloadError && (
          <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 font-sans text-button text-error">
            {downloadError}
          </div>
        )}

        {/* Executive summary */}
        {report.executive_summary && (
          <div className="mb-12 rounded-xl border border-border bg-surface-100 p-8 shadow-sm">
            <p className="mb-4 font-mono text-caption font-medium uppercase tracking-wider text-muted">
              Executive Summary
            </p>
            <p className="font-sans text-[15px] leading-relaxed text-foreground">
              {report.executive_summary}
            </p>
          </div>
        )}

        {/* Report sections */}
        {report.sections.length > 0 && (
          <div className="space-y-12">
            {report.sections
              .sort((a, b) => a.section_index - b.section_index)
              .map((section) => (
                <section key={section.id}>
                  <h2 className="mb-5 font-display text-[22px] font-semibold tracking-[-0.2px] text-foreground">
                    {section.title}
                  </h2>

                  {section.analysis_text ? (
                    <MarkdownRenderer content={section.analysis_text} />
                  ) : section.status === 'failed' ? (
                    <p className="font-sans text-button text-error italic">
                      {section.error_message || 'Section generation failed.'}
                    </p>
                  ) : (
                    <p className="font-sans text-button text-muted italic">
                      No content generated for this section.
                    </p>
                  )}

                  {/* Query result table */}
                  {section.query_result && section.query_result.row_count > 0 && (
                    <div className="mt-6 overflow-hidden rounded-lg border border-border bg-background">
                      <div className="flex items-center justify-between border-bottom border-border bg-surface-100 px-4 py-2">
                        <span className="font-mono text-caption font-medium text-muted uppercase tracking-wider">
                          Query Result
                        </span>
                        <span className="font-mono text-caption text-muted">
                          {section.query_result.row_count} rows
                          {section.query_result.truncated && ' (truncated)'}
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-caption border-collapse">
                          <thead>
                            <tr className="border-b border-border bg-surface-50">
                              {section.query_result.columns.map((col) => (
                                <th
                                  key={col}
                                  className="px-4 py-2.5 text-left font-mono font-medium text-muted uppercase tracking-wider"
                                >
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(section.query_result.rows as unknown[]).slice(0, 20).map((row, i) => {
                              const cells = Array.isArray(row)
                                ? row
                                : section.query_result!.columns.map(
                                    (col) => (row as Record<string, unknown>)[col],
                                  );
                              return (
                                <tr
                                  key={i}
                                  className={cn(
                                    "border-b border-border/50 last:border-0",
                                    i % 2 === 0 ? "bg-background" : "bg-surface-50/30"
                                  )}
                                >
                                  {cells.map((cell, colIdx) => (
                                    <td
                                      key={colIdx}
                                      className="px-4 py-2.5 font-mono text-foreground"
                                    >
                                      {String(cell ?? '')}
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </section>
              ))}
          </div>
        )}

        {/* Error state for failed report */}
        {report.status === 'failed' && report.error_message && (
          <div className="mt-10 rounded-xl border border-destructive/20 bg-destructive/5 p-6">
            <div className="flex items-start gap-4">
              <AlertCircle aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-error" />
              <div>
                <p className="font-display text-[15px] font-semibold text-error">
                  Report generation failed
                </p>
                <p className="mt-1 font-sans text-button text-error/80 leading-relaxed">
                  {report.error_message}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
