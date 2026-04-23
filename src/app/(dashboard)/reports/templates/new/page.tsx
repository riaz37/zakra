'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { useCreateReportTemplate } from '@/hooks/useReportTemplates';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { useDbConnections } from '@/hooks/useDbConnections';
import type { ReportSectionConfig, ReportType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: 'financial', label: 'Financial' },
  { value: 'sales', label: 'Sales' },
  { value: 'hr', label: 'HR' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'custom', label: 'Custom' },
];

function defaultSection(): ReportSectionConfig {
  return {
    title: '',
    description: '',
    query_hint: '',
    chart_preference: 'auto',
    analysis_prompt: null,
    include_table: true,
    include_chart: true,
    order: 0,
  };
}

export default function NewTemplatePage() {
  const router = useRouter();
  const companyId = useCurrentCompanyId();
  const { data: connectionsData } = useDbConnections({ company_id: companyId });
  const connections = connectionsData?.items ?? [];

  const createTemplate = useCreateReportTemplate(companyId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [connectionId, setConnectionId] = useState('');
  const [reportType, setReportType] = useState<ReportType>('custom');
  const [sections, setSections] = useState<ReportSectionConfig[]>([defaultSection()]);
  const [error, setError] = useState<string | null>(null);

  const addSection = () => {
    setSections((prev) => [...prev, { ...defaultSection(), order: prev.length }]);
  };

  const removeSection = (idx: number) => {
    setSections((prev) => prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i })));
  };

  const updateSection = (idx: number, patch: Partial<ReportSectionConfig>) => {
    setSections((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Template name is required.');
      return;
    }
    if (!connectionId) {
      setError('Please select a database connection.');
      return;
    }

    try {
      await createTemplate.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        connection_id: connectionId,
        report_type: reportType,
        sections,
      });
      router.push('/reports/templates');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create template.';
      setError(msg);
    }
  };

  return (
    <div className="mx-auto max-w-[680px] px-6 py-8">
      {/* Back nav */}
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1 font-sans text-[13px] text-muted transition-colors hover:text-muted-strong"
      >
        <ChevronLeft size={14} strokeWidth={1.75} />
        Templates
      </button>

      {/* Page heading */}
      <h1 className="mb-8 font-sans text-[26px] font-semibold tracking-[-0.52px] text-foreground">
        New Template
      </h1>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
        {/* Basic info panel */}
        <section className="rounded-xl border border-border bg-surface-200 p-6">
          <h2 className="mb-5 font-sans text-[13px] font-medium uppercase tracking-[0.06em] text-muted/60">
            Basic info
          </h2>

          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tpl-name">
                Name <span className="text-error">*</span>
              </Label>
              <Input
                id="tpl-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Monthly Revenue Report"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tpl-description">Description</Label>
              <Textarea
                id="tpl-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this template generate?"
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tpl-connection">
                  Database Connection <span className="text-error">*</span>
                </Label>
                <Select value={connectionId} onValueChange={setConnectionId}>
                  <SelectTrigger id="tpl-connection">
                    <SelectValue placeholder="Select a connection…" />
                  </SelectTrigger>
                  <SelectContent side="bottom">
                    {connections.map((c) => (
                      <SelectItem key={c.id} value={c.id} label={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tpl-report-type">Report Type</Label>
                <Select
                  value={reportType}
                  onValueChange={(v) => setReportType(v as ReportType)}
                >
                  <SelectTrigger id="tpl-report-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="bottom">
                    {REPORT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value} label={t.label}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Sections panel */}
        <section className="rounded-xl border border-border bg-surface-200 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-sans text-[13px] font-medium uppercase tracking-[0.06em] text-muted/60">
              Sections
            </h2>
            <Button type="button" variant="outline" size="sm" onClick={addSection}>
              <Plus size={13} strokeWidth={1.75} />
              Add section
            </Button>
          </div>

          <div className="space-y-0">
            {sections.map((section, idx) => (
              <div
                key={idx}
                className={cn(
                  'space-y-3 py-4',
                  idx > 0 && 'border-t border-border',
                )}
              >
                {/* Section row header */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-muted/50">
                    Section {idx + 1}
                  </span>
                  {sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSection(idx)}
                      className="flex items-center gap-1 font-sans text-[12px] text-error/70 transition-colors hover:text-error"
                    >
                      <Trash2 size={12} strokeWidth={1.75} />
                      Remove
                    </button>
                  )}
                </div>

                <Input
                  value={section.title}
                  onChange={(e) => updateSection(idx, { title: e.target.value })}
                  placeholder="Section title"
                />
                <Input
                  value={section.description}
                  onChange={(e) => updateSection(idx, { description: e.target.value })}
                  placeholder="Description"
                />
                <Input
                  value={section.query_hint}
                  onChange={(e) => updateSection(idx, { query_hint: e.target.value })}
                  placeholder="Query hint (e.g. 'monthly revenue by product')"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Error banner */}
        {error && (
          <p className="rounded-lg border border-error-border bg-error-bg px-4 py-3 font-sans text-[13px] text-error">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={createTemplate.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createTemplate.isPending}>
            {createTemplate.isPending ? 'Saving…' : 'Save template'}
          </Button>
        </div>
      </form>
    </div>
  );
}
