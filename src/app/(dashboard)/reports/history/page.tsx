'use client';

import { useRouter } from 'next/navigation';
import { useReportGenerations } from '@/hooks/useReportGenerations';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import type { ReportGenerationStatus } from '@/types';
import { FileText, Eye } from 'lucide-react';

// ── Status badge ───────────────────────────────────────────────────────────

const STATUS_STYLES: Record<ReportGenerationStatus, { bg: string; color: string; label: string }> = {
  pending: { bg: 'rgba(192,133,50,0.12)', color: '#c08532', label: 'Pending' },
  running: { bg: 'rgba(159,187,224,0.2)', color: '#5a8fc0', label: 'Generating' },
  completed: { bg: 'rgba(31,138,101,0.12)', color: '#1f8a65', label: 'Completed' },
  failed: { bg: 'rgba(207,45,86,0.12)', color: '#cf2d56', label: 'Failed' },
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
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ReportHistoryPage() {
  const router = useRouter();
  const companyId = useCurrentCompanyId();
  const { data, isLoading } = useReportGenerations(companyId);

  const generations = data?.generations ?? [];

  return (
    <div className="mx-auto max-w-[960px] px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-[28px]"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            letterSpacing: '-0.56px',
            color: 'var(--color-foreground)',
          }}
        >
          Report History
        </h1>
        <p
          className="mt-1 text-[15px]"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-muted)' }}
        >
          All generated reports for your workspace.
        </p>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-[var(--radius-lg)]"
              style={{ background: 'var(--color-surface-300)' }}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && generations.length === 0 && (
        <div
          className="flex flex-col items-center rounded-[var(--radius-xl)] border px-8 py-16 text-center"
          style={{
            background: 'var(--color-surface-100)',
            borderColor: 'var(--color-border)',
          }}
        >
          <FileText className="h-7 w-7" strokeWidth={1.25} style={{ color: 'var(--color-muted)', opacity: 0.6 }} />
          <h2
            className="mt-4 text-[18px]"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}
          >
            No reports generated yet
          </h2>
          <p
            className="mt-2 max-w-[340px] text-[15px]"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-muted)' }}
          >
            Generate your first AI report from a template.
          </p>
          <button
            onClick={() => router.push('/reports/ai-generate')}
            className="mt-6 rounded-[var(--radius-lg)] px-5 py-[10px] text-[14px] transition-colors hover:opacity-90"
            style={{
              background: 'var(--color-foreground)',
              color: 'var(--color-background)',
              fontFamily: 'var(--font-display)',
            }}
          >
            Generate a report
          </button>
        </div>
      )}

      {/* Table */}
      {!isLoading && generations.length > 0 && (
        <div
          className="overflow-hidden rounded-[var(--radius-xl)] border"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Report', 'Status', 'Created', 'Actions'].map((col) => (
                  <th
                    key={col}
                    className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider"
                    style={{
                      background: 'var(--color-surface-200)',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-muted)',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody style={{ background: 'var(--color-background)' }}>
              {generations.map((gen) => (
                <tr
                  key={gen.id}
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                  className="group cursor-pointer transition-colors hover:bg-[var(--color-surface-100)]"
                  onClick={() => router.push(`/reports/${gen.id}`)}
                >
                  <td className="px-5 py-4">
                    <p
                      className="text-[14px] font-medium"
                      style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}
                    >
                      {gen.title || 'Untitled report'}
                    </p>
                    {gen.executive_summary && (
                      <p
                        className="mt-0.5 line-clamp-1 text-[12px]"
                        style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-muted)' }}
                      >
                        {gen.executive_summary}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={gen.status} />
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="text-[12px]"
                      style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}
                    >
                      {formatDate(gen.created_at)}
                    </span>
                  </td>
                  <td
                    className="px-5 py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => router.push(`/reports/${gen.id}`)}
                      className="flex items-center gap-1.5 rounded-[var(--radius-md)] px-2.5 py-1.5 text-[12px] transition-colors hover:bg-[var(--color-surface-300)]"
                      style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
