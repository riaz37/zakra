import { type ColumnDef } from '@tanstack/react-table';
import type { GeneratedReport } from '@/types';
import { formatDateTime } from '@/lib/format-date';
import { StatusBadge } from '@/components/shared/status-badge';

export function getReportGenerationsColumns(): ColumnDef<GeneratedReport>[] {
  return [
    {
      id: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <span className="font-sans text-button font-medium text-foreground">
          {row.original.title || 'Untitled report'}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'sections',
      header: 'Sections',
      cell: ({ row }) => (
        <span className="font-mono text-mono-sm text-muted tabular-nums">
          {row.original.sections.length}
        </span>
      ),
    },
    {
      id: 'created_at',
      header: 'Created',
      cell: ({ row }) => (
        <span className="whitespace-nowrap font-mono text-mono-sm text-muted">
          {formatDateTime(row.original.created_at)}
        </span>
      ),
    },
  ];
}
