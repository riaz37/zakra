'use client';

import { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, FileText, AlertCircle } from 'lucide-react';
import type { ReportType, DatabaseConnection } from '@/types';
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

// ── Schema ────────────────────────────────────────────────────────────────────

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
  chart_preference: z.enum(['auto', 'bar', 'line', 'pie', 'scatter', 'table']),
  include_table: z.boolean(),
  include_chart: z.boolean(),
  order: z.number(),
  analysis_prompt: z.string().nullable().optional(),
});

const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  connection_id: z.string().min(1, 'Please select a database connection'),
  report_type: z.enum(['financial', 'sales', 'hr', 'inventory', 'custom']),
  sections: z.array(sectionSchema).min(1, 'At least one section is required'),
});

export type ReportTemplateFormData = z.infer<typeof templateSchema>;

// ── Props ─────────────────────────────────────────────────────────────────────

interface ReportTemplateFormProps {
  initial?: Partial<ReportTemplateFormData>;
  onSubmit: (data: ReportTemplateFormData) => void;
  isPending: boolean;
  connections: DatabaseConnection[];
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ReportTemplateForm({
  initial,
  onSubmit,
  isPending,
  connections,
}: ReportTemplateFormProps) {
  const [activeIdx, setActiveIdx] = useState(0);

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

  const sectionErrors = form.formState.errors.sections;

  function addSection() {
    append({
      title: '',
      description: '',
      query_hint: '',
      chart_preference: 'auto',
      include_table: true,
      include_chart: true,
      order: fields.length,
    });
    setActiveIdx(fields.length);
  }

  function removeSection(idx: number) {
    remove(idx);
    setActiveIdx((prev) => Math.min(prev, fields.length - 2));
  }

  const sectionTitles = form.watch('sections');

  return (
    <form id="template-form" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="flex h-[calc(100dvh-220px)] min-h-[560px] max-h-[900px] overflow-hidden rounded-lg border border-border bg-surface-200">

        {/* ── LEFT: Config panel ──────────────────────────────────────── */}
        <div className="flex w-[300px] shrink-0 flex-col border-r border-border">

          {/* Scrollable content: basic info + section list */}
          <div className="flex-1 overflow-y-auto">

          {/* Basic info */}
          <div className="space-y-4 p-5">
            {sectionErrors && !Array.isArray(sectionErrors) && (
              <div className="rounded-md border border-error-border bg-error-bg p-3 text-error">
                <p className="font-sans text-caption font-medium">
                  {(sectionErrors as { message?: string }).message}
                </p>
              </div>
            )}

            <p className="font-mono text-micro font-medium uppercase tracking-[0.08em] text-muted">
              Basic Info
            </p>

            <FieldGroup className="gap-4">
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
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="connection_id"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Connection *</FieldLabel>
                    <Select
                      onValueChange={(v) => field.onChange(v || '')}
                      value={field.value}
                    >
                      <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Select a connection…">
                          {field.value
                            ? connections.find((c) => c.id === field.value)?.name || field.value
                            : undefined}
                        </SelectValue>
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
                      value={field.value}
                    >
                      <SelectTrigger id={field.name}>
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
                  </Field>
                )}
              />
            </FieldGroup>
          </div>

          {/* Section list */}
          <div className="border-t border-border">
            <div className="flex items-center justify-between px-5 py-3">
              <p className="font-mono text-micro font-medium uppercase tracking-[0.08em] text-muted">
                Sections
                <span className="ml-1.5 tabular-nums text-subtle">
                  ({fields.length})
                </span>
              </p>
              <button
                type="button"
                onClick={addSection}
                className="flex items-center gap-1 rounded-md px-2 py-1 font-sans text-caption text-muted transition-colors hover:bg-surface-300 hover:text-foreground focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]"
              >
                <Plus aria-hidden size={13} strokeWidth={1.5} />
                Add
              </button>
            </div>

            <ul className="px-3 pb-3">
              {fields.map((field, idx) => {
                const title = sectionTitles?.[idx]?.title;
                const hasError = !!sectionErrors?.[idx];
                const isActive = activeIdx === idx;

                return (
                  <li key={field.id}>
                    <button
                      type="button"
                      onClick={() => setActiveIdx(idx)}
                      className={cn(
                        'group/item flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all',
                        isActive
                          ? 'border-accent/30 bg-accent/10 text-foreground shadow-sm ring-1 ring-accent/20'
                          : 'border-transparent text-muted hover:bg-surface-300 hover:text-foreground',
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-5 shrink-0 items-center justify-center rounded font-mono text-micro tabular-nums',
                          isActive
                            ? 'bg-surface-500 text-foreground'
                            : 'bg-surface-300 text-muted',
                        )}
                      >
                        {idx + 1}
                      </span>

                      <span className="min-w-0 flex-1 truncate font-sans text-caption">
                        {title || (
                          <span className="italic text-subtle">Untitled</span>
                        )}
                      </span>

                      {hasError && (
                        <AlertCircle
                          aria-label="Section has errors"
                          className="size-3.5 shrink-0 text-error"
                        />
                      )}
                    </button>
                  </li>
                );
              })}

              {fields.length === 0 && (
                <li className="px-3 py-4 text-center font-sans text-caption text-subtle">
                  No sections yet
                </li>
              )}
            </ul>
          </div>

          </div>{/* end scrollable content */}
        </div>

        {/* ── RIGHT: Section editor ───────────────────────────────────── */}
        <div className="flex flex-1 flex-col">
          {fields.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
              <div className="flex size-12 items-center justify-center rounded-xl border border-border bg-surface-200">
                <FileText aria-hidden className="size-5 text-muted" strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <p className="font-sans text-button font-medium text-foreground">
                  No sections yet
                </p>
                <p className="max-w-[32ch] font-sans text-caption text-muted">
                  Each section generates an AI analysis with an optional chart or data table.
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addSection}>
                <Plus aria-hidden size={16} strokeWidth={1.5} />
                Add first section
              </Button>
            </div>
          ) : (
            fields[activeIdx] && (
              <div className="flex flex-1 flex-col gap-6 p-8">
                {/* Section header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-mono text-micro uppercase tracking-[0.08em] text-muted">
                        Section {activeIdx + 1} of {fields.length}
                      </p>
                    </div>
                  </div>

                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-error hover:bg-error-bg hover:text-error"
                      onClick={() => removeSection(activeIdx)}
                    >
                      <Trash2 aria-hidden size={13} strokeWidth={1.75} />
                      Remove section
                    </Button>
                  )}
                </div>

                {/* Section fields */}
                <FieldGroup className="flex-1 gap-6">
                  <Controller
                    control={form.control}
                    name={`sections.${activeIdx}.title`}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Section Title *</FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          placeholder="e.g. Revenue Overview"
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
                    name={`sections.${activeIdx}.query_hint`}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Query Hint *</FieldLabel>
                        <Textarea
                          {...field}
                          id={field.name}
                          placeholder="Describe what data this section should query and analyse. Be specific — the AI uses this to generate the SQL query and write the analysis."
                          className="h-20 resize-none"
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
                    name={`sections.${activeIdx}.description`}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>
                          Description{' '}
                          <span className="font-normal text-muted">(optional)</span>
                        </FieldLabel>
                        <Textarea
                          {...field}
                          id={field.name}
                          placeholder="Internal note about this section's purpose"
                          className="h-36 resize-none"
                          aria-invalid={fieldState.invalid}
                        />
                      </Field>
                    )}
                  />
                </FieldGroup>

                {/* Section navigation */}
                {fields.length > 1 && (
                  <div className="mt-auto flex items-center gap-2 border-t border-border pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={activeIdx === 0}
                      onClick={() => setActiveIdx((i) => i - 1)}
                    >
                      ← Previous
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={activeIdx === fields.length - 1}
                      onClick={() => setActiveIdx((i) => i + 1)}
                    >
                      Next →
                    </Button>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </form>
  );
}
