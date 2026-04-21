'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useReportTemplate, useUpdateReportTemplate } from '@/hooks/useReportTemplates';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import type { ReportSectionConfig, ReportType } from '@/types';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';

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

export default function EditTemplatePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const companyId = useCurrentCompanyId();

  const { data: template, isLoading } = useReportTemplate(id, companyId);
  const updateTemplate = useUpdateReportTemplate(companyId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState<ReportSectionConfig[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Pre-populate from fetched template
  useEffect(() => {
    if (!template) return;
    setName(template.name);
    setDescription(template.description ?? '');
    setSections(template.sections.length > 0 ? template.sections : [defaultSection()]);
  }, [template]);

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

    try {
      await updateTemplate.mutateAsync({
        templateId: id,
        data: {
          name: name.trim(),
          description: description.trim() || undefined,
          sections,
        },
      });
      router.push('/reports/templates');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update template.';
      setError(msg);
    }
  };

  const inputStyle = {
    background: 'var(--color-background)',
    borderColor: 'var(--color-border)',
    fontFamily: 'var(--font-serif)',
    color: 'var(--color-foreground)',
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[720px] px-6 py-8">
        <div className="h-8 w-48 animate-pulse rounded" style={{ background: 'var(--color-surface-300)' }} />
        <div className="mt-6 h-64 animate-pulse rounded-[var(--radius-xl)]" style={{ background: 'var(--color-surface-300)' }} />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="mx-auto max-w-[720px] px-6 py-8">
        <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-muted)' }}>
          Template not found.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[720px] px-6 py-8">
      {/* Breadcrumb */}
      <div className="mb-8">
        <nav className="mb-3 flex items-center gap-1.5 text-[13px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-muted)' }}>
          <button onClick={() => router.push('/reports/templates')} className="transition-colors hover:opacity-80">
            Templates
          </button>
          <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
          <span style={{ color: 'var(--color-foreground)' }}>{template.name}</span>
        </nav>
        <h1
          className="text-[28px]"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            letterSpacing: '-0.56px',
            color: 'var(--color-foreground)',
          }}
        >
          Edit Template
        </h1>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        {/* Basic fields */}
        <div
          className="rounded-[var(--radius-xl)] border p-6"
          style={{ background: 'var(--color-surface-100)', borderColor: 'var(--color-border)' }}
        >
          <h2
            className="mb-4 text-[15px] font-medium"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}
          >
            Basic info
          </h2>

          <div className="space-y-4">
            <div>
              <label
                className="mb-1.5 block text-[13px] font-medium"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}
              >
                Name <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-[var(--radius-md)] border px-4 py-2.5 text-[14px] outline-none transition-shadow focus:shadow-[var(--shadow-focus)]"
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label
                className="mb-1.5 block text-[13px] font-medium"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}
              >
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-[var(--radius-md)] border px-4 py-2.5 text-[14px] outline-none transition-shadow focus:shadow-[var(--shadow-focus)]"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Sections */}
        <div
          className="rounded-[var(--radius-xl)] border p-6"
          style={{ background: 'var(--color-surface-100)', borderColor: 'var(--color-border)' }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2
              className="text-[15px] font-medium"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}
            >
              Sections
            </h2>
            <button
              type="button"
              onClick={addSection}
              className="flex items-center gap-1.5 rounded-[var(--radius-lg)] px-3 py-1.5 text-[12px] transition-colors hover:opacity-80"
              style={{
                background: 'var(--color-surface-300)',
                fontFamily: 'var(--font-display)',
                color: 'var(--color-foreground)',
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Add section
            </button>
          </div>

          <div className="space-y-4">
            {sections.map((section, idx) => (
              <div
                key={idx}
                className="rounded-[var(--radius-lg)] border p-4"
                style={{ background: 'var(--color-background)', borderColor: 'var(--color-border)' }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span
                    className="text-[12px]"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}
                  >
                    Section {idx + 1}
                  </span>
                  {sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSection(idx)}
                      className="flex items-center gap-1 text-[12px] transition-colors hover:opacity-80"
                      style={{ color: 'var(--color-error)', fontFamily: 'var(--font-display)' }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSection(idx, { title: e.target.value })}
                    placeholder="Section title"
                    className="w-full rounded-[var(--radius-md)] border px-3 py-2 text-[13px] outline-none focus:shadow-[var(--shadow-focus)]"
                    style={inputStyle}
                  />
                  <input
                    type="text"
                    value={section.description}
                    onChange={(e) => updateSection(idx, { description: e.target.value })}
                    placeholder="Description"
                    className="w-full rounded-[var(--radius-md)] border px-3 py-2 text-[13px] outline-none focus:shadow-[var(--shadow-focus)]"
                    style={inputStyle}
                  />
                  <input
                    type="text"
                    value={section.query_hint}
                    onChange={(e) => updateSection(idx, { query_hint: e.target.value })}
                    placeholder="Query hint"
                    className="w-full rounded-[var(--radius-md)] border px-3 py-2 text-[13px] outline-none focus:shadow-[var(--shadow-focus)]"
                    style={inputStyle}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="rounded-[var(--radius-lg)] border px-4 py-3 text-[14px]"
            style={{
              background: 'rgba(207,45,86,0.06)',
              borderColor: 'rgba(207,45,86,0.2)',
              fontFamily: 'var(--font-serif)',
              color: 'var(--color-error)',
            }}
          >
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-[var(--radius-lg)] px-4 py-2 text-[13px] transition-colors hover:opacity-80"
            style={{
              background: 'var(--color-surface-300)',
              fontFamily: 'var(--font-display)',
              color: 'var(--color-foreground)',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateTemplate.isPending}
            className="rounded-[var(--radius-lg)] px-5 py-2 text-[13px] transition-colors hover:opacity-90 disabled:opacity-50"
            style={{
              background: 'var(--color-foreground)',
              color: 'var(--color-background)',
              fontFamily: 'var(--font-display)',
            }}
          >
            {updateTemplate.isPending ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
