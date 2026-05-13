'use client';

import { use, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { type ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { Plus, Trash2, ArrowUpRight, Building2, Users as UsersIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

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

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function formatFullName(first: string | null, last: string | null, fallback: string): string {
  const name = [first, last].filter(Boolean).join(' ').trim();
  return name || fallback;
}

// ── Add user form ────────────────────────────────────────────────────────────

interface AddUserFormProps {
  companyId: string;
  existingUserIds: string[];
  onSuccess: () => void;
  onCancel: () => void;
}

function AddUserForm({ companyId, existingUserIds, onSuccess, onCancel }: AddUserFormProps) {
  const t = useTranslations('dashboard.companies.detail.addUserForm');
  const tUsers = useTranslations('dashboard.companies.detail.usersTab');
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
      toast.success(tUsers('successAdd'));
      onSuccess();
    } catch {
      toast.error(tUsers('errorAdd'));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="add-user-select">{t('fieldLabel')}</FieldLabel>
          <Select value={selectedUserId} onValueChange={(v) => { if (v) setSelectedUserId(v); }}>
            <SelectTrigger id="add-user-select">
              <SelectValue placeholder={isLoading ? t('loadingPlaceholder') : t('placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {availableUsers.length === 0 ? (
                <div className="px-2 py-3 font-sans text-body text-fg-muted">
                  {t('noUsers')}
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
          <FieldDescription>{t('description')}</FieldDescription>
        </Field>
      </FieldGroup>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={addUserMutation.isPending}>
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={!selectedUserId || addUserMutation.isPending}>
          {addUserMutation.isPending ? t('adding') : tUsers('addUser')}
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
  const t = useTranslations('dashboard.companies.detail.addSubForm');
  const tSub = useTranslations('dashboard.companies.detail.subsidiariesTab');
  const tForm = useTranslations('dashboard.companies.form');
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
      toast.success(tSub('successCreate'));
      onSuccess();
    } catch {
      toast.error(tSub('errorCreate'));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="sub-name">{tForm('name').replace(' *', '')}</FieldLabel>
          <Input
            id="sub-name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder={t('namePlaceholder')}
            autoFocus
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="sub-slug">{tForm('slug')}</FieldLabel>
          <Input
            id="sub-slug"
            mono
            value={slug}
            onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }}
            placeholder={t('slugPlaceholder')}
            required
          />
          <FieldDescription>{t('slugDescription')}</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="sub-description">{tForm('description')}</FieldLabel>
          <Input
            id="sub-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('descriptionPlaceholder')}
          />
        </Field>
      </FieldGroup>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={createMutation.isPending}>
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={!name.trim() || !slug.trim() || createMutation.isPending}>
          {createMutation.isPending ? t('creating') : tSub('dialogTitle')}
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
  const t = useTranslations('dashboard.companies.detail.overview');

  return (
    <div className="flex flex-col gap-8">
      <section
        aria-label="Company information"
        className="grid grid-cols-1 gap-x-10 gap-y-6 rounded-card border border-border bg-background p-6 @md:grid-cols-2"
      >
        <InfoCell label={t('type')}>
          {company.company_type === 'parent' ? t('typeParent') : t('typeSubsidiary')}
        </InfoCell>
        <InfoCell label={t('status')}>
          <StatusBadge status={company.status} />
        </InfoCell>
        <InfoCell label={t('industry')}>
          {company.industry ? (
            <span>{company.industry}</span>
          ) : (
            <span className="text-fg-muted">—</span>
          )}
        </InfoCell>
        <InfoCell label={t('domain')}>
          {company.domain ? (
            <span className="font-mono text-mono-sm">{company.domain}</span>
          ) : (
            <span className="text-fg-muted">—</span>
          )}
        </InfoCell>
        <InfoCell label={t('slug')}>
          <span className="font-mono text-mono-sm">{company.slug}</span>
        </InfoCell>
        <InfoCell label={t('country')}>
          {company.country ? (
            <span>{company.country}</span>
          ) : (
            <span className="text-fg-muted">—</span>
          )}
        </InfoCell>
        <InfoCell label={t('created')}>
          <span className="font-mono text-mono-sm text-fg-muted">
            {formatDate(company.created_at)}
          </span>
        </InfoCell>
        <InfoCell label={t('updated')}>
          <span className="font-mono text-mono-sm text-fg-muted">
            {formatDate(company.updated_at)}
          </span>
        </InfoCell>

        {company.description ? (
          <div className="col-span-full mt-2 border-t border-border pt-5">
            <p className="font-sans text-micro uppercase tracking-[0.06em] text-fg-muted">
              {t('description')}
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
            {t('dbConnections')}
          </p>
          <p className="font-sans text-body text-fg-muted">
            {t('dbConnectionsHint')}
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
  const t = useTranslations('dashboard.companies.detail.usersTab');
  const tCols = useTranslations('dashboard.companies.detail.columns');
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
      toast.success(t('successRemove'));
      setRemoveTarget(null);
    } catch {
      toast.error(t('errorRemove'));
    }
  }

  const columns: ColumnDef<CompanyUserRow>[] = [
    {
      id: 'name',
      header: tCols('name'),
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
      header: tCols('email'),
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
            {t('heading')}
          </h2>
          <p className="font-sans text-body text-fg-muted">
            {t('userCount', { count: totalCount })}
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="h-9 px-4">
          <Plus aria-hidden size={14} strokeWidth={2} className="mr-1.5" />
          {t('addUser')}
        </Button>
      </div>

      {isError ? (
        <ErrorState title={t('loadError')} onRetry={() => refetch()} />
      ) : !isLoading && allItems.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title={t('emptyTitle')}
          description={t('emptyDescription')}
          action={
            <Button onClick={() => setAddOpen(true)} className="h-9 px-4 gap-2">
              <Plus aria-hidden size={16} strokeWidth={2} />
              {t('addUser')}
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
          caption={t('heading')}
          emptyMessage={t('emptyMessage')}
        />
      )}

      <FormDialog open={addOpen} onOpenChange={setAddOpen} title={t('dialogTitle')}>
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
        title={t('removeTitle')}
        description={
          removeTarget
            ? t('removeDescription', { name: formatFullName(removeTarget.first_name, removeTarget.last_name, removeTarget.email) })
            : ''
        }
        confirmLabel={t('removeLabel')}
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
  const t = useTranslations('dashboard.companies.detail.subsidiariesTab');
  const tCols = useTranslations('dashboard.companies.detail.columns');
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
      header: tCols('name'),
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
      header: tCols('slug'),
      cell: ({ row }) => (
        <span className="font-mono text-mono-sm text-fg-muted">{row.original.slug}</span>
      ),
    },
    {
      id: 'status',
      header: tCols('status'),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'created_at',
      header: tCols('created'),
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
            {t('view')}
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
            {t('heading')}
          </h2>
          <p className="font-sans text-body text-fg-muted">
            {t('subCount', { count: totalCount })}
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="h-9 px-4">
          <Plus aria-hidden size={14} strokeWidth={2} className="mr-1.5" />
          {t('addSubsidiary')}
        </Button>
      </div>

      {isError ? (
        <ErrorState title={t('loadError')} onRetry={() => refetch()} />
      ) : !isLoading && allItems.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={t('emptyTitle')}
          description={t('emptyDescription')}
          action={
            <Button onClick={() => setAddOpen(true)} className="h-9 px-4 gap-2">
              <Plus aria-hidden size={16} strokeWidth={2} />
              {t('addSubsidiary')}
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
          caption={t('heading')}
          emptyMessage={t('emptyMessage')}
        />
      )}

      <FormDialog open={addOpen} onOpenChange={setAddOpen} title={t('dialogTitle')}>
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
  const t = useTranslations('dashboard.companies.detail');
  const tCompanies = useTranslations('dashboard.companies');
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
            title={t('notFound.title')}
            description={t('notFound.description')}
            onRetry={() => router.push('/companies')}
          />
        </div>
      </ScaffoldContainer>
    );
  }

  const isParent = company.company_type === 'parent';

  const navigationItems = [
    { label: t('tab.overview'), active: activeTab === 'overview', onClick: () => setActiveTab('overview') },
    { label: t('tab.users'), active: activeTab === 'users', onClick: () => setActiveTab('users') },
    ...(isParent
      ? [{
          label: t('tab.subsidiaries'),
          active: activeTab === 'subsidiaries',
          onClick: () => setActiveTab('subsidiaries'),
        }]
      : []),
  ];

  return (
    <ScaffoldContainer>
      <PageHeader
        breadcrumbs={[
          { label: tCompanies('title'), href: '/companies' },
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
