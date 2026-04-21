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
import { ConfirmDialog } from '@/components/shared/confirm-dialog';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ─── Role type badge ──────────────────────────────────────────────────────────

function RoleTypeBadge({ type }: { type: Role['role_type'] }) {
  const label =
    type === 'system'
      ? 'System'
      : type === 'company_default'
      ? 'Company Default'
      : 'Custom';
  const classes =
    type === 'system'
      ? 'bg-[rgba(159,187,224,0.2)] text-[#4a7fa8]'
      : type === 'company_default'
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

// ─── Role form ────────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

interface RoleFormData {
  name: string;
  slug: string;
  description: string;
}

function RoleForm({
  initial,
  onSubmit,
  isPending,
  onCancel,
  submitLabel = 'Create Role',
}: {
  initial?: Partial<RoleFormData>;
  onSubmit: (data: RoleFormData) => void;
  isPending: boolean;
  onCancel: () => void;
  submitLabel?: string;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [nameError, setNameError] = useState('');

  function handleNameChange(value: string) {
    setName(value);
    if (!initial?.slug) {
      setSlug(slugify(value));
    }
    if (nameError && value.trim()) setNameError('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Role name is required.');
      return;
    }
    onSubmit({ name: name.trim(), slug: slug || slugify(name), description });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="role-name">Name *</Label>
        <Input
          id="role-name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Data Viewer"
          aria-invalid={!!nameError}
        />
        {nameError ? (
          <p className="font-sans text-[12px] text-error">{nameError}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="role-slug">Slug</Label>
        <Input
          id="role-slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="data-viewer"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="role-description">Description</Label>
        <Input
          id="role-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description of this role's permissions"
        />
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
          className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 font-sans text-[14px] font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
        >
          {isPending ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

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
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setEditTarget(row.original);
              }}
              disabled={isSystem}
              aria-label={`Edit ${row.original.name}`}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-300 hover:text-foreground focus-visible:outline-none disabled:opacity-30 disabled:cursor-not-allowed"
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
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-300 hover:text-error focus-visible:outline-none disabled:opacity-30 disabled:cursor-not-allowed"
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
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 font-sans text-[14px] font-medium text-white transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            <Plus aria-hidden size={15} strokeWidth={2} />
            New Role
          </button>
        }
      />

      {isError ? (
        <div className="rounded-lg border border-border bg-background px-4 py-8 text-center">
          <p className="font-sans text-[14px] text-error">Failed to load roles.</p>
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
          icon={Shield}
          title="No roles defined"
          description="Create roles to control what each user type can access."
          action={
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 font-sans text-[14px] font-medium text-white transition-colors hover:bg-accent/90"
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

      {/* Create dialog */}
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

      {/* Edit dialog */}
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

      {/* Delete confirm */}
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
