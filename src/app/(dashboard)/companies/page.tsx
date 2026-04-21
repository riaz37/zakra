'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import { Building2, Plus, Pencil, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/format-date';

import {
  useCompanies,
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
} from '@/hooks/useCompanies';
import type { Company, CompanyCreate, CompanyUpdate } from '@/types';
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

// ─── Company form ─────────────────────────────────────────────────────────────

interface CompanyFormData {
  name: string;
  slug: string;
  description: string;
  status: 'active' | 'inactive' | 'suspended';
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

interface CompanyFormProps {
  initial?: Partial<CompanyFormData>;
  onSubmit: (data: CompanyFormData) => void;
  isPending: boolean;
  onCancel: () => void;
  submitLabel?: string;
}

function CompanyForm({
  initial,
  onSubmit,
  isPending,
  onCancel,
  submitLabel = 'Create Company',
}: CompanyFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [status, setStatus] = useState<'active' | 'inactive' | 'suspended'>(
    initial?.status ?? 'active',
  );
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
      setNameError('Company name is required.');
      return;
    }
    onSubmit({ name: name.trim(), slug: slug || slugify(name), description, status });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="company-name">Name *</Label>
        <Input
          id="company-name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Acme Corp"
          aria-invalid={!!nameError}
        />
        {nameError ? (
          <p className="font-sans text-[12px] text-error">{nameError}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="company-slug">Slug</Label>
        <Input
          id="company-slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="acme-corp"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="company-status">Status</Label>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as typeof status)}
        >
          <SelectTrigger id="company-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="company-description">Description</Label>
        <Input
          id="company-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
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

export default function CompaniesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Company | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);

  const { data, isLoading, isError, refetch } = useCompanies({
    page: page + 1,
    page_size: DEFAULT_PAGE_SIZE,
    search: search || undefined,
  });

  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany(editTarget?.id ?? '');
  const deleteMutation = useDeleteCompany();

  const columns: ColumnDef<Company>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => router.push(`/companies/${row.original.id}`)}
          className="font-sans text-[14px] font-medium text-foreground hover:text-accent transition-colors text-left"
        >
          {row.original.name}
        </button>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <span className="font-sans text-[14px] text-muted capitalize">
          {row.original.company_type}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const s = row.original.status;
        if (s === 'active' || s === 'inactive' || s === 'suspended') {
          return <StatusBadge status={s} />;
        }
        return <span className="font-sans text-[14px] text-muted">{s}</span>;
      },
    },
    {
      id: 'subsidiaries',
      header: 'Subsidiaries',
      cell: ({ row }) => (
        <span className="font-sans text-[14px] text-muted">
          {row.original.subsidiaries?.length ?? 0}
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
      cell: ({ row }) => (
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setEditTarget(row.original);
            }}
            aria-label={`Edit ${row.original.name}`}
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
            aria-label={`Delete ${row.original.name}`}
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

  async function handleCreate(formData: { name: string; slug: string; description: string; status: string }) {
    const payload: CompanyCreate = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || undefined,
    };
    await createMutation.mutateAsync({ data: payload });
    setCreateOpen(false);
  }

  async function handleUpdate(formData: { name: string; status: string; description: string }) {
    if (!editTarget) return;
    const payload: CompanyUpdate = {
      name: formData.name,
      status: formData.status as CompanyUpdate['status'],
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
        title="Companies"
        action={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 font-sans text-[14px] font-medium text-white transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            <Plus aria-hidden size={15} strokeWidth={2} />
            Create Company
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
          placeholder="Search companies…"
          ariaLabel="Search companies"
        />
      </div>

      {isError ? (
        <div className="rounded-lg border border-border bg-background px-4 py-8 text-center">
          <p className="font-sans text-[14px] text-error">Failed to load companies.</p>
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
          icon={Building2}
          title="No companies yet"
          description="Add your first company to start managing users and data access."
          action={
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 font-sans text-[14px] font-medium text-white transition-colors hover:bg-accent/90"
            >
              <Plus aria-hidden size={15} strokeWidth={2} />
              Create Company
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
          caption="Companies list"
          emptyMessage="No companies match your search."
        />
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Company</DialogTitle>
          </DialogHeader>
          <CompanyForm
            onSubmit={handleCreate}
            isPending={createMutation.isPending}
            onCancel={() => setCreateOpen(false)}
            submitLabel="Create Company"
          />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <CompanyForm
              initial={{
                name: editTarget.name,
                slug: editTarget.slug,
                description: editTarget.description ?? '',
                status: editTarget.status as 'active' | 'inactive' | 'suspended',
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
        title="Delete Company"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
