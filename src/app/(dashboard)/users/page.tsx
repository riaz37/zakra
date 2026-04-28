'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import { Users, UserPlus } from 'lucide-react';
import { formatDate } from '@/lib/format-date';

import {
  useUsers,
  useCreateUser,
  useDeleteUser,
} from '@/hooks/useUsers';
import type { ListUser, UserCreate } from '@/types';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { useResourceList } from '@/hooks/useResourceList';

import { PageHeader } from '@/components/shared/page-header';
import {
  ScaffoldContainer,
  ScaffoldFilterAndContent,
  ScaffoldActionsContainer,
} from '@/components/shared/scaffold';
import { SearchInput } from '@/components/shared/search-input';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { FormDialog } from '@/components/shared/form-dialog';
import { RowActions } from '@/components/shared/row-actions';

import { Button } from '@/components/ui/button';
import { InviteUserForm, type InviteFormData } from '@/components/features/users/invite-user-form';
import { UserTypeBadge } from '@/components/features/users/user-type-badge';
import { AvatarInitial } from '@/components/features/users/avatar-initial';

export default function UsersPage() {
  const router = useRouter();
  const { search, page, queryPage, setPage, searchProps, isEmpty } = useResourceList();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ListUser | null>(null);

  const { data, isLoading, isError, refetch } = useUsers({
    page: queryPage,
    page_size: DEFAULT_PAGE_SIZE,
    search: search || undefined,
  });

  const createMutation = useCreateUser();
  const deleteMutation = useDeleteUser();

  const columns: ColumnDef<ListUser>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const fullName = [row.original.first_name, row.original.last_name]
          .filter(Boolean)
          .join(' ');
        return (
          <Button
            variant="link"
            className="flex h-auto items-center gap-2.5 p-0 text-left hover:text-accent font-medium text-foreground no-underline"
            onClick={() => router.push(`/users/${row.original.id}`)}
          >
            <AvatarInitial name={fullName} email={row.original.email} />
            <span className="font-sans text-button">
              {fullName || row.original.email}
            </span>
          </Button>
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
        <span className="font-sans text-button text-muted">
          {formatDate(row.original.created_at)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <RowActions
          onEdit={(e) => { e.stopPropagation(); router.push(`/users/${row.original.id}`); }}
          onDelete={(e) => { e.stopPropagation(); setDeleteTarget(row.original); }}
          editLabel={`Edit ${row.original.email}`}
          deleteLabel={`Delete ${row.original.email}`}
        />
      ),
    },
  ];

  const items = data?.items ?? [];
  const totalPages = data?.total_pages ?? 1;

  async function handleInvite(formData: InviteFormData) {
    const payload: UserCreate = {
      email: formData.email,
      password: formData.password,
      first_name: formData.first_name || undefined,
      last_name: formData.last_name || undefined,
      user_type: formData.user_type,
    };
    await createMutation.mutateAsync({ data: payload });
    setInviteOpen(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync({ id: deleteTarget.id });
    setDeleteTarget(null);
  }

  return (
    <ScaffoldContainer>
      <PageHeader
        title="Users"
        subtitle="Invite teammates and manage their access across the workspace."
        primaryActions={
          <Button
            onClick={() => setInviteOpen(true)}
            className="h-9 px-4"
          >
            <UserPlus aria-hidden size={15} strokeWidth={2} />
            Invite User
          </Button>
        }
      />

      <ScaffoldFilterAndContent>
        <ScaffoldActionsContainer>
          <div className="w-full max-w-sm">
            <SearchInput {...searchProps} placeholder="Search users…" ariaLabel="Search users" />
          </div>
        </ScaffoldActionsContainer>

        {isError ? (
          <ErrorState title="Failed to load users" onRetry={() => refetch()} />
        ) : isEmpty(items, isLoading) ? (
          <EmptyState
            icon={Users}
            title={search ? "No users match your search" : "No users in this workspace"}
            description={search ? "Try adjusting your search terms." : "Invite users to grant them access to data and reports."}
            action={!search ? (
              <Button
                onClick={() => setInviteOpen(true)}
                className="h-9 px-4"
              >
                <UserPlus aria-hidden size={15} strokeWidth={2} />
                Invite User
              </Button>
            ) : undefined}
          />
        ) : (
          <DataTable
            columns={columns}
            data={items}
            isLoading={isLoading}
            pageIndex={page}
            pageCount={totalPages}
            onPageChange={setPage}
            pageSize={DEFAULT_PAGE_SIZE}
            totalCount={data?.total}
            caption="Users list"
            emptyMessage="No users match your search."
          />
        )}
      </ScaffoldFilterAndContent>

      <FormDialog open={inviteOpen} onOpenChange={setInviteOpen} title="Invite User">
        <InviteUserForm
          onSubmit={handleInvite}
          isPending={createMutation.isPending}
          onCancel={() => setInviteOpen(false)}
        />
      </FormDialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete User"
        description={`Are you sure you want to delete "${deleteTarget?.email}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </ScaffoldContainer>
  );
}
