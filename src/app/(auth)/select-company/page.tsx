'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Plus, Check, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCompanies, useCreateCompany } from '@/hooks/useCompanies';
import { useCompanyStore } from '@/store/companyStore';
import { Button } from '@/components/ui/button';
import { Input, MonoInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { Company } from '@/types';

const createSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and hyphens only'),
});

type CreateFields = z.infer<typeof createSchema>;

export default function SelectCompanyPage() {
  const router = useRouter();
  const { setSelectedCompanyId } = useCompanyStore();
  const { data, isLoading } = useCompanies({ limit: 100 });
  const createCompany = useCreateCompany();
  const [mode, setMode] = useState<'select' | 'create'>('select');

  const companies = data?.items ?? [];
  const hasCompanies = companies.length > 0;
  const showCreate = mode === 'create' || (!isLoading && !hasCompanies);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateFields>({ resolver: zodResolver(createSchema) });

  function handleSelect(company: Company) {
    setSelectedCompanyId(company.id);
    router.push('/overview');
  }

  async function onCreate(values: CreateFields) {
    try {
      const company = await createCompany.mutateAsync({ data: { name: values.name, slug: values.slug } });
      setSelectedCompanyId(company.id);
      toast.success(`${company.name} created`);
      router.push('/overview');
    } catch {
      toast.error('Failed to create company. Please try again.');
    }
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const slug = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setValue('slug', slug, { shouldValidate: true });
  }

  return (
    <div className="w-full max-w-[420px] animate-fade-up">
      {/* Brand */}
      <div className="mb-8 flex items-center justify-center gap-2.5">
        <Image src="/logo/esaplogo.webp" alt="ESAP" width={32} height={32} priority />
        <Image src="/logo/esaplogo.svg" alt="ESAP employer solutions" width={65} height={21} priority />
      </div>

      <div className="rounded-xl border border-border bg-surface-100 px-6 py-8">
        {showCreate ? (
          <CreateCompanyForm
            onSubmit={handleSubmit(onCreate)}
            register={register}
            errors={errors}
            isSubmitting={isSubmitting}
            onNameChange={handleNameChange}
            canGoBack={hasCompanies}
            onBack={() => setMode('select')}
          />
        ) : (
          <SelectCompanyList
            companies={companies}
            isLoading={isLoading}
            onSelect={handleSelect}
            onCreateNew={() => setMode('create')}
          />
        )}
      </div>
    </div>
  );
}

// ── Company list ───────────────────────────────────────────────────────────

function SelectCompanyList({
  companies,
  isLoading,
  onSelect,
  onCreateNew,
}: {
  companies: Company[];
  isLoading: boolean;
  onSelect: (company: Company) => void;
  onCreateNew: () => void;
}) {
  return (
    <div>
      <h1 className="font-sans text-title font-semibold text-foreground">Select workspace</h1>
      <p className="mt-1 font-sans text-caption text-muted">
        Choose the company you want to manage.
      </p>

      <div className="mt-6 flex max-h-[min(420px,55vh)] flex-col gap-2 overflow-y-auto pr-0.5">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-5 animate-spin text-muted" />
          </div>
        ) : (
          companies.map((company) => (
            <button
              key={company.id}
              onClick={() => onSelect(company)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg border border-border bg-surface-200 px-4 py-3',
                'text-left transition-colors duration-150',
                'hover:border-border-strong hover:bg-surface-300',
              )}
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-400">
                <Building2 className="size-4 text-muted" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-sans text-button font-medium text-foreground truncate">{company.name}</p>
                <p className="font-mono text-micro text-muted truncate">{company.slug}</p>
              </div>
              <Check className="size-4 shrink-0 text-muted opacity-0 group-hover:opacity-100" />
            </button>
          ))
        )}
      </div>

      <Button
        onClick={onCreateNew}
        size="lg"
        className="mt-3 w-full"
      >
        <Plus className="size-4" />
        Create new company
      </Button>
    </div>
  );
}

// ── Create company form ────────────────────────────────────────────────────

function CreateCompanyForm({
  onSubmit,
  register,
  errors,
  isSubmitting,
  onNameChange,
  canGoBack,
  onBack,
}: {
  onSubmit: (e: React.FormEvent) => void;
  register: ReturnType<typeof useForm<CreateFields>>['register'];
  errors: ReturnType<typeof useForm<CreateFields>>['formState']['errors'];
  isSubmitting: boolean;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  canGoBack: boolean;
  onBack: () => void;
}) {
  return (
    <div>
      {canGoBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-4 flex items-center gap-1.5 font-sans text-caption text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to list
        </button>
      )}

      <h1 className="font-sans text-title font-semibold text-foreground">Create company</h1>
      <p className="mt-1 font-sans text-caption text-muted">
        Set up your first workspace to get started.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col">
          <Label htmlFor="name">Company name</Label>
          <Input
            id="name"
            type="text"
            {...register('name')}
            onChange={(e) => {
              register('name').onChange(e);
              onNameChange(e);
            }}
            aria-invalid={!!errors.name}
            error={!!errors.name}
            placeholder="Acme Corp"
          />
          {errors.name && (
            <p className="mt-1.5 font-sans text-caption text-error" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <Label htmlFor="slug">Slug</Label>
          <MonoInput
            id="slug"
            type="text"
            {...register('slug')}
            aria-invalid={!!errors.slug}
            error={!!errors.slug}
            placeholder="acme-corp"
          />
          {errors.slug && (
            <p className="mt-1.5 font-sans text-caption text-error" role="alert">
              {errors.slug.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          isLoading={isSubmitting}
          size="lg"
          className="mt-2 w-full"
        >
          {isSubmitting ? 'Creating…' : 'Create company'}
        </Button>
      </form>
    </div>
  );
}
