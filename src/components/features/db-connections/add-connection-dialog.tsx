'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { standardSchemaResolver as zodResolver } from '@hookform/resolvers/standard-schema';
import { toast } from 'sonner';
import { Dialog } from '@base-ui/react/dialog';

import { useCreateConnection } from '@/hooks/useDbConnections';
import { DATABASE_TYPES } from '@/utils/constants';
import { cn } from '@/lib/utils';
import type { DatabaseType } from '@/types';

const DEFAULT_PORTS: Record<DatabaseType, number> = {
  postgresql: 5432,
  mssql: 1433,
  mongodb: 27017,
};

const connectionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  database_type: z.enum(['postgresql', 'mssql', 'mongodb']),
  host: z.string().min(1, 'Host is required'),
  port: z.number().int().min(1).max(65535),
  database_name: z.string().min(1, 'Database name is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type ConnectionFormValues = z.infer<typeof connectionSchema>;

interface AddConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId?: string;
}

export function AddConnectionDialog({
  open,
  onOpenChange,
  companyId,
}: AddConnectionDialogProps) {
  const createConnection = useCreateConnection(companyId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ConnectionFormValues>({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      database_type: 'postgresql',
      port: 5432,
      name: '',
      host: '',
      database_name: '',
      username: '',
      password: '',
    },
  });

  const dbType = watch('database_type');

  function handleDbTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const type = e.target.value as DatabaseType;
    setValue('database_type', type, { shouldValidate: false });
    setValue('port', DEFAULT_PORTS[type], { shouldValidate: false });
  }

  async function onSubmit(data: ConnectionFormValues) {
    try {
      await createConnection.mutateAsync(data);
      toast.success('Connection added successfully');
      reset();
      onOpenChange(false);
    } catch {
      toast.error('Failed to add connection. Please check your details.');
    }
  }

  function handleClose() {
    reset();
    onOpenChange(false);
  }

  const inputClass = (hasError: boolean) =>
    cn(
      'w-full rounded-lg border border-border bg-transparent px-3 py-2',
      'font-sans text-[14px] text-foreground outline-none placeholder:text-muted/40',
      'transition-colors focus:border-border-medium',
      hasError && 'border-error',
    );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            'fixed inset-0 bg-foreground/10',
            'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0',
            'transition-opacity duration-200',
          )}
        />
        <Dialog.Popup
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[min(calc(100vw-2rem),32rem)]',
            '-translate-x-1/2 -translate-y-1/2',
            'rounded-xl border border-border bg-background p-6 shadow-elevated',
            'outline-none',
            'data-[starting-style]:opacity-0 data-[starting-style]:scale-[0.97]',
            'data-[ending-style]:opacity-0 data-[ending-style]:scale-[0.97]',
            'transition-[opacity,transform] duration-200',
          )}
        >
          <Dialog.Title className="font-sans text-[22px] font-normal leading-[1.3] tracking-[-0.11px] text-foreground">
            Add Connection
          </Dialog.Title>
          <Dialog.Description className="mt-1 font-sans text-[14px] leading-[1.4] text-muted">
            Connect a database to enable natural language queries.
          </Dialog.Description>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[13px] font-medium text-foreground">
                Database Type
              </label>
              <select
                {...register('database_type')}
                onChange={handleDbTypeChange}
                className={inputClass(false)}
              >
                {Object.values(DATABASE_TYPES).map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[13px] font-medium text-foreground">
                Connection Name
              </label>
              <input
                {...register('name')}
                placeholder="e.g. Production DB"
                className={inputClass(!!errors.name)}
              />
              {errors.name && (
                <p className="font-sans text-[12px] text-error">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="font-sans text-[13px] font-medium text-foreground">Host</label>
                <input
                  {...register('host')}
                  placeholder="localhost"
                  className={inputClass(!!errors.host)}
                />
                {errors.host && (
                  <p className="font-sans text-[12px] text-error">{errors.host.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[13px] font-medium text-foreground">Port</label>
                <input
                  {...register('port')}
                  type="number"
                  placeholder={String(DEFAULT_PORTS[dbType])}
                  className={inputClass(!!errors.port)}
                />
                {errors.port && (
                  <p className="font-sans text-[12px] text-error">{errors.port.message}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[13px] font-medium text-foreground">
                Database Name
              </label>
              <input
                {...register('database_name')}
                placeholder="my_database"
                className={inputClass(!!errors.database_name)}
              />
              {errors.database_name && (
                <p className="font-sans text-[12px] text-error">{errors.database_name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[13px] font-medium text-foreground">Username</label>
                <input
                  {...register('username')}
                  autoComplete="username"
                  className={inputClass(!!errors.username)}
                />
                {errors.username && (
                  <p className="font-sans text-[12px] text-error">{errors.username.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[13px] font-medium text-foreground">Password</label>
                <input
                  {...register('password')}
                  type="password"
                  autoComplete="new-password"
                  className={inputClass(!!errors.password)}
                />
                {errors.password && (
                  <p className="font-sans text-[12px] text-error">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="mt-2 flex items-center justify-end gap-2">
              <Dialog.Close
                type="button"
                disabled={isSubmitting}
                onClick={handleClose}
                className={cn(
                  'inline-flex items-center justify-center rounded-lg border border-border',
                  'bg-surface-300 px-4 py-2 font-sans text-[14px] text-foreground',
                  'transition-colors hover:bg-surface-400',
                  'focus-visible:border-border-medium focus-visible:outline-none',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                )}
              >
                Cancel
              </Dialog.Close>
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  'inline-flex items-center justify-center rounded-lg px-4 py-2',
                  'bg-foreground font-sans text-[14px] text-background',
                  'transition-colors hover:opacity-90',
                  'focus-visible:outline-none',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                )}
              >
                {isSubmitting ? 'Adding…' : 'Add Connection'}
              </button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
