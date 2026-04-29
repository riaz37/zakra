'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';

import type { GeneratedReport } from '@/types';
import { formatDateTime } from '@/lib/format-date';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';

interface GetReportGenerationsColumnsArgs {
  onView: (report: GeneratedReport) => void;
}

export function getReportGenerationsColumns({
  onView,
}: GetReportGenerationsColumnsArgs): ColumnDef<GeneratedReport>[] {
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
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              onView(row.original);
            }}
            aria-label={`View ${row.original.title || 'report'}`}
          >
            <Eye aria-hidden size={13} strokeWidth={1.75} />
          </Button>
        </div>
      ),
    },
  ];
}
