import { useMemo } from 'react';
import { useChatSessions } from './useChatSessions';
import { useReportGenerations } from './useReportGenerations';
import { useUsers } from './useUsers';
import { useDbConnections } from './useDbConnections';

export interface DashboardMetrics {
  totalUsers: number;
  totalConnections: number;
  totalReports: number;
  totalChatSessions: number;
  avgReportDurationMs: number;
}

export interface ActivityDataPoint {
  date: string;
  chats: number;
  reports: number;
}

export interface StatusDataPoint {
  status: string;
  count: number;
  fill: string; // for the chart color
}

export function useDashboardData(companyId?: string) {
  // Fetch data
  const { data: usersData, isLoading: isLoadingUsers } = useUsers({ page: 1, page_size: 1 });
  const { data: connectionsData, isLoading: isLoadingConnections } = useDbConnections({ company_id: companyId, page: 1, page_size: 1 });
  const { data: chatData, isLoading: isLoadingChats } = useChatSessions(companyId);
  const { data: reportData, isLoading: isLoadingReports } = useReportGenerations(companyId, 0, 100);

  const isLoading = isLoadingUsers || isLoadingConnections || isLoadingChats || isLoadingReports;

  // Process Metrics
  const metrics = useMemo<DashboardMetrics>(() => {
    const totalUsers = usersData?.total || 0;
    const totalConnections = connectionsData?.total || 0;
    const totalReports = reportData?.total || 0;
    const totalChatSessions = chatData?.total || 0;

    let avgReportDurationMs = 0;
    if (reportData?.generations && reportData.generations.length > 0) {
      const completed = reportData.generations.filter(r => r.duration_ms != null);
      if (completed.length > 0) {
        const sum = completed.reduce((acc, r) => acc + (r.duration_ms || 0), 0);
        avgReportDurationMs = sum / completed.length;
      }
    }

    return {
      totalUsers,
      totalConnections,
      totalReports,
      totalChatSessions,
      avgReportDurationMs,
    };
  }, [usersData, connectionsData, chatData, reportData]);

  // Process Activity Chart (Last 14 days)
  const activityData = useMemo<ActivityDataPoint[]>(() => {
    const data: Record<string, { chats: number; reports: number }> = {};
    
    // Initialize last 14 days
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      data[dateStr] = { chats: 0, reports: 0 };
    }

    // Aggregate Chats
    if (chatData?.sessions) {
      chatData.sessions.forEach(session => {
        // Some APIs might return without time or just use substring
        if (!session.created_at) return;
        const dateStr = session.created_at.split('T')[0];
        if (data[dateStr]) {
          data[dateStr].chats++;
        }
      });
    }

    // Aggregate Reports
    if (reportData?.generations) {
      reportData.generations.forEach(report => {
        if (!report.created_at) return;
        const dateStr = report.created_at.split('T')[0];
        if (data[dateStr]) {
          data[dateStr].reports++;
        }
      });
    }

    return Object.entries(data).map(([date, counts]) => ({
      date,
      // Format date for display (e.g. "Apr 23")
      formattedDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      chats: counts.chats,
      reports: counts.reports,
    }));
  }, [chatData, reportData]);

  // Process Status Distribution
  const statusData = useMemo<StatusDataPoint[]>(() => {
    const counts: Record<string, number> = {
      completed: 0,
      failed: 0,
      pending: 0,
      running: 0,
    };

    if (reportData?.generations) {
      reportData.generations.forEach(report => {
        const status = report.status;
        if (counts[status] !== undefined) {
          counts[status]++;
        } else {
          counts[status] = 1;
        }
      });
    }

    // Map to chart data format with colors based on tailwind variables
    const colors: Record<string, string> = {
      completed: 'var(--color-completed)',
      failed: 'var(--color-failed)',
      pending: 'var(--color-pending)',
      running: 'var(--color-running)',
    };

    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        status,
        count,
        fill: colors[status] || 'var(--color-other)',
      }));
  }, [reportData]);

  // Recent Activity
  const recentActivity = useMemo(() => {
    const chats = chatData?.sessions?.slice(0, 5) || [];
    const reports = reportData?.generations?.slice(0, 5) || [];
    return { chats, reports };
  }, [chatData, reportData]);

  return {
    isLoading,
    metrics,
    activityData,
    statusData,
    recentActivity,
  };
}
