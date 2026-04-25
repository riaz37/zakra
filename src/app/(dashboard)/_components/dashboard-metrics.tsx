import {
  Users,
  Database,
  FileBarChart,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/shared/skeleton';
import { DashboardMetrics as DashboardMetricsType } from '@/hooks/useDashboardData';

interface DashboardMetricsProps {
  metrics: DashboardMetricsType;
  isLoading: boolean;
}

export function DashboardMetrics({ metrics, isLoading }: DashboardMetricsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="size-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const {
    totalUsers,
    totalConnections,
    totalReports,
    totalChatSessions,
    avgReportDurationMs,
  } = metrics;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="size-4 text-muted-foreground" aria-hidden />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-feat-tnum">{totalUsers}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
          <Database className="size-4 text-muted-foreground" aria-hidden />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-feat-tnum">{totalConnections}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
          <FileBarChart className="size-4 text-muted-foreground" aria-hidden />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-feat-tnum">{totalReports}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Chat Sessions</CardTitle>
          <MessageSquare className="size-4 text-muted-foreground" aria-hidden />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-feat-tnum">{totalChatSessions}</div>
        </CardContent>
      </Card>
    </div>
  );
}
