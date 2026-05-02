'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Plus, Check, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useCompanies, useCreateCompany } from '@/hooks/useCompanies';
import { useCompanyStore } from '@/store/companyStore';
import { Button } from '@/components/ui/button';
import { Input, MonoInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  fadeUp,
  fadeIn,
  staggerContainer,
  staggerItem,
  staggerScaleItem,
  tapPress,
  MOTION,
} from '@/lib/motion';
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
  const reduced = useReducedMotion();

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
    <motion.div
      variants={fadeUp}
      initial={reduced ? 'visible' : 'hidden'}
      animate="visible"
      className="w-full max-w-[420px]"
    >
      {/* Brand */}
      <motion.div
        className="mb-8 flex items-center justify-center gap-2.5"
        initial={reduced ? {} : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <Image src="/logo/esaplogo.webp" alt="ESAP" width={32} height={32} priority />
        <Image src="/logo/esaplogo.svg" alt="ESAP employer solutions" width={65} height={21} priority />
      </motion.div>

      <div className="rounded-card border border-border bg-surface-200 px-6 py-8">
        <AnimatePresence mode="wait">
          {showCreate ? (
            <motion.div
              key="create"
              variants={fadeUp}
              initial={reduced ? 'visible' : 'hidden'}
              animate="visible"
              exit="exit"
            >
              <CreateCompanyForm
                onSubmit={handleSubmit(onCreate)}
                register={register}
                errors={errors}
                isSubmitting={isSubmitting}
                onNameChange={handleNameChange}
                canGoBack={hasCompanies}
                onBack={() => setMode('select')}
              />
            </motion.div>
          ) : (
            <motion.div
              key="select"
              variants={fadeUp}
              initial={reduced ? 'visible' : 'hidden'}
              animate="visible"
              exit="exit"
            >
              <SelectCompanyList
                companies={companies}
                isLoading={isLoading}
                onSelect={handleSelect}
                onCreateNew={() => setMode('create')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
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
  const reduced = useReducedMotion();

  return (
    <div>
      <h1 className="font-sans text-title font-semibold text-foreground">Select workspace</h1>
      <p className="mt-1 font-sans text-caption text-muted">
        Choose the company you want to manage.
      </p>

      <motion.div
        className="mt-6 flex max-h-[min(420px,55vh)] flex-col gap-2 overflow-y-auto pr-0.5"
        variants={staggerContainer}
        initial={reduced ? 'visible' : 'hidden'}
        animate="visible"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-5 animate-spin text-muted" />
          </div>
        ) : (
          companies.map((company) => (
            <motion.button
              key={company.id}
              variants={staggerItem}
              whileTap={tapPress}
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
            </motion.button>
          ))
        )}
      </motion.div>

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
  const reduced = useReducedMotion();

  return (
    <div>
      {canGoBack && (
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="mb-4 h-auto px-0 py-0 flex items-center gap-1.5 font-sans text-caption text-muted hover:text-foreground hover:bg-transparent"
        >
          <ArrowLeft className="size-3.5" />
          Back to list
        </Button>
      )}

      <h1 className="font-sans text-title font-semibold text-foreground">Create company</h1>
      <p className="mt-1 font-sans text-caption text-muted">
        Set up your first workspace to get started.
      </p>

      <motion.form
        onSubmit={onSubmit}
        noValidate
        className="mt-6 flex flex-col gap-4"
        variants={staggerContainer}
        initial={reduced ? 'visible' : 'hidden'}
        animate="visible"
      >
        <motion.div variants={staggerItem} className="flex flex-col">
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
        </motion.div>

        <motion.div variants={staggerItem} className="flex flex-col">
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
        </motion.div>

        <motion.div variants={staggerItem}>
          <Button
            type="submit"
            isLoading={isSubmitting}
            size="lg"
            className="mt-2 w-full"
          >
            {isSubmitting ? 'Creating…' : 'Create company'}
          </Button>
        </motion.div>
      </motion.form>
    </div>
  );
}
