'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { type ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, Plus, Users as UsersIcon, GitBranch, Pencil, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/format-date';

import {
  useCompany,
  useSubsidiaries,
  useCompanyUsers,
  useCreateSubsidiary,
} from '@/hooks/useCompanies';
import type { Company, SubsidiaryCreate } from '@/types';

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
import { StatusBadge } from '@/components/shared/status-badge';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';

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
      <FieldGroup>
        <Field data-invalid={!!nameError}>
          <FieldLabel htmlFor="sub-name">Name *</FieldLabel>
          <Input
            id="sub-name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Subsidiary name"
            aria-invalid={!!nameError}
          />
          {nameError && <FieldError errors={[{ message: nameError } as any]} />}
        </Field>

        <Field>
          <FieldLabel htmlFor="sub-description">Description</FieldLabel>
          <Input
            id="sub-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
          />
        </Field>
      </FieldGroup>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={createMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? 'Creating…' : 'Create Subsidiary'}
        </Button>
      </div>
    </form>
  );
}

// ─── Info Row ──────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2">
      <span className="font-sans text-caption font-medium uppercase tracking-[0.08em] text-muted">{label}</span>
      <span className="font-sans text-button text-foreground">{value || '—'}</span>
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
      header: 'Company',
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <Button
            variant="link"
            className="h-auto p-0 justify-start font-sans text-[15px] font-medium text-foreground hover:text-accent no-underline text-left"
            onClick={() => router.push(`/companies/${row.original.id}`)}
          >
            {row.original.name}
          </Button>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge status={row.original.status as any} />
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
  ];

  const userColumns: ColumnDef<any>[] = [
    {
      id: 'name',
      header: 'User',
      cell: ({ row }) => (
        <span className="font-sans text-button font-medium text-foreground">
          {[row.original.first_name, row.original.last_name].filter(Boolean).join(' ') || row.original.email}
        </span>
      ),
    },
    {
      id: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <span className="font-sans text-button text-muted">{row.original.email}</span>
      ),
    },
  ];

  if (isLoading) return <div className="p-8 text-center text-muted">Loading...</div>;
  if (isError || !company) return <div className="p-8 text-center text-error">Company not found.</div>;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b border-border bg-surface-100/30 px-8 py-6">
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href="/companies" />}>Companies</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{company.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => router.push('/companies')}
            >
              <ArrowLeft size={14} />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-sans text-[24px] font-semibold text-foreground">{company.name}</h1>
                <StatusBadge status={company.status as any} />
              </div>
              <p className="font-sans text-button text-muted capitalize">{company.company_type} organization</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Edit Details</Button>
            {company.company_type === 'parent' && (
              <Button size="sm" onClick={() => setCreateSubOpen(true)} className="gap-2">
                <Plus size={14} /> Add Subsidiary
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList variant="line" className="justify-start gap-8 border-b border-border p-0">
            <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent px-2 py-3 text-button data-[state=active]:border-accent data-[state=active]:text-foreground">
              Overview
            </TabsTrigger>
            <TabsTrigger value="subsidiaries" className="rounded-none border-b-2 border-transparent px-2 py-3 text-button data-[state=active]:border-accent data-[state=active]:text-foreground">
              Subsidiaries ({subsidiaries.data?.total ?? 0})
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-none border-b-2 border-transparent px-2 py-3 text-button data-[state=active]:border-accent data-[state=active]:text-foreground">
              Users ({companyUsers.data?.total ?? 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0 outline-none">
            <div className="grid gap-8 lg:grid-cols-12">
              {/* Left Column: Details */}
              <div className="lg:col-span-8 space-y-8">
                <section>
                  <h3 className="mb-4 font-sans text-button font-semibold text-foreground">General Information</h3>
                  <div className="grid gap-4 rounded-xl border border-border bg-surface-100/20 p-6 sm:grid-cols-2">
                    <InfoRow label="Company Name" value={company.name} />
                    <InfoRow label="Domain" value={company.domain} />
                    <InfoRow label="Industry" value={company.industry} />
                    <InfoRow label="Location" value={company.country} />
                  </div>
                </section>

                <section>
                  <h3 className="mb-4 font-sans text-button font-semibold text-foreground">About</h3>
                  <div className="rounded-xl border border-border bg-surface-100/20 p-6">
                    <p className="font-sans text-button leading-relaxed text-muted">
                      {company.description || "No description available for this organization."}
                    </p>
                  </div>
                </section>
              </div>

              {/* Right Column: Sidebar */}
              <div className="lg:col-span-4 space-y-8">
                <section>
                  <h3 className="mb-4 font-sans text-button font-semibold text-foreground">Hierarchy</h3>
                  <div className="rounded-xl border border-border bg-surface-100/20 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-button text-muted">Organization Type</span>
                      <span className="text-button font-medium capitalize text-foreground">{company.company_type}</span>
                    </div>
                    {company.parent_id && (
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <span className="text-button text-muted">Parent Company</span>
                        <Button variant="link" className="h-auto p-0 text-button" onClick={() => router.push(`/companies/${company.parent_id}`)}>
                          View Parent
                        </Button>
                      </div>
                    )}
                  </div>
                </section>

                <section>
                  <h3 className="mb-4 font-sans text-button font-semibold text-foreground">System Metadata</h3>
                  <div className="rounded-xl border border-border bg-surface-100/20 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-button text-muted">Created</span>
                      <span className="text-button text-foreground">{formatDate(company.created_at)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-button text-muted">Last Updated</span>
                      <span className="text-button text-foreground">{formatDate(company.updated_at)}</span>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="subsidiaries" className="mt-0 outline-none">
            <DataTable
              columns={subsidiaryColumns}
              data={subsidiaries.data?.items ?? []}
              isLoading={subsidiaries.isLoading}
              onRowClick={(row) => router.push(`/companies/${row.id}`)}
            />
          </TabsContent>

          <TabsContent value="users" className="mt-0 outline-none">
            <DataTable
              columns={userColumns}
              data={companyUsers.data?.items ?? []}
              isLoading={companyUsers.isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <Dialog open={createSubOpen} onOpenChange={setCreateSubOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Subsidiary</DialogTitle>
          </DialogHeader>
          <SubsidiaryForm
            parentId={id}
            onSuccess={() => {
              setCreateSubOpen(false);
              subsidiaries.refetch();
            }}
            onCancel={() => setCreateSubOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
