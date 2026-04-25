'use client';

import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Dialog } from '@base-ui/react/dialog';

import { useCreateConnection } from '@/hooks/useDbConnections';
import { DATABASE_TYPES } from '@/utils/constants';
import { cn } from '@/lib/utils';
import type { DatabaseType } from '@/types';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DEFAULT_PORTS: Record<DatabaseType, number> = {
  postgresql: 5432,
  mssql: 1433,
  mongodb: 27017,
};

const connectionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  database_type: z.enum(['postgresql', 'mssql', 'mongodb']),
  host: z.string().min(1, 'Host is required'),
  port: z.coerce.number().int().min(1).max(65535),
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

  const form = useForm<ConnectionFormValues>({
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

  const dbType = form.watch('database_type');

  function handleDbTypeChange(type: string, onChange: (v: string) => void) {
    const dbType = type as DatabaseType;
    onChange(dbType);
    form.setValue('port', DEFAULT_PORTS[dbType], { shouldValidate: true });
  }

  async function onSubmit(data: ConnectionFormValues) {
    try {
      await createConnection.mutateAsync(data);
      toast.success('Connection added successfully');
      form.reset();
      onOpenChange(false);
    } catch {
      toast.error('Failed to add connection. Please check your details.');
    }
  }

  function handleClose() {
    form.reset();
    onOpenChange(false);
  }

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

          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 flex flex-col gap-4" noValidate>
            <FieldGroup>
              <Controller
                control={form.control}
                name="database_type"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Database Type</FieldLabel>
                    <Select
                      onValueChange={(v) => handleDbTypeChange(v, field.onChange)}
                      defaultValue={field.value}
                    >
                      <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(DATABASE_TYPES).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Connection Name</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder="e.g. Production DB"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Controller
                    control={form.control}
                    name="host"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Host</FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          placeholder="localhost"
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                </div>
                <Controller
                  control={form.control}
                  name="port"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Port</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="number"
                        placeholder={String(DEFAULT_PORTS[dbType])}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>

              <Controller
                control={form.control}
                name="database_name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Database Name</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder="my_database"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <Controller
                  control={form.control}
                  name="username"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        autoComplete="username"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="password"
                        autoComplete="new-password"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>

            <div className="mt-2 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={form.formState.isSubmitting}
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Adding…' : 'Add Connection'}
              </Button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
