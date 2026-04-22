'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { type ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, Shield, Plus, X } from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/format-date';

import {
  useUser,
  useUserRoles,
  useAssignUserRoles,
} from '@/hooks/useUsers';
import { useRoles } from '@/hooks/useRoles';
import type { UserRole, AssignRolesRequest } from '@/types';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/shared/status-badge';
import { DataTable } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';

// ─── User type badge ──────────────────────────────────────────────────────────

function UserTypeBadge({ type }: { type: string }) {
  const label =
    type === 'super_admin' ? 'Super Admin' : type === 'admin' ? 'Admin' : 'Regular';
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

// ─── Assign role form ─────────────────────────────────────────────────────────

function AssignRoleForm({
  userId,
  currentRoleIds,
  onSuccess,
  onCancel,
}: {
  userId: string;
  currentRoleIds: string[];
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const { data: rolesData } = useRoles({ page: 1, page_size: 50 });
  const assignMutation = useAssignUserRoles(userId);

  const availableRoles = (rolesData?.items ?? []).filter(
    (r) => !currentRoleIds.includes(r.id),
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRoleId) return;
    const payload: AssignRolesRequest = {
      role_ids: [...currentRoleIds, selectedRoleId],
    };
    await assignMutation.mutateAsync(payload);
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-[14px] font-medium text-foreground">
          Role
        </label>
        <Select value={selectedRoleId} onValueChange={(value) => { if (value) setSelectedRoleId(value); }}>
          <SelectTrigger>
            <SelectValue placeholder="Select a role…" />
          </SelectTrigger>
          <SelectContent>
            {availableRoles.length === 0 ? (
              <div className="px-2 py-3 font-sans text-[13px] text-muted">
                No additional roles available.
              </div>
            ) : (
              availableRoles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={assignMutation.isPending}
          className="inline-flex items-center justify-center rounded-lg border border-border bg-surface-300 px-4 py-2 font-sans text-[14px] text-foreground transition-colors hover:bg-surface-400 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!selectedRoleId || assignMutation.isPending}
          className="inline-flex items-center justify-center rounded-lg bg-foreground px-4 py-2 font-sans text-[14px] font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
        >
          {assignMutation.isPending ? 'Assigning…' : 'Assign Role'}
        </button>
      </div>
    </form>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [assignRoleOpen, setAssignRoleOpen] = useState(false);

  const { data: user, isLoading, isError } = useUser(id);
  const { data: userRoles, isLoading: rolesLoading } = useUserRoles(id);
  const assignMutation = useAssignUserRoles(id);

  const roleColumns: ColumnDef<UserRole>[] = [
    {
      id: 'name',
      header: 'Role',
      cell: ({ row }) => (
        <span className="font-sans text-[14px] font-medium text-foreground">
          {row.original.name}
        </span>
      ),
    },
    {
      id: 'slug',
      header: 'Slug',
      cell: ({ row }) => (
        <span className="font-mono text-[13px] text-muted">{row.original.slug}</span>
      ),
    },
    {
      id: 'assigned_at',
      header: 'Assigned',
      cell: ({ row }) => (
        <span className="font-sans text-[14px] text-muted">
          {formatDate(row.original.assigned_at)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={async () => {
            if (!userRoles) return;
            const remaining = userRoles
              .filter((r) => r.id !== row.original.id)
              .map((r) => r.id);
            await assignMutation.mutateAsync({ role_ids: remaining });
          }}
          aria-label={`Remove role ${row.original.name}`}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-300 hover:text-error focus-visible:outline-none"
        >
          <X aria-hidden size={13} strokeWidth={1.75} />
        </button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="px-6 py-8">
        <div className="space-y-4">
          <div className="h-5 w-36 animate-pulse rounded bg-surface-300" />
          <div className="h-24 w-full max-w-md animate-pulse rounded-lg bg-surface-300" />
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="px-6 py-8">
        <p className="font-sans text-[14px] text-error">Failed to load user.</p>
        <button
          type="button"
          onClick={() => router.push('/users')}
          className="mt-3 font-sans text-[14px] text-muted underline hover:text-foreground"
        >
          Back to Users
        </button>
      </div>
    );
  }

  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email;
  const initial = (user.first_name?.charAt(0) ?? user.email.charAt(0)).toUpperCase();

  return (
    <div className="px-6 py-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/users" />}>Users</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{fullName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Back + title */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push('/users')}
          aria-label="Back to Users"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-300 text-muted transition-colors hover:bg-surface-400 hover:text-foreground focus-visible:outline-none"
        >
          <ArrowLeft aria-hidden size={14} strokeWidth={1.75} />
        </button>
        <h1 className="font-sans text-[22px] font-normal leading-[1.3] tracking-[-0.11px] text-foreground">
          {fullName}
        </h1>
      </div>

      {/* Profile card */}
      <div className="mb-8 rounded-lg border border-border bg-background p-6">
        <div className="flex items-start gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface-300 font-sans text-[22px] font-medium text-foreground">
            {initial}
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <p className="font-sans text-[18px] font-medium text-foreground">
                {fullName}
              </p>
              <p className="font-sans text-[14px] text-muted">{user.email}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <UserTypeBadge type={user.user_type} />
              {(user.status === 'active' ||
                user.status === 'inactive' ||
                user.status === 'suspended' ||
                user.status === 'pending') && (
                <StatusBadge status={user.status} />
              )}
            </div>
            {user.last_login_at && (
              <p className="font-sans text-[12px] text-muted">
                Last login:{' '}
                {formatDateTime(user.last_login_at)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Roles section */}
      <div className="rounded-lg border border-border bg-background">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-sans text-[16px] font-medium text-foreground">
            Assigned Roles
          </h2>
          <button
            type="button"
            onClick={() => setAssignRoleOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-3.5 py-2 font-sans text-[14px] font-medium text-background transition-colors hover:bg-foreground/90"
          >
            <Plus aria-hidden size={14} strokeWidth={2} />
            Assign Role
          </button>
        </div>

        <div className="p-4">
          {rolesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 animate-pulse rounded bg-surface-300"
                />
              ))}
            </div>
          ) : !userRoles || userRoles.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="No roles assigned"
              description="Assign roles to control what this user can access."
            />
          ) : (
            <DataTable
              columns={roleColumns}
              data={userRoles}
              caption="Assigned roles"
            />
          )}
        </div>
      </div>

      {/* Assign role dialog */}
      <Dialog open={assignRoleOpen} onOpenChange={setAssignRoleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
          </DialogHeader>
          <AssignRoleForm
            userId={id}
            currentRoleIds={userRoles?.map((r) => r.id) ?? []}
            onSuccess={() => setAssignRoleOpen(false)}
            onCancel={() => setAssignRoleOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
