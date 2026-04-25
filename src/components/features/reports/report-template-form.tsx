'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import type { ReportSectionConfig, ReportType, DbConnection } from '@/types';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: 'financial', label: 'Financial' },
  { value: 'sales', label: 'Sales' },
  { value: 'hr', label: 'HR' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'custom', label: 'Custom' },
];

const sectionSchema = z.object({
  title: z.string().min(1, 'Section title is required'),
  description: z.string().optional(),
  query_hint: z.string().min(1, 'Query hint is required'),
  chart_preference: z.enum(['auto', 'bar', 'line', 'pie', 'table']),
  include_table: z.boolean(),
  include_chart: z.boolean(),
  order: z.number(),
});

const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  connection_id: z.string().min(1, 'Please select a database connection'),
  report_type: z.enum(['financial', 'sales', 'hr', 'inventory', 'custom']),
  sections: z.array(sectionSchema).min(1, 'At least one section is required'),
});

export type ReportTemplateFormData = z.infer<typeof templateSchema>;

interface ReportTemplateFormProps {
  initial?: Partial<ReportTemplateFormData>;
  onSubmit: (data: ReportTemplateFormData) => void;
  isPending: boolean;
  onCancel: () => void;
  submitLabel?: string;
  connections: DbConnection[];
}

export function ReportTemplateForm({
  initial,
  onSubmit,
  isPending,
  onCancel,
  submitLabel = 'Save template',
  connections,
}: ReportTemplateFormProps) {
  const form = useForm<ReportTemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      connection_id: initial?.connection_id ?? '',
      report_type: initial?.report_type ?? 'custom',
      sections: initial?.sections ?? [
        {
          title: '',
          description: '',
          query_hint: '',
          chart_preference: 'auto',
          include_table: true,
          include_chart: true,
          order: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'sections',
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <section className="rounded-xl border border-border bg-surface-100 p-6">
        <h2 className="mb-5 font-sans text-[13px] font-medium uppercase tracking-[0.06em] text-muted/60">
          Basic info
        </h2>

        <FieldGroup className="gap-5">
          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Name *</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="e.g. Monthly Revenue Report"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                <Textarea
                  {...field}
                  id={field.name}
                  placeholder="What does this template generate?"
                  rows={2}
                  className="resize-none"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <Controller
              control={form.control}
              name="connection_id"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Database Connection *</FieldLabel>
                  <Select
                    onValueChange={(v) => field.onChange(v || '')}
                    defaultValue={field.value}
                  >
                    <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Select a connection…" />
                    </SelectTrigger>
                    <SelectContent>
                      {connections.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
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
              name="report_type"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Report Type</FieldLabel>
                  <Select
                    onValueChange={(v) => field.onChange(v || 'custom')}
                    defaultValue={field.value}
                  >
                    <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REPORT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>
        </FieldGroup>
      </section>

      <section className="rounded-xl border border-border bg-surface-100 p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-sans text-[13px] font-medium uppercase tracking-[0.06em] text-muted/60">
            Sections
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                title: '',
                description: '',
                query_hint: '',
                chart_preference: 'auto',
                include_table: true,
                include_chart: true,
                order: fields.length,
              })
            }
          >
            <Plus aria-hidden size={14} strokeWidth={2} />
            Add section
          </Button>
        </div>

        <div className="space-y-0">
          {fields.map((field, idx) => (
            <div
              key={field.id}
              className={cn(
                'space-y-4 py-6',
                idx > 0 && 'border-t border-border',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-medium text-muted/50 uppercase tracking-wider">
                  Section {idx + 1}
                </span>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-error hover:text-error hover:bg-error/5"
                    onClick={() => remove(idx)}
                  >
                    <Trash2 aria-hidden size={13} strokeWidth={1.75} />
                    Remove
                  </Button>
                )}
              </div>

              <FieldGroup className="gap-4">
                <Controller
                  control={form.control}
                  name={`sections.${idx}.title`}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Section Title *</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        placeholder="e.g. Revenue Overview"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name={`sections.${idx}.query_hint`}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Query Hint *</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        placeholder="e.g. Show monthly revenue for the current year"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name={`sections.${idx}.description`}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        placeholder="Optional description for this section"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
