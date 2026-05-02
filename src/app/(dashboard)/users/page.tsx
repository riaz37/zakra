'use client';

import { useState } from 'react';
import { Users, UserPlus } from 'lucide-react';

import {
  useUsers,
  useCreateUser,
  useDeleteUser,
} from '@/hooks/useUsers';
import type { ListUser, UserCreate } from '@/types';
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
import { getUsersColumns } from '@/components/features/users/users-columns';
import { AnimatedPage } from '@/components/shared/animated-container';

export default function UsersPage() {
  const { search, page, queryPage, setPage, searchProps, isEmpty } = useResourceList();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ListUser | null>(null);

  const { data, isLoading, isError, refetch } = useUsers({
    page: queryPage,
    page_size: DEFAULT_PAGE_SIZE,
    search: search || undefined,
  });

  const createMutation = useCreateUser();
  const deleteMutation = useDeleteUser();

  const columns = getUsersColumns({
    onDelete: (user) => setDeleteTarget(user),
  });

  const items = data?.items ?? [];
  const totalPages = data?.total_pages ?? 1;

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
        title="Users"
        subtitle="Invite teammates and manage their access across the workspace."
        primaryActions={
          <Button
            onClick={() => setInviteOpen(true)}
            className="h-9 px-4"
          >
            Invite User
          </Button>
        }
      />

      <AnimatedPage>
        <ScaffoldFilterAndContent>
          <ScaffoldActionsContainer>
            <div className="w-full max-w-sm">
              <SearchInput {...searchProps} placeholder="Search users…" ariaLabel="Search users" />
            </div>
          </ScaffoldActionsContainer>

          {isError ? (
            <ErrorState title="Failed to load users" onRetry={() => refetch()} />
          ) : isEmpty(items, isLoading) ? (
            <EmptyState
              icon={Users}
              title={search ? "No users match your search" : "No users in this workspace"}
              description={search ? "Try adjusting your search terms." : "Invite users to grant them access to data and reports."}
              action={!search ? (
                <Button
                  onClick={() => setInviteOpen(true)}
                  className="h-9 px-4 gap-2"
                >
                  <UserPlus aria-hidden size={16} strokeWidth={2} />
                  Invite User
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
              caption="Users list"
              emptyMessage="No users match your search."
            />
          )}
        </ScaffoldFilterAndContent>
      </AnimatedPage>

      <FormDialog open={inviteOpen} onOpenChange={setInviteOpen} title="Invite User">
        <InviteUserForm
          onSubmit={handleInvite}
          isPending={createMutation.isPending}
          onCancel={() => setInviteOpen(false)}
        />
      </FormDialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete User"
        description={`Are you sure you want to delete "${deleteTarget?.email}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </ScaffoldContainer>
  );
}
