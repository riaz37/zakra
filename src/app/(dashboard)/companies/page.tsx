'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import { Building2, Plus, Pencil, Trash2, GitBranch } from 'lucide-react';
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

import { Button } from '@/components/ui/button';
import { CompanyForm, type CompanyFormData } from '@/components/features/companies/company-form';

export default function CompaniesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const [createOpen, setCreateOpen] = useState(false);
  const [createSubParent, setCreateSubParent] = useState<Company | null>(null);
  const [editTarget, setEditTarget] = useState<Company | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);

  // Main paginated companies
  const { data, isLoading, isError, refetch } = useCompanies({
    page: page + 1,
    page_size: DEFAULT_PAGE_SIZE,
    search: search || undefined,
  });

  // Flat list of potential parents for dropdown
  const { data: allCompanies } = useCompanies({
    page_size: 1000,
    company_type: 'parent',
  });

  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany(editTarget?.id ?? '');
  const deleteMutation = useDeleteCompany();

  const columns: ColumnDef<Company>[] = [
    {
      id: 'name',
      header: 'Company',
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            {row.original.parent_id && (
              <GitBranch className="size-3 text-muted/50 rotate-90" />
            )}
            <Button
              variant="link"
              className="h-auto p-0 justify-start font-sans text-[16px] font-medium text-foreground hover:text-accent no-underline text-left"
              onClick={() => router.push(`/companies/${row.original.id}`)}
            >
              {row.original.name}
            </Button>
          </div>
          {row.original.description && (
            <span className="font-sans text-caption text-muted line-clamp-1 max-w-[400px]">
              {row.original.description}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const isSub = row.original.company_type === 'subsidiary';
        return (
          <div className="flex flex-col">
            <span className="font-sans text-button text-muted capitalize">
              {row.original.company_type}
            </span>
            {isSub && row.original.parent_id && (
              <span className="font-sans text-caption text-muted/60">
                Under {allCompanies?.items?.find(c => c.id === row.original.parent_id)?.name || 'Parent'}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const s = row.original.status;
        if (s === 'active' || s === 'inactive' || s === 'suspended') {
          return <StatusBadge status={s} />;
        }
        return <span className="font-sans text-button text-muted">{s}</span>;
      },
    },
    {
      id: 'subsidiaries',
      header: 'Subsidiaries',
      cell: ({ row }) => (
        <span className="font-sans text-button text-muted">
          {row.original.subsidiaries?.length ?? 0}
        </span>
      ),
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
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          {row.original.company_type === 'parent' && (
            <Button
              variant="outline"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                setCreateSubParent(row.original);
              }}
              title="Add Subsidiary"
              className="h-8 w-8 text-accent hover:border-accent/50"
            >
              <GitBranch aria-hidden size={14} strokeWidth={1.75} />
            </Button>
          )}
          <Button
            variant="outline"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              setEditTarget(row.original);
            }}
            aria-label={`Edit ${row.original.name}`}
            className="h-8 w-8"
          >
            <Pencil aria-hidden size={14} strokeWidth={1.75} />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row.original);
            }}
            aria-label={`Delete ${row.original.name}`}
            className="h-8 w-8 hover:text-error hover:border-error/50"
          >
            <Trash2 aria-hidden size={14} strokeWidth={1.75} />
          </Button>
        </div>
      ),
    },
  ];

  const items = data?.items ?? [];
  const totalPages = data?.total_pages ?? 1;

  const parentOptions = allCompanies?.items?.map(c => ({ id: c.id, name: c.name })) ?? [];

  async function handleCreate(formData: CompanyFormData) {
    const payload: CompanyCreate = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || undefined,
    };
    await createMutation.mutateAsync({ 
      data: payload, 
      parentId: formData.parent_id 
    });
    setCreateOpen(false);
    setCreateSubParent(null);
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
        subtitle="Manage all organizations and their hierarchical relationships."
        action={
          <Button
            onClick={() => setCreateOpen(true)}
            className="h-9 px-4 gap-2"
          >
            <Plus aria-hidden size={16} strokeWidth={2} />
            Create Company
          </Button>
        }
      />

      <div className="mb-6 max-w-sm">
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
          title={search ? "No companies match your search" : "No companies yet"}
          description={search ? "Try adjusting your search terms." : "Add your first company to start managing users and data access."}
          action={!search ? (
            <Button
              onClick={() => setCreateOpen(true)}
              className="h-9 px-4 gap-2"
            >
              <Plus aria-hidden size={16} strokeWidth={2} />
              Create Company
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
          caption="Companies list"
          emptyMessage="No companies match your search."
          onRowClick={(row) => router.push(`/companies/${row.id}`)}
        />
      )}

      {/* Main Creation Dialog */}
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
            parentCompanies={parentOptions}
          />
        </DialogContent>
      </Dialog>

      {/* Direct Subsidiary Creation Dialog */}
      <Dialog open={!!createSubParent} onOpenChange={(open) => !open && setCreateSubParent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Subsidiary to {createSubParent?.name}</DialogTitle>
          </DialogHeader>
          <CompanyForm
            initial={{
              parent_id: createSubParent?.id,
            }}
            onSubmit={handleCreate}
            isPending={createMutation.isPending}
            onCancel={() => setCreateSubParent(null)}
            submitLabel="Create Subsidiary"
            parentCompanies={parentOptions}
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
                parent_id: editTarget.parent_id ?? '',
              }}
              onSubmit={handleUpdate}
              isPending={updateMutation.isPending}
              onCancel={() => setEditTarget(null)}
              submitLabel="Save Changes"
              parentCompanies={parentOptions.filter(p => p.id !== editTarget.id)}
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
