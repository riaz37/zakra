'use client';

import { useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import {
  useCreateBusinessRule,
  useUpdateBusinessRule,
} from '@/hooks/useBusinessRules';
import { useUsers } from '@/hooks/useUsers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import type { BusinessRule } from '@/types';

const ruleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  rule_text: z.string().min(1, 'Rule text is required'),
  scope_type: z.enum(['global', 'table', 'user']),
  scope_value: z.string().optional(),
});

type RuleFormValues = z.infer<typeof ruleSchema>;

const EMPTY_DEFAULTS: RuleFormValues = {
  name: '',
  rule_text: '',
  scope_type: 'global',
  scope_value: '',
};

export interface RuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectionId: string;
  companyId?: string;
  editingRule?: BusinessRule | null;
}

export function RuleDialog({
  open,
  onOpenChange,
  connectionId,
  companyId,
  editingRule,
}: RuleDialogProps) {
  const isEdit = !!editingRule;

  const { data: usersData } = useUsers(companyId ? { company_id: companyId, page_size: 200 } : { page_size: 200 });
  const users = usersData?.items ?? [];

  function userDisplayName(user: { first_name: string | null; last_name: string | null; email: string }): string {
    const parts = [user.first_name, user.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : user.email;
  }

  const createRule = useCreateBusinessRule(connectionId, companyId);
  const updateRule = useUpdateBusinessRule(connectionId, companyId);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RuleFormValues>({
    resolver: zodResolver(ruleSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  const scopeType = useWatch({ control, name: 'scope_type' });

  useEffect(() => {
    if (!open) return;
    if (editingRule) {
      reset({
        name: editingRule.name,
        rule_text: editingRule.rule_text,
        scope_type: editingRule.scope_type,
        scope_value: editingRule.scope_value ?? '',
      });
    } else {
      reset(EMPTY_DEFAULTS);
    }
  }, [open, editingRule, reset]);

  async function onSubmit(data: RuleFormValues) {
    try {
      if (editingRule) {
        await updateRule.mutateAsync({ ruleId: editingRule.id, data });
        toast.success('Business rule saved');
      } else {
        await createRule.mutateAsync(data);
        toast.success('Business rule created');
      }
      reset(EMPTY_DEFAULTS);
      onOpenChange(false);
    } catch {
      toast.error('Could not save rule. Please try again.');
    }
  }

  function handleClose() {
    reset(EMPTY_DEFAULTS);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col sm:max-w-[560px]"
      >
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle>{isEdit ? 'Edit rule' : 'Add rule'}</SheetTitle>
          {editingRule && (
            <p className="font-mono text-mono-sm text-fg-muted">
              {editingRule.name}
            </p>
          )}
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-0 overflow-hidden"
          noValidate
        >
          <div className="flex-1 overflow-y-auto px-4 py-5">
            <FieldGroup>
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="rule-name">Name</FieldLabel>
                <Input
                  {...register('name')}
                  id="rule-name"
                  placeholder="e.g. Exclude test data"
                  aria-invalid={!!errors.name}
                />
                {errors.name && <FieldError errors={[errors.name]} />}
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  control={control}
                  name="scope_type"
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor="rule-scope">Scope</FieldLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <SelectTrigger id="rule-scope">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="global">Global</SelectItem>
                          <SelectItem value="table">Table</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />

                {(scopeType === 'table' || scopeType === 'user') && (
                  <Controller
                    control={control}
                    name="scope_value"
                    render={({ field }) => (
                      <Field data-invalid={!!errors.scope_value}>
                        <FieldLabel htmlFor="rule-scope-value">
                          {scopeType === 'table' ? 'Table name' : 'User'}
                        </FieldLabel>
                        {scopeType === 'user' ? (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            defaultValue={field.value}
                          >
                            <SelectTrigger id="rule-scope-value">
                              <SelectValue placeholder="Select a user…">
                                {field.value
                                  ? userDisplayName(users.find((u) => u.id === field.value) ?? { first_name: null, last_name: null, email: field.value })
                                  : 'Select a user…'}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent alignItemWithTrigger={false} align="start" className="w-72">
                              {users.map((user) => {
                                const name = userDisplayName(user);
                                const showEmail = name !== user.email;
                                return (
                                  <SelectItem key={user.id} value={user.id} label={name} className="py-1.5">
                                    <span className="flex flex-col gap-0.5 min-w-0">
                                      <span className="truncate">{name}</span>
                                      {showEmail && (
                                        <span className="truncate text-fg-muted text-caption">{user.email}</span>
                                      )}
                                    </span>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            {...field}
                            id="rule-scope-value"
                            placeholder="e.g. invoices"
                            aria-invalid={!!errors.scope_value}
                          />
                        )}
                        {errors.scope_value && (
                          <FieldError errors={[errors.scope_value]} />
                        )}
                      </Field>
                    )}
                  />
                )}
              </div>

              <Field data-invalid={!!errors.rule_text}>
                <FieldLabel htmlFor="rule-text">Rule text</FieldLabel>
                <p className="mb-1.5 font-sans text-caption text-fg-muted">
                  Write in plain language. You can include markdown, SQL
                  snippets, or structured notes — the AI uses this verbatim.
                </p>
                <Textarea
                  {...register('rule_text')}
                  id="rule-text"
                  rows={16}
                  className="font-mono text-body resize-none"
                  placeholder={
                    'Describe the business rule in plain language…\n\nExample:\nWhen querying invoices, always filter by company_id = @CompanyId\nand exclude records where status = \'void\'.'
                  }
                  aria-invalid={!!errors.rule_text}
                />
                {errors.rule_text && (
                  <FieldError errors={[errors.rule_text]} />
                )}
              </Field>
            </FieldGroup>
          </div>

          <SheetFooter className="border-t border-border">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isEdit ? 'Save changes' : 'Add rule'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
