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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ─── Invite user form ─────────────────────────────────────────────────────────

interface InviteFormData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  user_type: 'admin' | 'regular';
}

function InviteUserForm({
  onSubmit,
  isPending,
  onCancel,
}: {
  onSubmit: (data: InviteFormData) => void;
  isPending: boolean;
  onCancel: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userType, setUserType] = useState<'admin' | 'regular'>('regular');
  const [emailError, setEmailError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setEmailError('A valid email is required.');
      return;
    }
    onSubmit({
      email: email.trim(),
      password,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      user_type: userType,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="user-first-name">First Name</Label>
          <Input
            id="user-first-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Jane"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="user-last-name">Last Name</Label>
          <Input
            id="user-last-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Smith"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="user-email">Email *</Label>
        <Input
          id="user-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError && e.target.value.includes('@')) setEmailError('');
          }}
          placeholder="jane@example.com"
          aria-invalid={!!emailError}
        />
        {emailError ? (
          <p className="font-sans text-[12px] text-error">{emailError}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="user-password">Password *</Label>
        <Input
          id="user-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="user-type">User Type</Label>
        <Select
          value={userType}
          onValueChange={(v) => setUserType(v as typeof userType)}
        >
          <SelectTrigger id="user-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="regular">Regular</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-lg border border-border bg-surface-300 px-4 py-2 font-sans text-[14px] text-foreground transition-colors hover:bg-surface-400 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-lg bg-foreground px-4 py-2 font-sans text-[14px] font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
        >
          {isPending ? 'Inviting…' : 'Invite User'}
        </button>
      </div>
    </form>
  );
}

// ─── User type badge ──────────────────────────────────────────────────────────

function UserTypeBadge({ type }: { type: string }) {
  const label = type === 'super_admin'
    ? 'Super Admin'
    : type === 'admin'
    ? 'Admin'
    : 'Regular';
  const classes =
    type === 'super_admin'
      ? 'bg-[rgba(192,133,50,0.1)] text-[#c08532]'
      : type === 'admin'
      ? 'bg-[rgba(31,138,101,0.1)] text-[#1a7855]'
      : 'bg-[rgba(38,37,30,0.06)] text-muted';

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 font-sans text-[11px] font-medium leading-none ${classes}`}
    >
      {label}
    </span>
  );
}

// ─── Avatar initial ───────────────────────────────────────────────────────────

function AvatarInitial({ name, email }: { name: string; email: string }) {
  const initial = (name.trim().charAt(0) || email.charAt(0)).toUpperCase();
  return (
    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-300 font-sans text-[12px] font-medium text-foreground">
      {initial}
    </span>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

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
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
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

      {/* Invite dialog */}
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

      {/* Delete confirm */}
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
