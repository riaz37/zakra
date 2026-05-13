'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
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

function formatDate(dateStr: string | null, unknown: string) {
  if (!dateStr) return unknown;
  return new Date(dateStr).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function RecentActivity({ recentActivity, isLoading }: RecentActivityProps) {
  const t = useTranslations('dashboard.overview.recentActivity');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <Skeleton className="h-5 w-24" rounded="sm" />
              <div className="flex flex-col gap-3">
                <Skeleton className="h-[68px] w-full" rounded="md" />
                <Skeleton className="h-[68px] w-full" rounded="md" />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <Skeleton className="h-5 w-24" rounded="sm" />
              <div className="flex flex-col gap-3">
                <Skeleton className="h-[68px] w-full" rounded="md" />
                <Skeleton className="h-[68px] w-full" rounded="md" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { chats, reports } = recentActivity;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h3 className="font-sans text-button font-medium flex items-center gap-2">
              <FileBarChart className="size-4" /> {t('reportsHeading')}
            </h3>
            {reports.length === 0 ? (
              <p className="text-caption text-muted">{t('noRecentReports')}</p>
            ) : (
              <div className="flex flex-col gap-3">
                {reports.map((report) => (
                  <Link
                    key={report.id}
                    href={`/reports/${report.id}`}
                    className="flex flex-col gap-1 rounded-md border p-3 hover:bg-surface-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-button truncate pr-4">{report.title || t('untitledReport')}</span>
                      <StatusBadge status={REPORT_STATUS_MAP[report.status]} label={report.status} size="sm" />
                    </div>
                    <div className="flex items-center text-micro text-muted gap-1">
                      <Clock className="size-3" />
                      {formatDate(report.created_at, t('unknown'))}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-sans text-button font-medium flex items-center gap-2">
              <MessageSquare className="size-4" /> {t('chatsHeading')}
            </h3>
            {chats.length === 0 ? (
              <p className="text-caption text-muted">{t('noRecentChats')}</p>
            ) : (
              <div className="flex flex-col gap-3">
                {chats.map((chat) => (
                  <Link
                    key={chat.id}
                    href={`/chat/${chat.id}`}
                    className="flex flex-col gap-1 rounded-md border p-3 hover:bg-surface-300 transition-colors"
                  >
                    <span className="font-medium text-button truncate">{chat.title || t('newChat')}</span>
                    <div className="flex items-center text-micro text-muted gap-1">
                      <Clock className="size-3" />
                      {formatDate(chat.created_at, t('unknown'))}
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
