import { ReportHistorySidebar } from '@/components/features/reports/report-history-sidebar';

export default function AIGenerateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="hidden h-full w-[260px] shrink-0 border-r border-border md:block">
        <ReportHistorySidebar />
      </div>
      <div className="relative h-full min-w-0 flex-1">
        {children}
      </div>
    </div>
  );
}
