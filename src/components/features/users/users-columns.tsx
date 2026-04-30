'use client';

import { type ColumnDef } from '@tanstack/react-table';

import type { ListUser } from '@/types';
import { formatDate } from '@/lib/format-date';
import { StatusBadge } from '@/components/ui/badge';
import { RowActions } from '@/components/shared/row-actions';
import { AvatarInitial } from '@/components/features/users/avatar-initial';
import { UserTypeBadge } from '@/components/features/users/user-type-badge';

interface GetUsersColumnsArgs {
  onDelete: (user: ListUser) => void;
}

export function getUsersColumns({
  onDelete,
}: GetUsersColumnsArgs): ColumnDef<ListUser>[] {
  return [
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const fullName = [row.original.first_name, row.original.last_name]
          .filter(Boolean)
          .join(' ');
        return (
          <div className="flex items-center gap-2.5">
            <AvatarInitial name={fullName} email={row.original.email} />
            <span className="font-sans text-button font-medium text-foreground">
              {fullName || row.original.email}
            </span>
          </div>
        );
      },
    },
    {
      id: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <span className="font-sans text-button text-muted">{row.original.email}</span>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      cell: ({ row }) => <UserTypeBadge type={row.original.user_type} />,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'created_at',
      header: 'Created',
      cell: ({ row }) => (
        <span className="font-mono text-mono text-muted">
          {formatDate(row.original.created_at)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <RowActions
          onDelete={(e) => { e.stopPropagation(); onDelete(row.original); }}
          deleteLabel={`Delete ${row.original.email}`}
        />
      ),
    },
  ];
}
