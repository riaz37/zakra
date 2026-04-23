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
import { ErrorState } from '@/components/shared/error-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { CompanyForm, type CompanyFormData } from '@/components/features/companies/company-form';

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
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setEditTarget(row.original);
            }}
            aria-label={`Edit ${row.original.name}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-300 hover:text-foreground focus-visible:outline-none"
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
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-300 hover:text-error focus-visible:outline-none"
          >
            <Trash2 aria-hidden size={13} strokeWidth={1.75} />
          </button>
        </div>
      ),
    },
  ];

  const items = data?.items ?? [];
  const totalPages = data?.total_pages ?? 1;

  async function handleCreate(formData: CompanyFormData) {
    const payload: CompanyCreate = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || undefined,
    };
    await createMutation.mutateAsync({ data: payload });
    setCreateOpen(false);
  }

  async function handleUpdate(formData: CompanyFormData) {
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
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-3.5 py-2 font-sans text-[14px] font-medium text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none"
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
        <ErrorState title="Failed to load companies" onRetry={() => refetch()} />
      ) : items.length === 0 && !isLoading ? (
        <EmptyState
          icon={Building2}
          title="No companies yet"
          description="Add your first company to start managing users and data access."
          action={
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-3.5 py-2 font-sans text-[14px] font-medium text-background transition-colors hover:bg-foreground/90"
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
