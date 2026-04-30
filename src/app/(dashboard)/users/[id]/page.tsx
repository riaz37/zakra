'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import { Shield, Plus, X } from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/format-date';

import {
  useUser,
  useUserRoles,
  useAssignUserRoles,
} from '@/hooks/useUsers';
import { useRoles } from '@/hooks/useRoles';
import type { UserRole, AssignRolesRequest } from '@/types';

import { PageHeader } from '@/components/shared/page-header';
import {
  ScaffoldContainer,
  ScaffoldSection,
  ScaffoldSectionContent,
  ScaffoldSectionDetail,
  ScaffoldSectionTitle,
  ScaffoldSectionDescription,
  ScaffoldDivider,
} from '@/components/shared/scaffold';
import { FormDialog } from '@/components/shared/form-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/shared/status-badge';
import { Skeleton } from '@/components/shared/skeleton';
import { DataTable } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { UserTypeBadge } from '@/components/features/users/user-type-badge';

// ─── Assign role form ─────────────────────────────────────────────────────────

function AssignRoleForm({
  userId,
  currentRoleIds,
  onSuccess,
  onCancel,
}: {
  userId: string;
  currentRoleIds: string[];
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const { data: rolesData } = useRoles({ page: 1, page_size: 50 });
  const assignMutation = useAssignUserRoles(userId);

  const availableRoles = (rolesData?.items ?? []).filter(
    (r) => !currentRoleIds.includes(r.id),
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRoleId) return;
    const payload: AssignRolesRequest = {
      role_ids: [...currentRoleIds, selectedRoleId],
    };
    await assignMutation.mutateAsync(payload);
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="assign-role-select">Role</FieldLabel>
          <Select value={selectedRoleId} onValueChange={(value) => { if (value) setSelectedRoleId(value); }}>
            <SelectTrigger id="assign-role-select">
              <SelectValue placeholder="Select a role…" />
            </SelectTrigger>
            <SelectContent>
              {availableRoles.length === 0 ? (
                <div className="px-2 py-3 font-sans text-button text-muted">
                  No additional roles available.
                </div>
              ) : (
                availableRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={assignMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!selectedRoleId || assignMutation.isPending}
        >
          {assignMutation.isPending ? 'Assigning…' : 'Assign Role'}
        </Button>
      </div>
    </form>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [assignRoleOpen, setAssignRoleOpen] = useState(false);

  const { data: user, isLoading, isError } = useUser(id);
  const { data: userRoles, isLoading: rolesLoading } = useUserRoles(id);
  const assignMutation = useAssignUserRoles(id);

  const roleColumns: ColumnDef<UserRole>[] = [
    {
      id: 'name',
      header: 'Role',
      cell: ({ row }) => (
        <span className="font-sans text-button font-medium text-foreground">
          {row.original.name}
        </span>
      ),
    },
    {
      id: 'slug',
      header: 'Slug',
      cell: ({ row }) => (
        <span className="font-mono text-button text-muted">{row.original.slug}</span>
      ),
    },
    {
      id: 'assigned_at',
      header: 'Assigned',
      cell: ({ row }) => (
        <span className="font-sans text-button text-muted">
          {formatDate(row.original.assigned_at)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={async () => {
            if (!userRoles) return;
            const remaining = userRoles
              .filter((r) => r.id !== row.original.id)
              .map((r) => r.id);
            await assignMutation.mutateAsync({ role_ids: remaining });
          }}
          aria-label={`Remove role ${row.original.name}`}
          className="hover:text-error"
        >
          <X aria-hidden size={13} strokeWidth={1.75} />
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <ScaffoldContainer>
        <div className="space-y-4 py-6">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-24 w-full max-w-md" rounded="lg" />
        </div>
      </ScaffoldContainer>
    );
  }

  if (isError || !user) {
    return (
      <ScaffoldContainer>
        <div className="py-6">
          <p className="font-sans text-button text-error">Failed to load user.</p>
          <Button
            variant="link"
            className="mt-3 p-0 h-auto font-sans text-button text-muted underline hover:text-foreground no-underline"
            onClick={() => router.push('/users')}
          >
            Back to Users
          </Button>
        </div>
      </ScaffoldContainer>
    );
  }

  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email;
  const initial = (user.first_name?.charAt(0) ?? user.email.charAt(0)).toUpperCase();

  return (
    <ScaffoldContainer>
      <PageHeader
        breadcrumbs={[
          { label: 'Users', href: '/users' },
          { label: fullName },
        ]}
        title={fullName}
      />

      <ScaffoldSection>
        <ScaffoldSectionDetail>
          <ScaffoldSectionTitle>Profile</ScaffoldSectionTitle>
          <ScaffoldSectionDescription>
            Account information and current access type.
          </ScaffoldSectionDescription>
        </ScaffoldSectionDetail>

        <ScaffoldSectionContent>
          <div className="rounded-card border border-border bg-background p-6">
            <div className="flex items-start gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface-300 font-sans text-[22px] font-medium text-foreground">
                {initial}
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <p className="font-sans text-[18px] font-medium text-foreground">
                    {fullName}
                  </p>
                  <p className="font-sans text-button text-muted">{user.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <UserTypeBadge type={user.user_type} />
                  <StatusBadge status={user.status} />
                </div>
                {user.last_login_at && (
                  <p className="font-sans text-caption text-muted">
                    Last login: {formatDateTime(user.last_login_at)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </ScaffoldSectionContent>
      </ScaffoldSection>

      <ScaffoldDivider />

      <ScaffoldSection>
        <ScaffoldSectionDetail>
          <ScaffoldSectionTitle>Assigned Roles</ScaffoldSectionTitle>
          <ScaffoldSectionDescription>
            Roles determine what data and actions this user can access.
          </ScaffoldSectionDescription>
        </ScaffoldSectionDetail>

        <ScaffoldSectionContent>
          <div className="flex items-center justify-end">
            <Button
              onClick={() => setAssignRoleOpen(true)}
              className="h-9 px-4"
            >
              <Plus aria-hidden size={14} strokeWidth={2} />
              Assign Role
            </Button>
          </div>

          {rolesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : !userRoles || userRoles.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="No roles assigned"
              description="Assign roles to control what this user can access."
            />
          ) : (
            <DataTable
              columns={roleColumns}
              data={userRoles}
              caption="Assigned roles"
            />
          )}
        </ScaffoldSectionContent>
      </ScaffoldSection>

      <FormDialog open={assignRoleOpen} onOpenChange={setAssignRoleOpen} title="Assign Role">
        <AssignRoleForm
          userId={id}
          currentRoleIds={userRoles?.map((r) => r.id) ?? []}
          onSuccess={() => setAssignRoleOpen(false)}
          onCancel={() => setAssignRoleOpen(false)}
        />
      </FormDialog>
    </ScaffoldContainer>
  );
}
