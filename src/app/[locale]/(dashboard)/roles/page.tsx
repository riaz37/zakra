'use client';

import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Shield, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatDate } from '@/lib/format-date';

import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from '@/hooks/useRoles';
import type { Role, RoleCreate, RoleUpdate } from '@/types';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { useResourceList } from '@/hooks/useResourceList';

import { PageHeader } from '@/components/shared/page-header';
import {
  ScaffoldContainer,
  ScaffoldFilterAndContent,
  ScaffoldActionsContainer,
} from '@/components/shared/scaffold';
import { SearchInput } from '@/components/shared/search-input';
import { DataTable } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { FormDialog } from '@/components/shared/form-dialog';
import { RowActions } from '@/components/shared/row-actions';

import { Button } from '@/components/ui/button';
import { RoleTypeBadge } from '@/components/features/roles/role-type-badge';
import { RoleForm, type RoleFormData } from '@/components/features/roles/role-form';
import { AnimatedPage } from '@/components/shared/animated-container';

export default function RolesPage() {
  const t = useTranslations('dashboard.roles');
  const { search, page, queryPage, setPage, searchProps, isEmpty } = useResourceList();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Role | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);

  const { data, isLoading, isError, refetch } = useRoles({
    page: queryPage,
    page_size: DEFAULT_PAGE_SIZE,
    search: search || undefined,
  });

  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole(editTarget?.id ?? '');
  const deleteMutation = useDeleteRole();

  const columns: ColumnDef<Role>[] = [
    {
      id: 'name',
      header: t('columns.name'),
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-sans text-button font-medium text-foreground">
            {row.original.name}
          </span>
          <span className="font-mono text-caption text-muted">{row.original.slug}</span>
        </div>
      ),
    },
    {
      id: 'type',
      header: t('columns.type'),
      cell: ({ row }) => <RoleTypeBadge type={row.original.role_type} />,
    },
    {
      id: 'description',
      header: t('columns.description'),
      cell: ({ row }) => (
        <span className="font-sans text-button text-muted">
          {row.original.description ?? '-'}
        </span>
      ),
    },
    {
      id: 'hierarchy',
      header: t('columns.level'),
      cell: ({ row }) => (
        <span className="font-sans text-button text-muted">
          {row.original.hierarchy_level}
        </span>
      ),
    },
    {
      id: 'created_at',
      header: t('columns.created'),
      cell: ({ row }) => (
        <span className="font-mono text-mono text-muted">
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
          <RowActions
            onEdit={(e) => { e.stopPropagation(); setEditTarget(row.original); }}
            onDelete={(e) => { e.stopPropagation(); setDeleteTarget(row.original); }}
            editLabel={t('actions.editLabel', { name: row.original.name })}
            deleteLabel={t('actions.deleteLabel', { name: row.original.name })}
            disableEdit={isSystem}
            disableDelete={isSystem}
          />
        );
      },
    },
  ];

  const items = data?.items ?? [];
  const totalCount = data?.total ?? 0;
  const totalPages = data?.total_pages ?? Math.max(1, Math.ceil(totalCount / DEFAULT_PAGE_SIZE));

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
    <ScaffoldContainer>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        primaryActions={
          <Button
            onClick={() => setCreateOpen(true)}
            className="h-9 px-4"
          >
            {t('newRole')}
          </Button>
        }
      />

      <AnimatedPage>
        <ScaffoldFilterAndContent>
          <ScaffoldActionsContainer>
            <div className="w-full max-w-sm">
              <SearchInput {...searchProps} placeholder={t('search.placeholder')} ariaLabel={t('search.ariaLabel')} />
            </div>
          </ScaffoldActionsContainer>

          {isError ? (
            <ErrorState title={t('error.loadTitle')} onRetry={() => refetch()} />
          ) : isEmpty(items, isLoading) ? (
            <EmptyState
              icon={Shield}
              title={search ? t('empty.searchTitle') : t('empty.title')}
              description={search ? t('empty.searchDescription') : t('empty.description')}
              action={!search ? (
                <Button
                  onClick={() => setCreateOpen(true)}
                  className="h-9 px-4 gap-2"
                >
                  <Plus aria-hidden size={16} strokeWidth={2} />
                  {t('newRole')}
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
              emptyMessage={t('emptyMessage')}
            />
          )}
        </ScaffoldFilterAndContent>
      </AnimatedPage>

      <FormDialog open={createOpen} onOpenChange={setCreateOpen} title={t('dialog.createTitle')}>
        <RoleForm
          onSubmit={handleCreate}
          isPending={createMutation.isPending}
          onCancel={() => setCreateOpen(false)}
          submitLabel={t('createRole')}
        />
      </FormDialog>

      <FormDialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        title={t('dialog.editTitle')}
      >
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
            submitLabel={t('saveChanges')}
          />
        )}
      </FormDialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('confirmDelete.title')}
        description={t('confirmDelete.description', { name: deleteTarget?.name ?? '' })}
        confirmLabel={t('confirmDelete.confirmLabel')}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </ScaffoldContainer>
  );
}
