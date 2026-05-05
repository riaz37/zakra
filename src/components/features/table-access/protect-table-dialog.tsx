'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { UseFormRegister, FieldErrors, UseFormHandleSubmit } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldPlus, Table2 } from 'lucide-react';
import { toast } from 'sonner';

import { useDbConnections, useDiscoverTablesQuery } from '@/hooks/useDbConnections';
import { useManagedTables, useRegisterTable } from '@/hooks/useTableAccess';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/shared/search-input';
import { Skeleton } from '@/components/shared/skeleton';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ProtectTableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  onSuccess?: (tableName: string) => void;
}

interface RawTable {
  schema_name: string;
  table_name: string;
}

type Step = 'pick' | 'form';

// ── Zod schema ────────────────────────────────────────────────────────────────

const formSchema = z.object({
  display_name: z.string().min(1, 'Display name required'),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// ── ProtectTableDialog ────────────────────────────────────────────────────────

export function ProtectTableDialog({
  open,
  onOpenChange,
  companyId,
  onSuccess,
}: ProtectTableDialogProps) {
  const [step, setStep] = useState<Step>('pick');
  const [filter, setFilter] = useState('');
  const [selectedTable, setSelectedTable] = useState<RawTable | null>(null);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const { data: connectionsData, isLoading: connectionsLoading } = useDbConnections({
    company_id: companyId,
  });

  const connection = useMemo(() => {
    const items = connectionsData?.items ?? [];
    return items.find((c) => c.is_default) ?? items[0] ?? null;
  }, [connectionsData]);

  const { data: discoveredTables, isLoading: discoveryLoading } = useDiscoverTablesQuery(
    open && connection ? connection.id : undefined,
    companyId,
  );

  const { data: managedTablesData } = useManagedTables(
    open ? { company_id: companyId } : undefined,
  );

  const protectedKeys = useMemo(() => {
    const items = managedTablesData?.items ?? [];
    return new Set(items.map((t) => `${t.schema_name}.${t.table_name}`));
  }, [managedTablesData]);

  const availableTables = useMemo(() => {
    const raw = discoveredTables ?? [];
    return raw.filter((t) => !protectedKeys.has(`${t.schema_name}.${t.table_name}`));
  }, [discoveredTables, protectedKeys]);

  const filteredTables = useMemo(() => {
    if (!filter.trim()) return availableTables;
    const q = filter.toLowerCase();
    return availableTables.filter(
      (t) =>
        t.table_name.toLowerCase().includes(q) ||
        t.schema_name.toLowerCase().includes(q),
    );
  }, [availableTables, filter]);

  // ── Mutation ───────────────────────────────────────────────────────────────

  const registerTable = useRegisterTable();

  // ── Form ───────────────────────────────────────────────────────────────────

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { display_name: '', description: '' },
  });

  // ── Reset state on close ───────────────────────────────────────────────────

  useEffect(() => {
    if (!open) {
      setStep('pick');
      setFilter('');
      setSelectedTable(null);
      reset({ display_name: '', description: '' });
    }
  }, [open, reset]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleSelectTable(table: RawTable) {
    setSelectedTable(table);
    setValue('display_name', table.table_name);
    setValue('description', '');
    setStep('form');
  }

  function handleBack() {
    setStep('pick');
  }

  async function handleConfirm(values: FormValues) {
    if (!selectedTable) return;

    try {
      await registerTable.mutateAsync({
        data: {
          table_name: selectedTable.table_name,
          schema_name: selectedTable.schema_name,
          display_name: values.display_name,
          description: values.description ?? undefined,
          company_id: companyId,
        },
        companyId,
      });

      toast.success(`Table "${selectedTable.table_name}" is now protected.`);
      onSuccess?.(selectedTable.table_name);
      onOpenChange(false);
    } catch {
      toast.error('Failed to protect table. Please try again.');
    }
  }

  // ── Loading state for connection lookup ────────────────────────────────────

  const isConnLoading = connectionsLoading;
  const noConnection = !isConnLoading && !connection;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldPlus aria-hidden size={16} strokeWidth={1.75} className="shrink-0 text-accent" />
            Protect table
          </DialogTitle>
          <p className="font-sans text-body text-fg-muted">
            {step === 'pick'
              ? 'Select a database table to register for column-level access control.'
              : 'Provide a display name and optional description for this protected table.'}
          </p>
        </DialogHeader>

        {step === 'pick' ? (
          <PickerStep
            isConnLoading={isConnLoading}
            noConnection={noConnection}
            discoveryLoading={discoveryLoading}
            availableTables={availableTables}
            filteredTables={filteredTables}
            filter={filter}
            onFilterChange={setFilter}
            onSelectTable={handleSelectTable}
            onClose={() => onOpenChange(false)}
          />
        ) : (
          <FormStep
            selectedTable={selectedTable!}
            register={register}
            errors={errors}
            handleSubmit={handleSubmit}
            onConfirm={handleConfirm}
            onBack={handleBack}
            onClose={() => onOpenChange(false)}
            isSubmitting={registerTable.isPending}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── PickerStep ─────────────────────────────────────────────────────────────────

interface PickerStepProps {
  isConnLoading: boolean;
  noConnection: boolean;
  discoveryLoading: boolean;
  availableTables: RawTable[];
  filteredTables: RawTable[];
  filter: string;
  onFilterChange: (value: string) => void;
  onSelectTable: (table: RawTable) => void;
  onClose: () => void;
}

function PickerStep({
  isConnLoading,
  noConnection,
  discoveryLoading,
  availableTables,
  filteredTables,
  filter,
  onFilterChange,
  onSelectTable,
  onClose,
}: PickerStepProps) {
  const allProtected = !discoveryLoading && availableTables.length === 0 && !noConnection;

  return (
    <>
      <DialogBody className="flex flex-col gap-3">
        {noConnection ? (
          <p className="rounded-lg border border-border bg-surface-100 px-4 py-6 text-center font-sans text-body text-fg-muted">
            No database connection configured for this company.
          </p>
        ) : (
          <>
            <SearchInput
              value={filter}
              onChange={onFilterChange}
              placeholder="Filter tables…"
              ariaLabel="Filter tables"
            />

            <div className="flex max-h-80 flex-col overflow-y-auto rounded-lg border border-border bg-surface-100">
              {isConnLoading || discoveryLoading ? (
                <div className="flex flex-col gap-1 p-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-8" rounded="md" />
                  ))}
                </div>
              ) : allProtected ? (
                <p className="px-4 py-10 text-center font-sans text-body text-fg-muted">
                  All tables are already protected.
                </p>
              ) : filteredTables.length === 0 ? (
                <p className="px-4 py-10 text-center font-sans text-body text-fg-muted">
                  No tables match your search.
                </p>
              ) : (
                <ul role="list" className="divide-y divide-border">
                  {filteredTables.map((t) => {
                    const key = `${t.schema_name}.${t.table_name}`;
                    return (
                      <li key={key}>
                        <button
                          type="button"
                          onClick={() => onSelectTable(t)}
                          className={cn(
                            'flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left',
                            'transition-colors hover:bg-surface-300',
                            'focus-visible:bg-surface-300 focus-visible:outline-none',
                          )}
                        >
                          <Table2
                            aria-hidden
                            size={13}
                            strokeWidth={1.75}
                            className="shrink-0 text-fg-subtle"
                          />
                          <span className="min-w-0 flex-1 truncate font-mono text-mono-sm text-foreground">
                            {t.table_name}
                          </span>
                          <span className="shrink-0 font-mono text-micro text-fg-subtle">
                            {t.schema_name}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        )}
      </DialogBody>

      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </DialogFooter>
    </>
  );
}

// ── FormStep ───────────────────────────────────────────────────────────────────

interface FormStepProps {
  selectedTable: RawTable;
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
  handleSubmit: UseFormHandleSubmit<FormValues>;
  onConfirm: (values: FormValues) => Promise<void>;
  onBack: () => void;
  onClose: () => void;
  isSubmitting: boolean;
}

function FormStep({
  selectedTable,
  register,
  errors,
  handleSubmit,
  onConfirm,
  onBack,
  onClose,
  isSubmitting,
}: FormStepProps) {
  return (
    <form onSubmit={handleSubmit(onConfirm)}>
      <DialogBody className="flex flex-col gap-4">
        {/* Selected table badge */}
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-100 px-3 py-2">
          <Table2 aria-hidden size={13} strokeWidth={1.75} className="shrink-0 text-accent" />
          <span className="font-mono text-mono-sm text-foreground">
            {selectedTable.schema_name}.{selectedTable.table_name}
          </span>
        </div>

        {/* display_name */}
        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-body font-medium text-foreground">
            Display name
            <span className="ml-0.5 text-error" aria-hidden>
              *
            </span>
          </label>
          <input
            type="text"
            autoFocus
            {...register('display_name')}
            disabled={isSubmitting}
            className={cn(
              'w-full rounded-lg border bg-transparent px-3 py-2',
              'font-sans text-body text-foreground outline-none',
              'transition-colors placeholder:text-fg-subtle',
              errors.display_name
                ? 'border-error focus:border-error'
                : 'border-border focus:border-border-medium',
              'disabled:opacity-50',
            )}
            placeholder="e.g. Customer Records"
          />
          {errors.display_name && (
            <p className="font-sans text-micro text-error">{errors.display_name.message}</p>
          )}
        </div>

        {/* description */}
        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-body font-medium text-foreground">
            Description
            <span className="ml-1.5 font-sans text-micro text-fg-subtle">(optional)</span>
          </label>
          <textarea
            {...register('description')}
            disabled={isSubmitting}
            rows={3}
            className={cn(
              'w-full resize-none rounded-lg border border-border bg-transparent px-3 py-2',
              'font-sans text-body text-foreground outline-none',
              'transition-colors placeholder:text-fg-subtle',
              'focus:border-border-medium disabled:opacity-50',
            )}
            placeholder="Briefly describe the purpose of this table…"
          />
        </div>
      </DialogBody>

      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button type="submit" variant="default" isLoading={isSubmitting} disabled={isSubmitting}>
          Protect table
        </Button>
      </DialogFooter>
    </form>
  );
}
