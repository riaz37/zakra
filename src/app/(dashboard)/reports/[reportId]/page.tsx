'use client';

import { useParams, useRouter } from 'next/navigation';
import { useReportGenerationDetail } from '@/hooks/useReportGenerations';
import { useReportDownload } from '@/hooks/useReportDownload';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { MarkdownRenderer } from '@/components/shared/markdown-renderer';
import { SectionChart } from '@/components/features/reports/section-chart';
import { REPORT_STATUS_VARIANTS, type ReportGenerationStatus } from '@/types';
import { Skeleton } from '@/components/shared/skeleton';
import { ChevronLeft, Download, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/format-date';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/shared/page-header';
import { ScaffoldContainer } from '@/components/shared/scaffold';

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
      <ScaffoldContainer size="small">
        <div className="py-6">
          <Skeleton className="mb-4 h-4 w-40" />
          <Skeleton className="mb-8 h-10 w-2/3" />
          <Skeleton className="h-32" rounded="lg" />
          <div className="mt-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" rounded="lg" />
            ))}
          </div>
        </div>
      </ScaffoldContainer>
    );
  }

  if (!report) {
    return (
      <ScaffoldContainer size="small">
        <PageHeader
          breadcrumbs={[
            { label: 'Reports', href: '/reports/history' },
            { label: 'Not found' },
          ]}
          title="Report not found"
        />
        <div className="mt-6 flex flex-col items-center rounded-card border border-border bg-surface-100 px-6 py-16 text-center">
          <AlertCircle aria-hidden className="h-10 w-10 text-muted" />
          <p className="mt-4 max-w-[42ch] font-sans text-button text-muted">
            This report may have been deleted, or you may not have access to it.
          </p>
          <Button
            variant="outline"
            onClick={() => router.push('/reports/history')}
            className="mt-6 gap-1.5"
          >
            <ChevronLeft aria-hidden size={14} strokeWidth={2} />
            Back to history
          </Button>
        </div>
      </ScaffoldContainer>
    );
  }

  return (
    <ScaffoldContainer size="small">
      <PageHeader
        breadcrumbs={[
          { label: 'Reports', href: '/reports/history' },
          { label: report.title ?? 'Report' },
        ]}
        title={report.title || 'Untitled Report'}
        subtitle={
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-mono text-caption text-muted">
              <Clock aria-hidden size={14} strokeWidth={1.75} />
              {formatDate(report.created_at)}
            </span>
            {report.duration_ms && (
              <span className="font-mono text-caption text-muted">
                · {(report.duration_ms / 1000).toFixed(1)}s
              </span>
            )}
            <Badge variant={REPORT_STATUS_VARIANTS[report.status as ReportGenerationStatus] ?? 'outline'}>
              {report.status}
            </Badge>
          </span>
        }
        primaryActions={
          report.has_pdf ? (
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
          ) : undefined
        }
      />

      <div className="mt-6 max-w-[760px]">
        {/* Download error */}
        {downloadError && (
          <div
            role="alert"
            className="mb-6 rounded-card border border-error/20 bg-error/5 px-4 py-3 font-sans text-button text-error"
          >
            {downloadError}
          </div>
        )}

        {/* Executive summary */}
        {report.executive_summary && (
          <div className="mb-12 rounded-card border border-border bg-surface-100 p-8">
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
            {[...report.sections]
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

                  {/* Chart — rendered when chart_recommendation + query_result both present */}
                  {section.chart_recommendation &&
                    section.query_result &&
                    section.query_result.row_count > 0 && (
                      <div className="mt-6">
                        <p className="mb-3 font-mono text-caption font-medium uppercase tracking-wider text-muted">
                          {section.chart_recommendation.title}
                        </p>
                        <SectionChart section={section} />
                      </div>
                    )}

                  {/* Query result table */}
                  {section.query_result && section.query_result.row_count > 0 && (
                    <div className="mt-6 overflow-hidden rounded-card border border-border bg-background">
                      <div className="flex items-center justify-between border-b border-border bg-surface-100 px-4 py-2">
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
          <div
            role="alert"
            className="mt-10 rounded-card border border-error/20 bg-error/5 p-6"
          >
            <div className="flex items-start gap-4">
              <AlertCircle aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-error" />
              <div>
                <p className="font-sans text-[15px] font-semibold text-error">
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
    </ScaffoldContainer>
  );
}
