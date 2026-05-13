'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { type ColumnDef } from '@tanstack/react-table';
import { Building2, Plus, GitBranch } from 'lucide-react';
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
import { StatusBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { FormDialog } from '@/components/shared/form-dialog';
import { RowActions } from '@/components/shared/row-actions';

import { Button } from '@/components/ui/button';
import { CompanyForm, type CompanyFormData } from '@/components/features/companies/company-form';
import { AnimatedPage } from '@/components/shared/animated-container';

export default function CompaniesPage() {
  const t = useTranslations('dashboard.companies');
  const { search, page, queryPage, setPage, searchProps, isEmpty } = useResourceList();

  const [createOpen, setCreateOpen] = useState(false);
  const [createSubParent, setCreateSubParent] = useState<Company | null>(null);
  const [editTarget, setEditTarget] = useState<Company | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);

  // Main paginated companies
  const { data, isLoading, isError, refetch } = useCompanies({
    page_size: 1000,
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
      header: t('name'),
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            {row.original.parent_id && (
              <GitBranch className="size-3 text-subtle rotate-90" />
            )}
            <Link
              href={`/companies/${row.original.id}`}
              onClick={(e) => e.stopPropagation()}
              className="font-sans text-button font-medium text-foreground hover:text-accent transition-colors"
            >
              {row.original.name}
            </Link>
          </div>
          {row.original.description && (
            <span className="font-sans text-body text-fg-muted line-clamp-1 max-w-[400px]">
              {row.original.description}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'type',
      header: t('type'),
      cell: ({ row }) => {
        const isSub = row.original.company_type === 'subsidiary';
        const parentName = isSub && row.original.parent_id
          ? allCompanies?.items?.find(c => c.id === row.original.parent_id)?.name ?? 'Parent'
          : undefined;
        return (
          <span
            className="font-sans text-body text-fg-muted capitalize"
            title={parentName ? `Under ${parentName}` : undefined}
          >
            {row.original.company_type}
          </span>
        );
      },
    },
    {
      id: 'status',
      header: t('status'),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'subsidiaries',
      header: t('subsidiaries'),
      cell: ({ row }) => (
        <span className="font-sans text-body text-fg-muted">
          {row.original.subsidiaries?.length ?? 0}
        </span>
      ),
    },
    {
      id: 'created_at',
      header: t('created'),
      cell: ({ row }) => (
        <span className="font-mono text-mono-sm text-fg-muted">
          {formatDate(row.original.created_at)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: t('actions'),
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          {row.original.company_type === 'parent' && (
            <Button
              variant="outline"
              size="icon-sm"
              onClick={(e) => { e.stopPropagation(); setCreateSubParent(row.original); }}
              title={t('addSubsidiary')}
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

  const allItems = data?.items ?? [];

  // Backend may return all records regardless of page_size — paginate client-side.
  const filteredItems = useMemo(() => {
    if (!search) return allItems;
    const needle = search.toLowerCase();
    return allItems.filter(
      (c) =>
        c.name.toLowerCase().includes(needle) ||
        c.slug?.toLowerCase().includes(needle) ||
        c.description?.toLowerCase().includes(needle)
    );
  }, [allItems, search]);

  const totalCount = data?.total ?? filteredItems.length;
  const totalPages = data?.total_pages ?? Math.max(1, Math.ceil(filteredItems.length / DEFAULT_PAGE_SIZE));
  const items = filteredItems.slice(page * DEFAULT_PAGE_SIZE, (page + 1) * DEFAULT_PAGE_SIZE);

  // Build parent options and ensure the currently selected parent is ALWAYS included
  // even if it's not in the first page of results.
  const parentOptions = allCompanies?.items?.map(c => ({ id: c.id, name: c.name })) ?? [];

  if (createSubParent && !parentOptions.some(p => p.id === createSubParent.id)) {
    parentOptions.push({ id: createSubParent.id, name: createSubParent.name });
  }

  if (editTarget?.parent_id) {
    const parent = items.find(i => i.id === editTarget.parent_id);
    if (parent && !parentOptions.some(p => p.id === parent.id)) {
      parentOptions.push({ id: parent.id, name: parent.name });
    }
  }

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
        title={t('title')}
        subtitle={t('subtitle')}
        primaryActions={
          <Button
            onClick={() => setCreateOpen(true)}
            className="h-9 px-4"
          >
            {t('createCompany')}
          </Button>
        }
      />

      <AnimatedPage>
        <ScaffoldFilterAndContent className="mt-6">
          <ScaffoldActionsContainer>
            <div className="w-full max-w-sm">
              <SearchInput {...searchProps} placeholder={t('search.placeholder')} ariaLabel={t('search.ariaLabel')} />
            </div>
            <ScaffoldActionsGroup />
          </ScaffoldActionsContainer>

          {isError ? (
            <ErrorState title={t('error.loadTitle')} onRetry={() => refetch()} />
          ) : isEmpty(filteredItems, isLoading) ? (
            <EmptyState
              icon={Building2}
              title={search ? t('empty.searchTitle') : t('empty.title')}
              description={search ? t('empty.searchDescription') : t('empty.description')}
              action={!search ? (
                <Button
                  onClick={() => setCreateOpen(true)}
                  className="h-9 px-4 gap-2"
                >
                  <Plus aria-hidden size={16} strokeWidth={2} />
                  {t('createCompany')}
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
              totalCount={totalCount}
              caption={t('caption')}
              emptyMessage="No companies match your search."
            />
          )}
        </ScaffoldFilterAndContent>
      </AnimatedPage>

      {/* Main Creation Dialog */}
      <FormDialog open={createOpen} onOpenChange={setCreateOpen} title={t('createCompany')}>
        <CompanyForm
          onSubmit={handleCreate}
          isPending={createMutation.isPending}
          onCancel={() => setCreateOpen(false)}
          submitLabel={t('createCompany')}
          parentCompanies={parentOptions}
        />
      </FormDialog>

      {/* Direct Subsidiary Creation Dialog */}
      <FormDialog
        open={!!createSubParent}
        onOpenChange={(open) => !open && setCreateSubParent(null)}
        title={t('addSubsidiaryTo', { name: createSubParent?.name ?? '' })}
      >
        <CompanyForm
          initial={{
            parent_id: createSubParent?.id,
          }}
          onSubmit={handleCreate}
          isPending={createMutation.isPending}
          onCancel={() => setCreateSubParent(null)}
          submitLabel={t('createSubsidiary')}
          parentCompanies={parentOptions}
        />
      </FormDialog>

      <FormDialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        title={t('editCompany')}
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
            submitLabel={t('saveChanges')}
            parentCompanies={parentOptions.filter(p => p.id !== editTarget.id)}
          />
        )}
      </FormDialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('deleteCompany')}
        description={t('confirmDelete', { name: deleteTarget?.name ?? '' })}
        confirmLabel={t('delete')}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </ScaffoldContainer>
  );
}
