'use client';

import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Shield, Plus, Pencil, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/format-date';

import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from '@/hooks/useRoles';
import type { Role, RoleCreate, RoleUpdate } from '@/types';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';

import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { RoleTypeBadge } from '@/components/features/roles/role-type-badge';
import { RoleForm, type RoleFormData } from '@/components/features/roles/role-form';

export default function RolesPage() {
  const [page, setPage] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Role | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);

  const { data, isLoading, isError, refetch } = useRoles({
    page: page + 1,
    page_size: DEFAULT_PAGE_SIZE,
  });

  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole(editTarget?.id ?? '');
  const deleteMutation = useDeleteRole();

  const columns: ColumnDef<Role>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-sans text-[14px] font-medium text-foreground">
            {row.original.name}
          </span>
          <span className="font-mono text-[12px] text-muted">{row.original.slug}</span>
        </div>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      cell: ({ row }) => <RoleTypeBadge type={row.original.role_type} />,
    },
    {
      id: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span className="font-sans text-[14px] text-muted">
          {row.original.description ?? '—'}
        </span>
      ),
    },
    {
      id: 'hierarchy',
      header: 'Level',
      cell: ({ row }) => (
        <span className="font-sans text-[14px] text-muted">
          {row.original.hierarchy_level}
        </span>
      ),
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
      cell: ({ row }) => {
        const isSystem = row.original.role_type === 'system';
        return (
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setEditTarget(row.original);
              }}
              disabled={isSystem}
              aria-label={`Edit ${row.original.name}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-300 hover:text-foreground focus-visible:outline-none disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Pencil aria-hidden size={13} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTarget(row.original);
              }}
              disabled={isSystem}
              aria-label={`Delete ${row.original.name}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-300 hover:text-error focus-visible:outline-none disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Trash2 aria-hidden size={13} strokeWidth={1.75} />
            </button>
          </div>
        );
      },
    },
  ];

  const items = data?.items ?? [];
  const totalPages = data?.total_pages ?? 1;

  async function handleCreate(formData: RoleFormData) {
    const payload: RoleCreate = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || undefined,
    };
    await createMutation.mutateAsync(payload);
    setCreateOpen(false);
  }

  async function handleUpdate(formData: RoleFormData) {
    if (!editTarget) return;
    const payload: RoleUpdate = {
      name: formData.name,
      description: formData.description || undefined,
    };
    await updateMutation.mutateAsync(payload);
    setEditTarget(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <div className="px-6 py-8">
      <PageHeader
        title="Roles"
        action={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-3.5 py-2 font-sans text-[14px] font-medium text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none"
          >
            <Plus aria-hidden size={15} strokeWidth={2} />
            New Role
          </button>
        }
      />

      {isError ? (
        <ErrorState title="Failed to load roles" onRetry={() => refetch()} />
      ) : items.length === 0 && !isLoading ? (
        <EmptyState
          icon={Shield}
          title="No roles defined"
          description="Create roles to control what each user type can access."
          action={
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-3.5 py-2 font-sans text-[14px] font-medium text-background transition-colors hover:bg-foreground/90"
            >
              <Plus aria-hidden size={15} strokeWidth={2} />
              New Role
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
          caption="Roles list"
          emptyMessage="No roles found."
        />
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Role</DialogTitle>
          </DialogHeader>
          <RoleForm
            onSubmit={handleCreate}
            isPending={createMutation.isPending}
            onCancel={() => setCreateOpen(false)}
            submitLabel="Create Role"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <RoleForm
              initial={{
                name: editTarget.name,
                slug: editTarget.slug,
                description: editTarget.description ?? '',
              }}
              onSubmit={handleUpdate}
              isPending={updateMutation.isPending}
              onCancel={() => setEditTarget(null)}
              submitLabel="Save Changes"
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Role"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? Users with this role will lose the associated permissions.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
