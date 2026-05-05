'use client';

import { use, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { type ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { Plus, Trash2, ArrowUpRight, Building2, Users as UsersIcon } from 'lucide-react';

import {
  useCompany,
  useSubsidiaries,
  useCompanyUsers,
  useAddUserToCompany,
  useRemoveUserFromCompany,
  useCreateSubsidiary,
} from '@/hooks/useCompanies';
import { useUsers } from '@/hooks/useUsers';
import type { Company, ListUser, SubsidiaryCreate } from '@/types';

interface CompanyUserRow {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { formatDate } from '@/lib/format-date';
import { fadeUp } from '@/lib/motion';

import { PageHeader } from '@/components/shared/page-header';
import {
  ScaffoldContainer,
  ScaffoldFilterAndContent,
} from '@/components/shared/scaffold';
import { DataTable } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { FormDialog } from '@/components/shared/form-dialog';
import { Skeleton } from '@/components/shared/skeleton';
import { AnimatedPage } from '@/components/shared/animated-container';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from '@/components/ui/field';

// ── Types & helpers ──────────────────────────────────────────────────────────

type TabId = 'overview' | 'users' | 'subsidiaries';

function formatCompanyType(type: Company['company_type']): string {
  return type === 'parent' ? 'Parent' : 'Subsidiary';
}

function formatFullName(first: string | null, last: string | null, fallback: string): string {
  const name = [first, last].filter(Boolean).join(' ').trim();
  return name || fallback;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ── Add user form ────────────────────────────────────────────────────────────

interface AddUserFormProps {
  companyId: string;
  existingUserIds: string[];
  onSuccess: () => void;
  onCancel: () => void;
}

function AddUserForm({ companyId, existingUserIds, onSuccess, onCancel }: AddUserFormProps) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const { data: allUsers, isLoading } = useUsers({ page_size: 1000 });
  const addUserMutation = useAddUserToCompany(companyId);

  const availableUsers: ListUser[] = useMemo(() => {
    const items = allUsers?.items ?? [];
    return items.filter((u) => !existingUserIds.includes(u.id));
  }, [allUsers, existingUserIds]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUserId) return;
    try {
      await addUserMutation.mutateAsync({ userId: selectedUserId, isPrimary: false });
      toast.success('User added to company');
      onSuccess();
    } catch {
      toast.error('Failed to add user');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="add-user-select">User</FieldLabel>
          <Select value={selectedUserId} onValueChange={(v) => { if (v) setSelectedUserId(v); }}>
            <SelectTrigger id="add-user-select">
              <SelectValue placeholder={isLoading ? 'Loading users…' : 'Select a user…'} />
            </SelectTrigger>
            <SelectContent>
              {availableUsers.length === 0 ? (
                <div className="px-2 py-3 font-sans text-body text-fg-muted">
                  No additional users available.
                </div>
              ) : (
                availableUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {formatFullName(u.first_name, u.last_name, u.email)} · {u.email}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <FieldDescription>The user will be granted access to this company.</FieldDescription>
        </Field>
      </FieldGroup>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={addUserMutation.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={!selectedUserId || addUserMutation.isPending}>
          {addUserMutation.isPending ? 'Adding…' : 'Add User'}
        </Button>
      </div>
    </form>
  );
}

// ── Add subsidiary form ──────────────────────────────────────────────────────

interface AddSubsidiaryFormProps {
  parentId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function AddSubsidiaryForm({ parentId, onSuccess, onCancel }: AddSubsidiaryFormProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState('');
  const createMutation = useCreateSubsidiary(parentId);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    try {
      const payload: SubsidiaryCreate = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
      };
      await createMutation.mutateAsync(payload);
      toast.success('Subsidiary created');
      onSuccess();
    } catch {
      toast.error('Failed to create subsidiary');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="sub-name">Name</FieldLabel>
          <Input
            id="sub-name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Acme Subsidiary"
            autoFocus
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="sub-slug">Slug</FieldLabel>
          <Input
            id="sub-slug"
            mono
            value={slug}
            onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }}
            placeholder="acme-subsidiary"
            required
          />
          <FieldDescription>Unique identifier — lowercase, hyphens only.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="sub-description">Description</FieldLabel>
          <Input
            id="sub-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional"
          />
        </Field>
      </FieldGroup>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={createMutation.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={!name.trim() || !slug.trim() || createMutation.isPending}>
          {createMutation.isPending ? 'Creating…' : 'Create Subsidiary'}
        </Button>
      </div>
    </form>
  );
}

// ── Overview tab ─────────────────────────────────────────────────────────────

function InfoCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-border py-4 last:border-b-0 @md:border-b-0 @md:py-0">
      <p className="font-sans text-micro uppercase tracking-[0.06em] text-fg-muted">
        {label}
      </p>
      <div className="font-sans text-body text-foreground">{children}</div>
    </div>
  );
}

function OverviewTab({ company }: { company: Company }) {
  return (
    <div className="flex flex-col gap-8">
      <section
        aria-label="Company information"
        className="grid grid-cols-1 gap-x-10 gap-y-6 rounded-card border border-border bg-background p-6 @md:grid-cols-2"
      >
        <InfoCell label="Type">{formatCompanyType(company.company_type)}</InfoCell>
        <InfoCell label="Status">
          <StatusBadge status={company.status} />
        </InfoCell>
        <InfoCell label="Industry">
          {company.industry ? (
            <span>{company.industry}</span>
          ) : (
            <span className="text-fg-muted">—</span>
          )}
        </InfoCell>
        <InfoCell label="Domain">
          {company.domain ? (
            <span className="font-mono text-mono-sm">{company.domain}</span>
          ) : (
            <span className="text-fg-muted">—</span>
          )}
        </InfoCell>
        <InfoCell label="Slug">
          <span className="font-mono text-mono-sm">{company.slug}</span>
        </InfoCell>
        <InfoCell label="Country">
          {company.country ? (
            <span>{company.country}</span>
          ) : (
            <span className="text-fg-muted">—</span>
          )}
        </InfoCell>
        <InfoCell label="Created">
          <span className="font-mono text-mono-sm text-fg-muted">
            {formatDate(company.created_at)}
          </span>
        </InfoCell>
        <InfoCell label="Updated">
          <span className="font-mono text-mono-sm text-fg-muted">
            {formatDate(company.updated_at)}
          </span>
        </InfoCell>

        {company.description ? (
          <div className="col-span-full mt-2 border-t border-border pt-5">
            <p className="font-sans text-micro uppercase tracking-[0.06em] text-fg-muted">
              Description
            </p>
            <p className="mt-2 max-w-[65ch] font-sans text-body text-foreground">
              {company.description}
            </p>
          </div>
        ) : null}
      </section>

      <Link
        href={`/db-connections?company_id=${company.id}`}
        className="group flex items-center justify-between rounded-card border border-border bg-background px-5 py-4 transition-colors hover:border-border-medium hover:bg-surface-200"
      >
        <div className="flex flex-col gap-0.5">
          <p className="font-sans text-button font-medium text-foreground">
            Database connections
          </p>
          <p className="font-sans text-body text-fg-muted">
            View and manage database connections scoped to this company.
          </p>
        </div>
        <ArrowUpRight
          aria-hidden
          size={18}
          strokeWidth={1.75}
          className="shrink-0 text-fg-muted transition-colors group-hover:text-accent"
        />
      </Link>
    </div>
  );
}

// ── Users tab ────────────────────────────────────────────────────────────────

interface UsersTabProps {
  companyId: string;
}

function UsersTab({ companyId }: UsersTabProps) {
  const [page, setPage] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<CompanyUserRow | null>(null);

  const { data, isLoading, isError, refetch } = useCompanyUsers(companyId, { page_size: 1000 });
  const removeMutation = useRemoveUserFromCompany(companyId);

  const allItems = data?.items ?? [];
  const totalCount = data?.total ?? allItems.length;
  const totalPages = Math.max(1, Math.ceil(allItems.length / DEFAULT_PAGE_SIZE));
  const items = allItems.slice(page * DEFAULT_PAGE_SIZE, (page + 1) * DEFAULT_PAGE_SIZE);

  async function handleRemove() {
    if (!removeTarget) return;
    try {
      await removeMutation.mutateAsync(removeTarget.id);
      toast.success('User removed from company');
      setRemoveTarget(null);
    } catch {
      toast.error('Failed to remove user');
    }
  }

  const columns: ColumnDef<CompanyUserRow>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const u = row.original;
        return (
          <Link
            href={`/users/${u.id}`}
            className="font-sans text-button font-medium text-foreground transition-colors hover:text-accent"
          >
            {formatFullName(u.first_name, u.last_name, u.email)}
          </Link>
        );
      },
    },
    {
      id: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <span className="font-mono text-mono-sm text-fg-muted">{row.original.email}</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setRemoveTarget(row.original)}
            aria-label={`Remove ${row.original.email}`}
            className="hover:text-error"
          >
            <Trash2 aria-hidden size={14} strokeWidth={1.75} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-sans text-heading font-medium tracking-[-0.01em] text-foreground">
            Company users
          </h2>
          <p className="font-sans text-body text-fg-muted">
            {totalCount} {totalCount === 1 ? 'user' : 'users'} have access.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="h-9 px-4">
          <Plus aria-hidden size={14} strokeWidth={2} className="mr-1.5" />
          Add User
        </Button>
      </div>

      {isError ? (
        <ErrorState title="Failed to load users" onRetry={() => refetch()} />
      ) : !isLoading && allItems.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No users yet"
          description="Add a user to grant them access to this company."
          action={
            <Button onClick={() => setAddOpen(true)} className="h-9 px-4 gap-2">
              <Plus aria-hidden size={16} strokeWidth={2} />
              Add User
            </Button>
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
          totalCount={totalCount}
          caption="Company users"
          emptyMessage="No users in this company."
        />
      )}

      <FormDialog open={addOpen} onOpenChange={setAddOpen} title="Add user to company">
        <AddUserForm
          companyId={companyId}
          existingUserIds={allItems.map((u) => u.id)}
          onSuccess={() => setAddOpen(false)}
          onCancel={() => setAddOpen(false)}
        />
      </FormDialog>

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title="Remove user"
        description={
          removeTarget
            ? `Remove ${formatFullName(removeTarget.first_name, removeTarget.last_name, removeTarget.email)} from this company? They will lose access immediately.`
            : ''
        }
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={handleRemove}
        isLoading={removeMutation.isPending}
      />
    </div>
  );
}

// ── Subsidiaries tab ─────────────────────────────────────────────────────────

interface SubsidiariesTabProps {
  parentId: string;
}

function SubsidiariesTab({ parentId }: SubsidiariesTabProps) {
  const [page, setPage] = useState(0);
  const [addOpen, setAddOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useSubsidiaries(parentId, { page_size: 1000 });

  const allItems = data?.items ?? [];
  const totalCount = data?.total ?? allItems.length;
  const totalPages = Math.max(1, Math.ceil(allItems.length / DEFAULT_PAGE_SIZE));
  const items = allItems.slice(page * DEFAULT_PAGE_SIZE, (page + 1) * DEFAULT_PAGE_SIZE);

  const columns: ColumnDef<Company>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <Link
          href={`/companies/${row.original.id}`}
          className="font-sans text-button font-medium text-foreground transition-colors hover:text-accent"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      id: 'slug',
      header: 'Slug',
      cell: ({ row }) => (
        <span className="font-mono text-mono-sm text-fg-muted">{row.original.slug}</span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'created_at',
      header: 'Created',
      cell: ({ row }) => (
        <span className="font-mono text-mono-sm text-fg-muted">
          {formatDate(row.original.created_at)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="sm"
            render={<Link href={`/companies/${row.original.id}`} />}
            className="h-8 px-2 text-fg-muted hover:text-foreground"
          >
            View
            <ArrowUpRight aria-hidden size={13} strokeWidth={1.75} className="ml-1" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-sans text-heading font-medium tracking-[-0.01em] text-foreground">
            Subsidiaries
          </h2>
          <p className="font-sans text-body text-fg-muted">
            {totalCount} {totalCount === 1 ? 'subsidiary' : 'subsidiaries'} under this company.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="h-9 px-4">
          <Plus aria-hidden size={14} strokeWidth={2} className="mr-1.5" />
          Add Subsidiary
        </Button>
      </div>

      {isError ? (
        <ErrorState title="Failed to load subsidiaries" onRetry={() => refetch()} />
      ) : !isLoading && allItems.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No subsidiaries yet"
          description="Create a subsidiary to model an organization under this parent."
          action={
            <Button onClick={() => setAddOpen(true)} className="h-9 px-4 gap-2">
              <Plus aria-hidden size={16} strokeWidth={2} />
              Add Subsidiary
            </Button>
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
          totalCount={totalCount}
          caption="Subsidiaries"
          emptyMessage="No subsidiaries."
        />
      )}

      <FormDialog open={addOpen} onOpenChange={setAddOpen} title="Create subsidiary">
        <AddSubsidiaryForm
          parentId={parentId}
          onSuccess={() => setAddOpen(false)}
          onCancel={() => setAddOpen(false)}
        />
      </FormDialog>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

interface CompanyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const reduced = useReducedMotion();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const { data: company, isLoading, isError } = useCompany(id);

  if (isLoading) {
    return (
      <ScaffoldContainer>
        <div className="flex flex-col gap-4 py-6">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="mt-8 h-64 w-full" rounded="lg" />
        </div>
      </ScaffoldContainer>
    );
  }

  if (isError || !company) {
    return (
      <ScaffoldContainer>
        <div className="py-10">
          <ErrorState
            title="Company not found"
            description="This company could not be loaded. It may have been deleted or you may not have access."
            onRetry={() => router.push('/companies')}
          />
        </div>
      </ScaffoldContainer>
    );
  }

  const isParent = company.company_type === 'parent';

  const navigationItems = [
    { label: 'Overview', active: activeTab === 'overview', onClick: () => setActiveTab('overview') },
    { label: 'Users', active: activeTab === 'users', onClick: () => setActiveTab('users') },
    ...(isParent
      ? [{
          label: 'Subsidiaries',
          active: activeTab === 'subsidiaries',
          onClick: () => setActiveTab('subsidiaries'),
        }]
      : []),
  ];

  return (
    <ScaffoldContainer>
      <PageHeader
        breadcrumbs={[
          { label: 'Companies', href: '/companies' },
          { label: company.name },
        ]}
        title={company.name}
        subtitle={
          company.domain ? (
            <span className="font-mono text-mono-sm text-fg-muted">{company.domain}</span>
          ) : (
            <span className="font-mono text-mono-sm text-fg-muted">{company.slug}</span>
          )
        }
        secondaryActions={<StatusBadge status={company.status} />}
        navigationItems={navigationItems}
      />

      <AnimatedPage>
        <ScaffoldFilterAndContent>
          <AnimatePresence mode="wait">
            {activeTab === 'overview' ? (
              <motion.div
                key="overview"
                variants={fadeUp}
                initial={reduced ? 'visible' : 'hidden'}
                animate="visible"
                exit="exit"
              >
                <OverviewTab company={company} />
              </motion.div>
            ) : activeTab === 'users' ? (
              <motion.div
                key="users"
                variants={fadeUp}
                initial={reduced ? 'visible' : 'hidden'}
                animate="visible"
                exit="exit"
              >
                <UsersTab companyId={id} />
              </motion.div>
            ) : (
              <motion.div
                key="subsidiaries"
                variants={fadeUp}
                initial={reduced ? 'visible' : 'hidden'}
                animate="visible"
                exit="exit"
              >
                <SubsidiariesTab parentId={id} />
              </motion.div>
            )}
          </AnimatePresence>
        </ScaffoldFilterAndContent>
      </AnimatedPage>
    </ScaffoldContainer>
  );
}
