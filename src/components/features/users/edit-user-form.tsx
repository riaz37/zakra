'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { UseMutationResult } from '@tanstack/react-query';
import type { UserUpdate } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel, FieldError } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const editUserSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  user_type: z.enum(['admin', 'regular']),
});

export type EditUserFormValues = z.infer<typeof editUserSchema>;

interface EditUserFormProps {
  userId: string;
  initial: EditUserFormValues;
  updateMutation: UseMutationResult<unknown, unknown, { data: UserUpdate; companyId?: string }, unknown>;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditUserForm({
  updateMutation,
  initial,
  onSuccess,
  onCancel,
}: EditUserFormProps) {
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: initial,
  });

  async function onSubmit(data: EditUserFormValues) {
    await updateMutation.mutateAsync({ data });
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="edit-first-name">First Name</FieldLabel>
          <Input {...register('first_name')} id="edit-first-name" placeholder="Jane" />
          {errors.first_name && <FieldError errors={[errors.first_name]} />}
        </Field>
        <Field>
          <FieldLabel htmlFor="edit-last-name">Last Name</FieldLabel>
          <Input {...register('last_name')} id="edit-last-name" placeholder="Smith" />
          {errors.last_name && <FieldError errors={[errors.last_name]} />}
        </Field>
        <Controller
          control={control}
          name="user_type"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="edit-user-type">User Type</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="edit-user-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
