'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/shared/skeleton';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { useReportGenerations } from '@/hooks/useReportGenerations';
import type { GeneratedReport } from '@/types';

const SIDEBAR_DISPLAY_LIMIT = 10;

function groupByDate(reports: GeneratedReport[]) {
  const today: GeneratedReport[] = [];
  const previous7Days: GeneratedReport[] = [];
  const older: GeneratedReport[] = [];

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(todayStart);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  for (const r of reports) {
    const d = new Date(r.created_at);
    if (d >= todayStart) today.push(r);
    else if (d >= sevenDaysAgo) previous7Days.push(r);
    else older.push(r);
  }

  return { today, previous7Days, older };
}

export function ReportHistorySidebar() {
  const pathname = usePathname();
  const companyId = useCurrentCompanyId();
  const { data, isLoading } = useReportGenerations(companyId);
  const allReports = data?.generations ?? [];
  const totalCount = data?.total ?? allReports.length;
  // Cap sidebar to 10 most-recent. The fetch buffers 20 for snappier nav,
  // but the sidebar is a quick-access surface — full browsing lives in
  // /reports/history.
  const reports = allReports.slice(0, SIDEBAR_DISPLAY_LIMIT);
  const hasMore = totalCount > reports.length;
  const { today, previous7Days, older } = groupByDate(reports);

  const renderGroup = (title: string, group: GeneratedReport[]) => {
    if (group.length === 0) return null;
    return (
      <div className="mb-6">
        <h3 className="mb-2 px-4 font-sans text-micro font-semibold uppercase tracking-wider text-fg-muted">
          {title}
        </h3>
        <ul className="space-y-0.5 px-2">
          {group.map((report) => {
            const href = `/reports/${report.id}`;
            const isActive = pathname === href;
            return (
              <li key={report.id}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center rounded-md px-3 py-2 font-sans text-button transition-colors',
                    isActive
                      ? 'bg-accent/10 font-medium text-accent'
                      : 'text-foreground hover:bg-surface-300',
                  )}
                >
                  <span className="truncate">{report.title || 'Untitled report'}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col bg-surface-200">
      <div className="border-b border-border p-4">
        <Link
          href="/reports/ai-generate"
          className="flex w-full items-center justify-between rounded-lg bg-accent px-4 py-2.5 font-sans text-button font-medium text-background transition-colors duration-150 hover:opacity-90"
        >
          <span>New report</span>
          <Plus className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-surface-400 scrollbar-track-transparent hover:scrollbar-thumb-surface-500">
        {!companyId && (
          <p className="px-4 py-6 text-center font-sans text-caption text-muted">
            Select a company to view report history.
          </p>
        )}

        {isLoading && companyId && (
          <div className="mt-2 space-y-4 px-4">
            <Skeleton className="mb-2 h-3 w-16" />
            <div className="space-y-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2">
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && reports.length === 0 && companyId && (
          <p className="px-4 py-6 text-center font-sans text-caption text-muted">
            No reports generated yet.
          </p>
        )}

        {!isLoading && reports.length > 0 && (
          <>
            {renderGroup('Today', today)}
            {renderGroup('Previous 7 Days', previous7Days)}
            {renderGroup('Older', older)}

            {hasMore && (
              <div className="px-4 pt-2">
                <Link
                  href="/reports/history"
                  className={cn(
                    'group inline-flex items-center gap-1 font-sans text-caption text-muted',
                    'transition-colors hover:text-foreground focus-visible:text-foreground',
                    'focus-visible:outline-none',
                  )}
                >
                  <span>View all reports</span>
                  <ChevronRight
                    aria-hidden
                    className="h-3 w-3 transition-transform duration-150 group-hover:translate-x-0.5"
                    strokeWidth={1.75}
                  />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
