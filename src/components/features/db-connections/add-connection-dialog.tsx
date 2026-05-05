'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import {
  useCreateConnection,
  useUpdateConnection,
} from '@/hooks/useDbConnections';
import { DATABASE_TYPES } from '@/utils/constants';
import type { DatabaseConnection, DatabaseType } from '@/types';
import { FormDialog } from '@/components/shared/form-dialog';
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

interface ConnectionFormValues {
  name: string;
  database_type: DatabaseType;
  host: string;
  port: number;
  database_name: string;
  username: string;
  password: string;
}

function buildResolverSchema(isEdit: boolean) {
  return z.object({
    name: z.string().min(1, 'Name is required'),
    database_type: z.enum(['postgresql', 'mssql', 'mongodb']),
    host: z.string().min(1, 'Host is required'),
    port: z.coerce.number().int().min(1).max(65535),
    database_name: z.string().min(1, 'Database name is required'),
    username: z.string().min(1, 'Username is required'),
    password: isEdit
      ? z.string()
      : z.string().min(1, 'Password is required'),
  });
}

interface AddConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId?: string;
  /** When provided, the dialog enters edit mode and pre-fills the form. */
  editingConnection?: DatabaseConnection | null;
  /** Existing connection names for duplicate validation. */
  existingNames?: string[];
}

export function AddConnectionDialog({
  open,
  onOpenChange,
  companyId,
  editingConnection,
  existingNames = [],
}: AddConnectionDialogProps) {
  const isEdit = !!editingConnection;

  const createConnection = useCreateConnection(companyId);
  const updateConnection = useUpdateConnection(
    editingConnection?.id ?? '',
    companyId,
  );

  const form = useForm<ConnectionFormValues>({
    resolver: zodResolver(buildResolverSchema(isEdit)),
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

  // Sync form when editing target changes or dialog opens.
  useEffect(() => {
    if (!open) return;
    if (editingConnection) {
      form.reset({
        name: editingConnection.name,
        database_type: editingConnection.database_type,
        host: editingConnection.host,
        port: editingConnection.port,
        database_name: editingConnection.database_name,
        username: editingConnection.username,
        password: '',
      });
    } else {
      form.reset({
        database_type: 'postgresql',
        port: 5432,
        name: '',
        host: '',
        database_name: '',
        username: '',
        password: '',
      });
    }
    // form is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingConnection]);

  const dbType = form.watch('database_type');

  function handleDbTypeChange(type: string, onChange: (v: string) => void) {
    const next = type as DatabaseType;
    onChange(next);
    form.setValue('port', DEFAULT_PORTS[next], { shouldValidate: true });
  }

  async function onSubmit(data: ConnectionFormValues) {
    const isDuplicate = existingNames.some(
      (n) =>
        n.toLowerCase() === data.name.toLowerCase() &&
        n.toLowerCase() !== editingConnection?.name.toLowerCase(),
    );
    if (isDuplicate) {
      form.setError('name', { message: 'A connection with this name already exists' });
      return;
    }

    try {
      if (isEdit && editingConnection) {
        const { password, ...rest } = data;
        await updateConnection.mutateAsync({
          ...rest,
          ...(password ? { password } : {}),
        });
        toast.success('Connection updated');
      } else {
        await createConnection.mutateAsync(data);
        toast.success('Connection added');
      }
      form.reset();
      onOpenChange(false);
    } catch {
      toast.error(
        isEdit
          ? 'Failed to update connection.'
          : 'Failed to add connection. Please check your details.',
      );
    }
  }

  function handleClose() {
    form.reset();
    onOpenChange(false);
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit Connection' : 'Add Connection'}
      className="w-[min(calc(100vw-2rem),32rem)] max-w-none"
    >
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-2 flex flex-col gap-4"
        noValidate
      >
        <FieldGroup>
          <Controller
            control={form.control}
            name="database_type"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Database Type</FieldLabel>
                <Select
                  onValueChange={(v) =>
                    v && handleDbTypeChange(v, field.onChange)
                  }
                  value={field.value}
                  defaultValue={field.value}
                  disabled={isEdit}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  >
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
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
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
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
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
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
                    placeholder={isEdit ? 'Leave blank to keep' : undefined}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
          <Button type="submit" isLoading={form.formState.isSubmitting}>
            {isEdit ? 'Save changes' : 'Add Connection'}
          </Button>
        </div>
      </form>
    </FormDialog>
  );
}
