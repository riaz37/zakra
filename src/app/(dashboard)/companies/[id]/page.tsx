'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { type ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, Plus } from 'lucide-react';
import { formatDate } from '@/lib/format-date';

import {
  useCompany,
  useSubsidiaries,
  useCompanyUsers,
  useCreateSubsidiary,
} from '@/hooks/useCompanies';
import type { Company, SubsidiaryCreate } from '@/types';

interface CompanyUserBasic {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/shared/status-badge';
import { DataTable } from '@/components/shared/data-table';

// ─── Subsidiary form ──────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function SubsidiaryForm({
  parentId,
  onSuccess,
  onCancel,
}: {
  parentId: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState('');

  const createMutation = useCreateSubsidiary(parentId);

  function handleNameChange(value: string) {
    setName(value);
    setSlug(slugify(value));
    if (nameError && value.trim()) setNameError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Subsidiary name is required.');
      return;
    }
    const payload: SubsidiaryCreate = {
      name: name.trim(),
      slug: slug || slugify(name),
      description: description || undefined,
    };
    await createMutation.mutateAsync(payload);
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sub-name">Name *</Label>
        <Input
          id="sub-name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Subsidiary name"
          aria-invalid={!!nameError}
        />
        {nameError ? (
          <p className="font-sans text-[12px] text-error">{nameError}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sub-description">Description</Label>
        <Input
          id="sub-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={createMutation.isPending}
          className="inline-flex items-center justify-center rounded-lg border border-border bg-surface-300 px-4 py-2 font-sans text-[14px] text-foreground transition-colors hover:bg-surface-400 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 font-sans text-[14px] font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
        >
          {createMutation.isPending ? 'Creating…' : 'Create Subsidiary'}
        </button>
      </div>
    </form>
  );
}

// ─── Company detail field ─────────────────────────────────────────────────────

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-sans text-[11px] uppercase tracking-wide text-muted">
        {label}
      </span>
      <span className="font-sans text-[14px] text-foreground">{value ?? '—'}</span>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CompanyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [createSubOpen, setCreateSubOpen] = useState(false);

  const { data: company, isLoading, isError } = useCompany(id);
  const subsidiaries = useSubsidiaries(id);
  const companyUsers = useCompanyUsers(id);

  const subsidiaryColumns: ColumnDef<Company>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => router.push(`/companies/${row.original.id}`)}
          className="font-sans text-[14px] font-medium text-foreground hover:text-accent transition-colors"
        >
          {row.original.name}
        </button>
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
      id: 'created_at',
      header: 'Created',
      cell: ({ row }) => (
        <span className="font-sans text-[14px] text-muted">
          {formatDate(row.original.created_at)}
        </span>
      ),
    },
  ];

  const userColumns: ColumnDef<CompanyUserBasic>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <span className="font-sans text-[14px] text-foreground">
          {[row.original.first_name, row.original.last_name].filter(Boolean).join(' ') ||
            '—'}
        </span>
      ),
    },
    {
      id: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <span className="font-sans text-[14px] text-muted">{row.original.email}</span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="px-6 py-8">
        <div className="space-y-4">
          <div className="h-5 w-48 animate-pulse rounded bg-surface-300" />
          <div className="h-8 w-64 animate-pulse rounded bg-surface-300" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-300" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !company) {
    return (
      <div className="px-6 py-8">
        <p className="font-sans text-[14px] text-error">Failed to load company.</p>
        <button
          type="button"
          onClick={() => router.push('/companies')}
          className="mt-3 font-sans text-[14px] text-muted underline hover:text-foreground"
        >
          Back to Companies
        </button>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/companies" />}>
              Companies
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{company.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Back + title */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push('/companies')}
          aria-label="Back to Companies"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-300 text-muted transition-colors hover:bg-surface-400 hover:text-foreground focus-visible:outline-none"
        >
          <ArrowLeft aria-hidden size={14} strokeWidth={1.75} />
        </button>
        <h1 className="font-sans text-[22px] font-normal leading-[1.3] tracking-[-0.11px] text-foreground">
          {company.name}
        </h1>
        {(company.status === 'active' ||
          company.status === 'inactive' ||
          company.status === 'suspended') && (
          <StatusBadge status={company.status} />
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList variant="line" className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subsidiaries">
            Subsidiaries {subsidiaries.data?.total !== undefined ? `(${subsidiaries.data.total})` : ''}
          </TabsTrigger>
          <TabsTrigger value="users">
            Users {companyUsers.data?.total !== undefined ? `(${companyUsers.data.total})` : ''}
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <div className="rounded-lg border border-border bg-background p-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <DetailField label="Name" value={company.name} />
              <DetailField
                label="Type"
                value={
                  <span className="capitalize">{company.company_type}</span>
                }
              />
              <DetailField
                label="Status"
                value={
                  company.status === 'active' ||
                  company.status === 'inactive' ||
                  company.status === 'suspended' ? (
                    <StatusBadge status={company.status} />
                  ) : (
                    company.status
                  )
                }
              />
              <DetailField
                label="Created"
                value={formatDate(company.created_at)}
              />
              <DetailField label="Domain" value={company.domain} />
              <DetailField label="Industry" value={company.industry} />
              <DetailField label="Country" value={company.country} />
              <div className="sm:col-span-2">
                <DetailField label="Description" value={company.description} />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Subsidiaries */}
        <TabsContent value="subsidiaries">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-sans text-[16px] font-medium text-foreground">
              Subsidiaries
            </h2>
            {company.company_type === 'parent' && (
              <button
                type="button"
                onClick={() => setCreateSubOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 font-sans text-[14px] font-medium text-white transition-colors hover:bg-accent/90"
              >
                <Plus aria-hidden size={14} strokeWidth={2} />
                Add Subsidiary
              </button>
            )}
          </div>
          <DataTable
            columns={subsidiaryColumns}
            data={subsidiaries.data?.items ?? []}
            isLoading={subsidiaries.isLoading}
            pageCount={subsidiaries.data?.total_pages ?? 1}
            caption="Subsidiaries list"
            emptyMessage="No subsidiaries found for this company."
          />
        </TabsContent>

        {/* Users */}
        <TabsContent value="users">
          <div className="mb-4">
            <h2 className="font-sans text-[16px] font-medium text-foreground">
              Users
            </h2>
          </div>
          <DataTable
            columns={userColumns}
            data={companyUsers.data?.items ?? []}
            isLoading={companyUsers.isLoading}
            pageCount={companyUsers.data?.total_pages ?? 1}
            caption="Company users list"
            emptyMessage="No users are associated with this company."
          />
        </TabsContent>
      </Tabs>

      {/* Create subsidiary dialog */}
      <Dialog open={createSubOpen} onOpenChange={setCreateSubOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Subsidiary</DialogTitle>
          </DialogHeader>
          <SubsidiaryForm
            parentId={id}
            onSuccess={() => setCreateSubOpen(false)}
            onCancel={() => setCreateSubOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
