'use client';

import { useParams, useRouter } from 'next/navigation';
import { useReportGenerationDetail } from '@/hooks/useReportGenerations';
import { useReportDownload } from '@/hooks/useReportDownload';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { MarkdownRenderer } from '@/components/shared/markdown-renderer';
import type { ReportGenerationStatus } from '@/types';
import { ChevronLeft, Download, AlertCircle, Clock } from 'lucide-react';

// ── Status badge ───────────────────────────────────────────────────────────

const STATUS_STYLES: Record<ReportGenerationStatus, { bg: string; color: string; label: string }> = {
  pending: { bg: 'rgba(229,165,10,0.12)', color: 'var(--color-warning)', label: 'Pending' },
  running: { bg: 'rgba(106,158,196,0.14)', color: 'var(--color-read)', label: 'Generating' },
  completed: { bg: 'rgba(62,207,142,0.12)', color: 'var(--color-accent)', label: 'Completed' },
  failed: { bg: 'rgba(229,72,77,0.12)', color: 'var(--color-error)', label: 'Failed' },
};

function StatusBadge({ status }: { status: ReportGenerationStatus }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
      style={{ background: s.bg, color: s.color, fontFamily: 'var(--font-mono)' }}
    >
      {s.label}
    </span>
  );
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString([], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

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
        <div className="mb-8 h-8 w-32 animate-pulse rounded" style={{ background: 'var(--color-surface-300)' }} />
        <div className="h-32 animate-pulse rounded-[var(--radius-xl)]" style={{ background: 'var(--color-surface-300)' }} />
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded" style={{ background: 'var(--color-surface-300)' }} />
          ))}
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="mx-auto max-w-[760px] px-6 py-8">
        <div className="flex flex-col items-center py-16 text-center">
          <AlertCircle className="h-10 w-10" style={{ color: 'var(--color-muted)' }} />
          <h2
            className="mt-4 text-[18px]"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}
          >
            Report not found
          </h2>
          <button
            onClick={() => router.push('/reports/history')}
            className="mt-4 text-[14px] transition-colors hover:opacity-80"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-muted)' }}
          >
            ← Back to history
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-[760px]">
        {/* Back + breadcrumb */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => router.push('/reports/history')}
            className="flex items-center gap-1.5 text-[13px] transition-colors hover:opacity-80"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-muted)' }}
          >
            <ChevronLeft className="h-4 w-4" />
            Report History
          </button>

          <div className="flex items-center gap-3">
            <StatusBadge status={report.status} />
            {report.has_pdf && (
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center gap-2 rounded-[var(--radius-lg)] px-3 py-2 text-[13px] transition-colors hover:opacity-80 disabled:opacity-50"
                style={{
                  background: 'var(--color-surface-300)',
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-foreground)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <Download className="h-3.5 w-3.5" />
                {isDownloading ? 'Downloading…' : 'Download PDF'}
              </button>
            )}
          </div>
        </div>

        {/* Title & meta */}
        <div className="mb-8">
          <h1
            className="text-[36px]"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              letterSpacing: '-0.72px',
              lineHeight: 1.15,
              color: 'var(--color-foreground)',
            }}
          >
            {report.title || 'Untitled Report'}
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <span
              className="flex items-center gap-1.5 text-[13px]"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}
            >
              <Clock className="h-3.5 w-3.5" />
              {formatDate(report.created_at)}
            </span>
            {report.duration_ms && (
              <span
                className="text-[13px]"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}
              >
                · {(report.duration_ms / 1000).toFixed(1)}s
              </span>
            )}
          </div>
        </div>

        {/* Download error */}
        {downloadError && (
          <div
            className="mb-6 rounded-[var(--radius-lg)] border px-4 py-3 text-[14px]"
            style={{
              background: 'rgba(207,45,86,0.06)',
              borderColor: 'rgba(207,45,86,0.2)',
              fontFamily: 'var(--font-sans)',
              color: 'var(--color-error)',
            }}
          >
            {downloadError}
          </div>
        )}

        {/* Executive summary */}
        {report.executive_summary && (
          <div
            className="mb-8 rounded-[var(--radius-xl)] p-6"
            style={{
              background: 'var(--color-surface-300)',
              border: '1px solid var(--color-border-medium)',
            }}
          >
            <p
              className="mb-3 text-[11px] font-medium uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}
            >
              Executive Summary
            </p>
            <p
              className="text-[16px] leading-relaxed"
              style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-foreground)' }}
            >
              {report.executive_summary}
            </p>
          </div>
        )}

        {/* Report sections */}
        {report.sections.length > 0 && (
          <div className="space-y-10">
            {report.sections
              .sort((a, b) => a.section_index - b.section_index)
              .map((section) => (
                <section key={section.id}>
                  <h2
                    className="mb-4 text-[20px]"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 600,
                      letterSpacing: '-0.2px',
                      color: 'var(--color-foreground)',
                    }}
                  >
                    {section.title}
                  </h2>

                  {section.analysis_text ? (
                    <MarkdownRenderer content={section.analysis_text} />
                  ) : section.status === 'failed' ? (
                    <p
                      className="text-[14px]"
                      style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-error)' }}
                    >
                      {section.error_message || 'Section generation failed.'}
                    </p>
                  ) : (
                    <p
                      className="text-[14px]"
                      style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-muted)' }}
                    >
                      No content generated for this section.
                    </p>
                  )}

                  {/* Query result table */}
                  {section.query_result && section.query_result.row_count > 0 && (
                    <div
                      className="mt-4 overflow-hidden rounded-[var(--radius-lg)] border"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      <div
                        className="px-4 py-2"
                        style={{
                          background: 'var(--color-surface-300)',
                          borderBottom: '1px solid var(--color-border)',
                        }}
                      >
                        <span
                          className="text-[11px]"
                          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}
                        >
                          {section.query_result.row_count} rows
                          {section.query_result.truncated && ' (truncated)'}
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-[12px]">
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                              {section.query_result.columns.map((col) => (
                                <th
                                  key={col}
                                  className="px-4 py-2 text-left font-medium"
                                  style={{
                                    fontFamily: 'var(--font-mono)',
                                    color: 'var(--color-muted)',
                                    background: 'var(--color-surface-200)',
                                  }}
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
                                style={{ borderBottom: '1px solid var(--color-border)' }}
                              >
                                {cells.map((cell, colIdx) => (
                                  <td
                                    key={colIdx}
                                    className="px-4 py-2"
                                    style={{
                                      fontFamily: 'var(--font-mono)',
                                      color: 'var(--color-foreground)',
                                    }}
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
            className="mt-8 rounded-[var(--radius-xl)] border px-6 py-5"
            style={{
              background: 'rgba(207,45,86,0.06)',
              borderColor: 'rgba(207,45,86,0.2)',
            }}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" style={{ color: 'var(--color-error)' }} />
              <div>
                <p
                  className="text-[14px] font-medium"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-error)' }}
                >
                  Report generation failed
                </p>
                <p
                  className="mt-1 text-[13px]"
                  style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-error)' }}
                >
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
