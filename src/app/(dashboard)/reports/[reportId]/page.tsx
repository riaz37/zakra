'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AlertCircle, Download, Loader2 } from 'lucide-react';

import { useReportGenerationDetail } from '@/hooks/useReportGenerations';
import { useReportDownload } from '@/hooks/useReportDownload';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';

import { MarkdownRenderer } from '@/components/shared/markdown-renderer';
import { SectionChart } from '@/components/features/reports/section-chart';
import { ReportTOC } from '@/components/features/reports/report-toc';
import { Skeleton, SkeletonText } from '@/components/shared/skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { ScaffoldContainer } from '@/components/shared/scaffold';
import { formatDateTime } from '@/lib/format-date';
import { formatColumnHeader } from '@/lib/format-column';
import { cn } from '@/lib/utils';
import type { GeneratedReportSection } from '@/types/report';
import { AnimatedPage, StaggerList, StaggerItem } from '@/components/shared/animated-container';

const ROW_LIMIT = 20;

function formatIndex(index: number): string {
  return String(index + 1).padStart(2, '0');
}

function formatCell(value: unknown): {
  display: string;
  isNumeric: boolean;
  isEmpty: boolean;
} {
  if (value === null || value === undefined || value === '') {
    return { display: '—', isNumeric: false, isEmpty: true };
  }
  if (typeof value === 'boolean') {
    return { display: value ? 'Yes' : 'No', isNumeric: false, isEmpty: false };
  }
  if (typeof value === 'number') {
    return { display: String(value), isNumeric: true, isEmpty: false };
  }
  const str = String(value);
  const isNumeric = str.trim() !== '' && !isNaN(Number(str));
  return { display: str, isNumeric, isEmpty: false };
}

interface SectionBlockProps {
  section: GeneratedReportSection;
  index: number;
}

function SectionBlock({ section, index }: SectionBlockProps) {
  const hasData = !!section.query_result?.row_count;
  const hasChart = hasData && !!section.chart_recommendation;
  const [tableOpen, setTableOpen] = useState(true);
  const [tableExpanded, setTableExpanded] = useState(false);

  const rows = section.query_result?.rows ?? [];
  const columns = section.query_result?.columns ?? [];
  const rowCount = section.query_result?.row_count ?? 0;
  const truncated = section.query_result?.truncated;

  const numericColumns = new Set<number>();
  if (hasData && rows.length > 0) {
    const firstRow = rows[0];
    const cells = Array.isArray(firstRow)
      ? firstRow
      : columns.map((col) => (firstRow as Record<string, unknown>)[col]);
    cells.forEach((cell, i) => {
      if (formatCell(cell).isNumeric) numericColumns.add(i);
    });
  }

  const visibleRows = (rows as unknown[]).slice(
    0,
    tableExpanded ? rows.length : ROW_LIMIT,
  );

  const showExpandToggle = rowCount > ROW_LIMIT || truncated;
  const hiddenCount = Math.max(0, rowCount - ROW_LIMIT);

  return (
    <section
      id={`section-${section.id}`}
      className="scroll-mt-20 border-t border-border pt-8"
    >
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-micro uppercase tracking-[0.08em] text-fg-subtle">
          {formatIndex(index)}
        </span>
        <h2 className="font-sans text-heading font-semibold tracking-[-0.025em] text-foreground">
          {section.title}
        </h2>
      </div>

      <div className="mt-5 max-w-[68ch]">
        {section.status === 'pending' || section.status === 'running' ? (
          <p className="flex items-center gap-2 font-sans text-button text-muted">
            <Loader2 aria-hidden className="size-3.5 animate-spin" />
            Generating analysis…
          </p>
        ) : section.status === 'failed' ? (
          <p className="flex items-start gap-2 font-sans text-button text-error">
            <AlertCircle aria-hidden className="mt-0.5 size-3.5 shrink-0" />
            <span>{section.error_message || 'Section generation failed.'}</span>
          </p>
        ) : section.analysis_text ? (
          <MarkdownRenderer content={section.analysis_text} />
        ) : (
          <p className="font-sans text-button italic text-muted">
            No data available for this section.
          </p>
        )}
      </div>

      {hasData ? (
        <div className="mt-8 space-y-6">
          {hasChart && section.chart_recommendation ? (
            <div>
              <p className="font-sans text-body font-medium text-foreground">
                {section.chart_recommendation.title}
              </p>
              <p className="mt-1 font-mono text-micro uppercase tracking-[0.06em] text-fg-subtle">
                {section.chart_recommendation.chart_type}
                <span className="mx-1.5 text-fg-subtle">·</span>
                {rowCount} {rowCount === 1 ? 'point' : 'points'}
              </p>
              <div className="mt-4">
                <SectionChart section={section} />
              </div>
            </div>
          ) : null}

          <div>
            {hasChart ? (
              <button
                type="button"
                onClick={() => setTableOpen((v) => !v)}
                aria-expanded={tableOpen}
                className="inline-flex items-center gap-1.5 font-mono text-micro uppercase tracking-[0.06em] text-fg-muted transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
              >
                Query Result
                <span className="text-subtle">·</span>
                <span>{rowCount} rows</span>
                <span
                  aria-hidden
                  className={cn(
                    'ml-1 inline-block transition-transform duration-200',
                    tableOpen ? 'rotate-90' : 'rotate-0',
                  )}
                >
                  ›
                </span>
              </button>
            ) : null}

            {tableOpen ? (
              <div className={cn(hasChart && 'mt-3')}>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-caption">
                    <thead>
                      <tr className="border-b border-border bg-surface-200">
                        {columns.map((col, i) => (
                          <th
                            key={col}
                            className={cn(
                              'px-4 py-2 font-sans text-micro font-semibold uppercase tracking-[0.06em] text-fg-muted',
                              numericColumns.has(i) ? 'text-right' : 'text-left',
                            )}
                          >
                            {formatColumnHeader(col)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {visibleRows.map((row, i) => {
                        const cells = Array.isArray(row)
                          ? row
                          : columns.map(
                              (col) => (row as Record<string, unknown>)[col],
                            );
                        return (
                          <tr
                            key={i}
                            className={cn(
                              'border-b border-border last:border-0',
                              i % 2 === 0 ? 'bg-background' : 'bg-surface-100',
                            )}
                          >
                            {cells.map((cell, colIdx) => {
                              const formatted = formatCell(cell);
                              const isNumeric = numericColumns.has(colIdx);
                              return (
                                <td
                                  key={colIdx}
                                  className={cn(
                                    'px-4 py-2',
                                    isNumeric
                                      ? 'text-right font-mono tabular-nums'
                                      : 'text-left font-sans',
                                    formatted.isEmpty
                                      ? 'text-fg-subtle'
                                      : 'text-foreground',
                                  )}
                                >
                                  {formatted.display}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {showExpandToggle ? (
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-surface-100 px-4 py-2">
                    <span className="font-mono text-micro uppercase tracking-[0.06em] text-fg-subtle">
                      Showing {visibleRows.length} of {rowCount} rows
                      {truncated && !tableExpanded
                        ? ' (result truncated by server)'
                        : ''}
                    </span>
                    {hiddenCount > 0 ? (
                      <button
                        type="button"
                        onClick={() => setTableExpanded((v) => !v)}
                        aria-expanded={tableExpanded}
                        className="cursor-pointer font-mono text-micro text-fg-subtle transition-colors hover:text-fg-muted focus-visible:text-fg-muted focus-visible:outline-none"
                      >
                        {tableExpanded
                          ? 'Show less ↑'
                          : `Show ${hiddenCount} more rows ↓`}
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default function ReportViewerPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const router = useRouter();
  const companyId = useCurrentCompanyId();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const { data: report, isLoading } = useReportGenerationDetail(
    reportId,
    companyId,
  );
  const isInProgress =
    report?.status === 'running' || report?.status === 'pending';

  // Poll while the report is still generating. We use a separate polling
  // hook call that only kicks in when `isInProgress` is true; queries share
  // the same key so the result feeds the same cache entry that `report`
  // reads from above.
  useReportGenerationDetail(reportId, companyId, {
    refetchInterval: isInProgress ? 3000 : false,
  });
  const { download, isDownloading, error: downloadError } = useReportDownload();

  useEffect(() => {
    if (downloadError) {
      toast.error(downloadError);
    }
  }, [downloadError]);

  const handleDownload = () => {
    void download(reportId, companyId, `report-${reportId.slice(0, 8)}.pdf`);
  };

  if (isLoading) {
    return (
      <ScaffoldContainer size="small">
        <div className="flex flex-col gap-4 py-6">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-96" />

          <div className="mt-8 max-w-[68ch] border-l-[3px] border-accent/30 pl-5 py-1">
            <Skeleton className="mb-3 h-3 w-32" />
            <SkeletonText lines={3} />
          </div>

          <div className="mt-8 space-y-10">
            {[0, 1, 2].map((i) => (
              <div key={i} className="border-t border-border pt-8">
                <div className="flex items-baseline gap-3">
                  <Skeleton className="h-3 w-6" />
                  <Skeleton className="h-5 w-64" />
                </div>
                <div className="mt-5 max-w-[68ch]">
                  <SkeletonText lines={3} />
                </div>
                <Skeleton className="mt-8 h-48 w-full" rounded="lg" />
              </div>
            ))}
          </div>
        </div>
      </ScaffoldContainer>
    );
  }

  if (!report) {
    return (
      <ScaffoldContainer size="small">
        <div className="py-10">
          <ErrorState
            title="Report not found"
            description="This report may have been deleted, or you may not have access to it."
            onRetry={() => router.push('/reports/ai-generate')}
          />
        </div>
      </ScaffoldContainer>
    );
  }

  const sortedSections = [...report.sections].sort(
    (a, b) => a.section_index - b.section_index,
  );
  const failedCount = sortedSections.filter((s) => s.status === 'failed').length;
  const completedCount = sortedSections.filter(
    (s) => s.status === 'completed',
  ).length;
  const totalCount = sortedSections.length;
  const showPartialFailure =
    report.status !== 'failed' && failedCount > 0 && totalCount > 0;
  const showWholeFailure = report.status === 'failed' && !!report.error_message;

  const durationLabel = report.duration_ms
    ? `${(report.duration_ms / 1000).toFixed(1)}s`
    : null;

  const hasTOC = sortedSections.length >= 3;

  return (
    <>
      {scrolled && report ? (
        <div className="fixed top-0 left-56 right-0 z-20 flex items-center gap-4 border-b border-border bg-background/95 px-6 py-2.5 backdrop-blur-sm animate-fade-in">
          <span className="min-w-0 flex-1 truncate font-sans text-button font-medium text-foreground">
            {report.title || 'Untitled Report'}
          </span>
          <StatusBadge status={report.status} dot />
          {report.has_pdf ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
              className="h-7 gap-1.5 text-caption"
            >
              <Download aria-hidden size={13} strokeWidth={1.75} />
              {isDownloading ? 'Downloading…' : 'PDF'}
            </Button>
          ) : null}
        </div>
      ) : null}

      <AnimatedPage className="@container mx-auto flex w-full max-w-[1100px] gap-8 px-4 pb-16 @lg:px-6 @xl:px-10">
        <div className="min-w-0 flex-1 max-w-[768px]">
          <PageHeader
            breadcrumbs={[
              { label: 'Reports', href: '/reports/ai-generate' },
              { label: report.title ?? 'Report' },
            ]}
            title={report.title || 'Untitled Report'}
            subtitle={
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-sans text-body text-fg-muted">
                  {formatDateTime(report.created_at)}
                </span>
                {durationLabel ? (
                  <>
                    <span className="text-subtle">·</span>
                    <span className="font-mono text-mono-sm text-muted">
                      {durationLabel}
                    </span>
                  </>
                ) : null}
                <span className="text-subtle">·</span>
                <span className="font-mono text-mono-sm text-muted">
                  {totalCount} {totalCount === 1 ? 'section' : 'sections'}
                </span>
                <span className="text-subtle">·</span>
                <StatusBadge status={report.status} dot />
              </span>
            }
            primaryActions={
              report.has_pdf ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  aria-label={
                    isDownloading
                      ? 'Downloading report PDF'
                      : 'Download report as PDF'
                  }
                  className="h-8 gap-2"
                >
                  <Download aria-hidden size={14} strokeWidth={1.75} />
                  {isDownloading ? 'Downloading…' : 'Download PDF'}
                </Button>
              ) : undefined
            }
          />

          <div className="mt-2">
            {isInProgress ? (
              <div className="mb-6 flex items-center gap-2.5 rounded-lg border border-border bg-surface-200 px-4 py-3">
                <Loader2 className="size-4 animate-spin text-accent" />
                <span className="font-sans text-body text-foreground">
                  Generating report…
                </span>
                <span className="ml-auto font-mono text-mono-sm text-muted">
                  {completedCount} / {totalCount} sections
                </span>
              </div>
            ) : null}

            {showWholeFailure ? (
              <div
                role="alert"
                className="mb-8 flex items-start gap-3 rounded-lg border border-error-border bg-error-bg px-4 py-3"
              >
                <AlertCircle
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-error"
                />
                <div>
                  <p className="font-sans text-button font-medium text-error">
                    Report generation failed
                  </p>
                  <p className="mt-1 font-sans text-button leading-relaxed text-error">
                    {report.error_message}
                  </p>
                </div>
              </div>
            ) : null}

            {showPartialFailure ? (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 rounded-lg border border-warning-border bg-warning-bg px-4 py-3"
              >
                <AlertCircle
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-warning"
                />
                <p className="font-sans text-body text-foreground">
                  {failedCount} of {totalCount} sections failed to generate.
                </p>
              </div>
            ) : null}

            {report.executive_summary ? (
              <div className="mb-12 max-w-[68ch] border-l-[3px] border-accent/30 py-1 pl-5">
                <p className="mb-3 font-mono text-micro font-medium uppercase tracking-[0.08em] text-fg-subtle">
                  Executive Summary
                </p>
                <p className="font-sans text-subheading leading-relaxed text-foreground">
                  {report.executive_summary}
                </p>
              </div>
            ) : null}

            {sortedSections.length > 0 ? (
              <div className="space-y-10">
                {sortedSections.map((section, i) => (
                  <SectionBlock key={section.id} section={section} index={i} />
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {hasTOC ? (
          <aside className="hidden xl:block w-[200px] shrink-0">
            <ReportTOC sections={sortedSections} />
          </aside>
        ) : null}
      </AnimatedPage>
    </>
  );
}
