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
          <button
            type="button"
            onClick={() => router.push(`/users/${row.original.id}`)}
            className="flex items-center gap-2.5 text-left hover:text-accent transition-colors"
          >
            <AvatarInitial name={fullName} email={row.original.email} />
            <span className="font-sans text-[14px] font-medium text-foreground">
              {fullName || row.original.email}
            </span>
          </button>
        );
      },
    },
    {
      id: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <span className="font-sans text-[14px] text-muted">{row.original.email}</span>
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
        return <span className="font-sans text-[14px] text-muted">{s}</span>;
      },
    },
    {
      id: 'created_at',
      header: 'Created',
      cell: ({ row }) => (
        <span className="font-sans text-[14px] text-muted">
          {formatDate(row.original.created_at)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/users/${row.original.id}`);
            }}
            aria-label={`Edit ${row.original.email}`}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-300 hover:text-foreground focus-visible:outline-none"
          >
            <Pencil aria-hidden size={13} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row.original);
            }}
            aria-label={`Delete ${row.original.email}`}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-300 hover:text-error focus-visible:outline-none"
          >
            <Trash2 aria-hidden size={13} strokeWidth={1.75} />
          </button>
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
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-3.5 py-2 font-sans text-[14px] font-medium text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none"
          >
            <UserPlus aria-hidden size={15} strokeWidth={2} />
            Invite User
          </button>
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
        <div className="rounded-lg border border-border bg-background px-4 py-8 text-center">
          <p className="font-sans text-[14px] text-error">Failed to load users.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 font-sans text-[14px] text-muted underline hover:text-foreground"
          >
            Try again
          </button>
        </div>
      ) : items.length === 0 && !isLoading ? (
        <EmptyState
          icon={Users}
          title="No users in this workspace"
          description="Invite users to grant them access to data and reports."
          action={
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-3.5 py-2 font-sans text-[14px] font-medium text-background transition-colors hover:bg-foreground/90"
            >
              <UserPlus aria-hidden size={15} strokeWidth={2} />
              Invite User
            </button>
          }
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
