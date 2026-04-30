'use client';

import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Building2, Plus, GitBranch, List, Network } from 'lucide-react';
import { formatDate } from '@/lib/format-date';

import {
  useCompanies,
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
} from '@/hooks/useCompanies';
import type { Company, CompanyCreate, CompanyUpdate } from '@/types';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { useResourceList } from '@/hooks/useResourceList';

import { PageHeader } from '@/components/shared/page-header';
import {
  ScaffoldContainer,
  ScaffoldFilterAndContent,
  ScaffoldActionsContainer,
  ScaffoldActionsGroup,
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
import { CompanyForm, type CompanyFormData } from '@/components/features/companies/company-form';
import { CompanyHierarchy } from '@/components/features/companies/company-hierarchy';
import { cn } from '@/lib/utils';

type CompaniesView = 'list' | 'hierarchy';

export default function CompaniesPage() {
  const [view, setView] = useState<CompaniesView>('list');
  const { search, page, queryPage, setPage, searchProps, isEmpty } = useResourceList();

  const [createOpen, setCreateOpen] = useState(false);
  const [createSubParent, setCreateSubParent] = useState<Company | null>(null);
  const [editTarget, setEditTarget] = useState<Company | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);

  // Main paginated companies
  const { data, isLoading, isError, refetch } = useCompanies({
    page: queryPage,
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
              <GitBranch className="size-3 text-subtle rotate-90" />
            )}
            <span className="font-sans text-[16px] font-medium text-foreground">
              {row.original.name}
            </span>
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
              <span className="font-sans text-caption text-muted">
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
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
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
        <span className="font-mono text-mono text-muted">
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
              onClick={(e) => { e.stopPropagation(); setCreateSubParent(row.original); }}
              title="Add Subsidiary"
              className="h-8 w-8 text-accent hover:border-accent/50"
            >
              <GitBranch aria-hidden size={14} strokeWidth={1.75} />
            </Button>
          )}
          <RowActions
            variant="outline-icon"
            onEdit={(e) => { e.stopPropagation(); setEditTarget(row.original); }}
            onDelete={(e) => { e.stopPropagation(); setDeleteTarget(row.original); }}
            editLabel={`Edit ${row.original.name}`}
            deleteLabel={`Delete ${row.original.name}`}
          />
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
    <ScaffoldContainer>
      <PageHeader
        title="Companies"
        subtitle="Manage all organizations and their hierarchical relationships."
        primaryActions={
          <Button
            onClick={() => setCreateOpen(true)}
            className="h-9 px-4 gap-2"
          >
            <Plus aria-hidden size={16} strokeWidth={2} />
            Create Company
          </Button>
        }
      />

      <div className="mt-2 flex items-center gap-1 rounded-md border border-border bg-surface-200 p-0.5 w-fit">
        <button
          type="button"
          onClick={() => setView('list')}
          aria-pressed={view === 'list'}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 font-sans text-button transition-colors',
            view === 'list'
              ? 'bg-surface-400 text-foreground'
              : 'text-muted hover:text-foreground',
          )}
        >
          <List aria-hidden size={13} strokeWidth={1.75} />
          List
        </button>
        <button
          type="button"
          onClick={() => setView('hierarchy')}
          aria-pressed={view === 'hierarchy'}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 font-sans text-button transition-colors',
            view === 'hierarchy'
              ? 'bg-surface-400 text-foreground'
              : 'text-muted hover:text-foreground',
          )}
        >
          <Network aria-hidden size={13} strokeWidth={1.75} />
          Hierarchy
        </button>
      </div>

      {view === 'list' ? (
        <ScaffoldFilterAndContent className="mt-6">
          <ScaffoldActionsContainer>
            <div className="w-full max-w-sm">
              <SearchInput {...searchProps} placeholder="Search companies…" ariaLabel="Search companies" />
            </div>
            <ScaffoldActionsGroup />
          </ScaffoldActionsContainer>

          {isError ? (
            <ErrorState title="Failed to load companies" onRetry={() => refetch()} />
          ) : isEmpty(items, isLoading) ? (
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
            />
          )}
        </ScaffoldFilterAndContent>
      ) : (
        <div className="mt-6">
          <CompanyHierarchy />
        </div>
      )}

      {/* Main Creation Dialog */}
      <FormDialog open={createOpen} onOpenChange={setCreateOpen} title="Create Company">
        <CompanyForm
          onSubmit={handleCreate}
          isPending={createMutation.isPending}
          onCancel={() => setCreateOpen(false)}
          submitLabel="Create Company"
          parentCompanies={parentOptions}
        />
      </FormDialog>

      {/* Direct Subsidiary Creation Dialog */}
      <FormDialog
        open={!!createSubParent}
        onOpenChange={(open) => !open && setCreateSubParent(null)}
        title={`Add Subsidiary to ${createSubParent?.name ?? ''}`}
      >
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
      </FormDialog>

      <FormDialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        title="Edit Company"
      >
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
      </FormDialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Company"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </ScaffoldContainer>
  );
}
