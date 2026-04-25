'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import { Users, UserPlus, Pencil, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/format-date';

import {
  useUsers,
  useCreateUser,
  useDeleteUser,
} from '@/hooks/useUsers';
import type { ListUser, UserCreate } from '@/types';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';

import { PageHeader } from '@/components/shared/page-header';
import { SearchInput } from '@/components/shared/search-input';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { InviteUserForm, type InviteFormData } from '@/components/features/users/invite-user-form';
import { UserTypeBadge } from '@/components/features/users/user-type-badge';
import { AvatarInitial } from '@/components/features/users/avatar-initial';

export default function UsersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ListUser | null>(null);

  const { data, isLoading, isError, refetch } = useUsers({
    page: page + 1,
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
      cell: ({ row }) => {
        const s = row.original.status;
        if (s === 'active' || s === 'inactive' || s === 'suspended' || s === 'pending') {
          return <StatusBadge status={s} />;
        }
        return <span className="font-sans text-button text-muted">{s}</span>;
      },
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
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/users/${row.original.id}`);
            }}
            aria-label={`Edit ${row.original.email}`}
          >
            <Pencil aria-hidden size={13} strokeWidth={1.75} />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row.original);
            }}
            aria-label={`Delete ${row.original.email}`}
            className="hover:text-error"
          >
            <Trash2 aria-hidden size={13} strokeWidth={1.75} />
          </Button>
        </div>
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
    <div className="px-6 py-8">
      <PageHeader
        title="Users"
        action={
          <Button
            onClick={() => setInviteOpen(true)}
            className="h-9 px-4"
          >
            <UserPlus aria-hidden size={15} strokeWidth={2} />
            Invite User
          </Button>
        }
      />

      <div className="mb-4 max-w-sm">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(0);
          }}
          placeholder="Search users…"
          ariaLabel="Search users"
        />
      </div>

      {isError ? (
        <ErrorState title="Failed to load users" onRetry={() => refetch()} />
      ) : items.length === 0 && !isLoading ? (
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

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
          </DialogHeader>
          <InviteUserForm
            onSubmit={handleInvite}
            isPending={createMutation.isPending}
            onCancel={() => setInviteOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete User"
        description={`Are you sure you want to delete "${deleteTarget?.email}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
