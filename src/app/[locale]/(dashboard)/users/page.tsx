'use client';

import { useState } from 'react';
import { Users, UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from '@/hooks/useUsers';
import type { ListUser, UserCreate, UserUpdate } from '@/types';
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

import { Button } from '@/components/ui/button';
import { InviteUserForm, type InviteFormData } from '@/components/features/users/invite-user-form';
import { EditUserForm } from '@/components/features/users/edit-user-form';
import { getUsersColumns } from '@/components/features/users/users-columns';
import { AnimatedPage } from '@/components/shared/animated-container';

export default function UsersPage() {
  const t = useTranslations('dashboard.users');
  const router = useRouter();
  const { search, page, queryPage, setPage, searchProps, isEmpty } = useResourceList();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ListUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ListUser | null>(null);

  const { data, isLoading, isError, refetch } = useUsers({
    page: queryPage,
    page_size: DEFAULT_PAGE_SIZE,
    search: search || undefined,
  });

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser(editTarget?.id ?? '');
  const deleteMutation = useDeleteUser();

  const columns = getUsersColumns({
    onEdit: (user) => setEditTarget(user),
    onDelete: (user) => setDeleteTarget(user),
  });

  const items = data?.items ?? [];
  const totalCount = data?.total ?? 0;
  const totalPages = data?.total_pages ?? Math.max(1, Math.ceil(totalCount / DEFAULT_PAGE_SIZE));

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
    <ScaffoldContainer>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        primaryActions={
          <Button
            onClick={() => setInviteOpen(true)}
            className="h-9 px-4"
          >
            {t('inviteUser')}
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
              icon={Users}
              title={search ? t('empty.searchTitle') : t('empty.title')}
              description={search ? t('empty.searchDescription') : t('empty.description')}
              action={!search ? (
                <Button
                  onClick={() => setInviteOpen(true)}
                  className="h-9 px-4 gap-2"
                >
                  <UserPlus aria-hidden size={16} strokeWidth={2} />
                  {t('inviteUser')}
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
              emptyMessage="No users match your search."
              onRowClick={(user) => router.push(`/users/${user.id}`)}
            />
          )}
        </ScaffoldFilterAndContent>
      </AnimatedPage>

      <FormDialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)} title="Edit User">
        {editTarget && (
          <EditUserForm
            userId={editTarget.id}
            initial={{
              first_name: editTarget.first_name ?? '',
              last_name: editTarget.last_name ?? '',
              user_type: (editTarget.user_type === 'super_admin' ? 'admin' : editTarget.user_type) as 'admin' | 'regular',
            }}
            updateMutation={updateMutation}
            onSuccess={() => setEditTarget(null)}
            onCancel={() => setEditTarget(null)}
          />
        )}
      </FormDialog>

      <FormDialog open={inviteOpen} onOpenChange={setInviteOpen} title={t('inviteUser')}>
        <InviteUserForm
          onSubmit={handleInvite}
          isPending={createMutation.isPending}
          onCancel={() => setInviteOpen(false)}
        />
      </FormDialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('deleteUser')}
        description={t('confirmDelete', { email: deleteTarget?.email ?? '' })}
        confirmLabel={t('delete')}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </ScaffoldContainer>
  );
}
