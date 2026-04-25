import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/shared/skeleton';
import { ChatSession } from '@/types/chat';
import { GeneratedReport, ReportGenerationStatus } from '@/types/report';
import { StatusBadge, StatusVariant } from '@/components/shared/status-badge';
import { MessageSquare, FileBarChart, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const REPORT_STATUS_MAP: Record<ReportGenerationStatus, StatusVariant> = {
  pending:   'pending',
  running:   'pending',
  completed: 'active',
  failed:    'suspended',
};

interface RecentActivityProps {
  recentActivity: {
    chats: ChatSession[];
    reports: GeneratedReport[];
  };
  isLoading: boolean;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return 'Unknown';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function RecentActivity({ recentActivity, isLoading }: RecentActivityProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest chats and reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { chats, reports } = recentActivity;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest chats and reports</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Reports */}
          <div className="flex flex-col gap-4">
            <h3 className="font-sans text-button font-medium flex items-center gap-2">
              <FileBarChart className="size-4" /> Reports
            </h3>
            {reports.length === 0 ? (
              <p className="text-caption text-muted">No recent reports.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {reports.map((report) => (
                  <Link
                    key={report.id}
                    href={`/reports/${report.id}`}
                    className="flex flex-col gap-1 rounded-md border p-3 hover:bg-surface-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm truncate pr-4">{report.title || 'Untitled Report'}</span>
                      <StatusBadge status={REPORT_STATUS_MAP[report.status]} label={report.status} size="sm" />
                    </div>
                    <div className="flex items-center text-micro text-muted gap-1">
                      <Clock className="size-3" />
                      {formatDate(report.created_at)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Chats */}
          <div className="flex flex-col gap-4">
            <h3 className="font-sans text-button font-medium flex items-center gap-2">
              <MessageSquare className="size-4" /> Chats
            </h3>
            {chats.length === 0 ? (
              <p className="text-caption text-muted">No recent chats.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {chats.map((chat) => (
                  <Link
                    key={chat.id}
                    href={`/chat/${chat.id}`}
                    className="flex flex-col gap-1 rounded-md border p-3 hover:bg-surface-300 transition-colors"
                  >
                    <span className="font-medium text-sm truncate">{chat.title || 'New Chat'}</span>
                    <div className="flex items-center text-micro text-muted gap-1">
                      <Clock className="size-3" />
                      {formatDate(chat.created_at)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
