'use client';

import { usePathname } from 'next/navigation';
import { ReportHistorySidebar } from '@/components/features/reports/report-history-sidebar';

/**
 * Reports section layout.
 *
 * Renders a persistent left sidebar (recent generations) for the
 * generation/viewer flow — visible on `/reports/ai-generate`,
 * `/reports/history`, and `/reports/[reportId]`.
 *
 * Templates routes (`/reports/templates/*`) are a distinct workflow
 * (configuration, not browsing) and intentionally render without the
 * sidebar.
 */
export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar =
    !pathname.startsWith('/reports/templates') &&
    !pathname.startsWith('/reports/history');

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      <aside className="hidden h-full w-[260px] shrink-0 border-r border-border md:block">
        <ReportHistorySidebar />
      </aside>
      <div className="relative h-full min-w-0 flex-1">
        {children}
      </div>
    </div>
  );
}
