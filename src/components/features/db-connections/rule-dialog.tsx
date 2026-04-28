'use client';

import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useCreateBusinessRule, useUpdateBusinessRule } from '@/hooks/useBusinessRules';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldGroup, FieldLabel, FieldError } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { BusinessRule } from '@/types';

const ruleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  rule_text: z.string().min(1, 'Rule text is required'),
  scope_type: z.enum(['global', 'table', 'user']),
  scope_value: z.string().optional(),
});

type RuleFormValues = z.infer<typeof ruleSchema>;

export interface RuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectionId: string;
  companyId?: string;
  editRule?: BusinessRule | null;
}

export function RuleDialog({
  open,
  onOpenChange,
  connectionId,
  companyId,
  editRule,
}: RuleDialogProps) {
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
    defaultValues: editRule
      ? {
          name: editRule.name,
          rule_text: editRule.rule_text,
          scope_type: editRule.scope_type,
          scope_value: editRule.scope_value ?? '',
        }
      : { name: '', rule_text: '', scope_type: 'global', scope_value: '' },
  });

  async function onSubmit(data: RuleFormValues) {
    try {
      if (editRule) {
        await updateRule.mutateAsync({ ruleId: editRule.id, data });
        toast.success('Rule updated');
      } else {
        await createRule.mutateAsync(data);
        toast.success('Rule created');
      }
      reset();
      onOpenChange(false);
    } catch {
      toast.error('Failed to save rule');
    }
  }

  function handleClose() {
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[min(calc(100vw-2rem),32rem)] max-w-none gap-0 p-6"
      >
        <DialogHeader className="gap-1">
          <DialogTitle className="font-sans text-title font-semibold tracking-[-0.11px] text-foreground">
            {editRule ? 'Edit Rule' : 'Add Rule'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 flex flex-col gap-4" noValidate>
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

            <Controller
              control={control}
              name="scope_type"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="rule-scope">Scope</FieldLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            <Field data-invalid={!!errors.rule_text}>
              <FieldLabel htmlFor="rule-text">Rule Text</FieldLabel>
              <Textarea
                {...register('rule_text')}
                id="rule-text"
                rows={4}
                placeholder="Describe the business rule in plain language…"
                aria-invalid={!!errors.rule_text}
              />
              {errors.rule_text && <FieldError errors={[errors.rule_text]} />}
            </Field>
          </FieldGroup>

          <div className="mt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editRule ? 'Update Rule' : 'Add Rule'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
