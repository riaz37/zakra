'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateReportTemplate } from '@/hooks/useReportTemplates';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { useDbConnections } from '@/hooks/useDbConnections';
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

  const inputStyle = {
    background: 'var(--color-background)',
    borderColor: 'var(--color-border)',
    fontFamily: 'var(--font-serif)',
    color: 'var(--color-foreground)',
  };

  return (
    <div className="mx-auto max-w-[720px] px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1.5 text-[13px] transition-colors hover:opacity-80"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-muted)' }}
        >
          <ChevronLeft className="h-4 w-4" />
          Templates
        </button>
        <h1
          className="text-[28px]"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            letterSpacing: '-0.56px',
            color: 'var(--color-foreground)',
          }}
        >
          New Template
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
            {/* Name */}
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
                placeholder="e.g. Monthly Revenue Report"
                className="w-full rounded-[var(--radius-md)] border px-4 py-2.5 text-[14px] outline-none transition-shadow focus:shadow-[var(--shadow-focus)]"
                style={inputStyle}
                required
              />
            </div>

            {/* Description */}
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
                placeholder="What does this template generate?"
                rows={2}
                className="w-full resize-none rounded-[var(--radius-md)] border px-4 py-2.5 text-[14px] outline-none transition-shadow focus:shadow-[var(--shadow-focus)]"
                style={inputStyle}
              />
            </div>

            {/* Connection */}
            <div>
              <label
                className="mb-1.5 block text-[13px] font-medium"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}
              >
                Database Connection <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <select
                value={connectionId}
                onChange={(e) => setConnectionId(e.target.value)}
                className="w-full rounded-[var(--radius-md)] border px-4 py-2.5 text-[14px] outline-none transition-shadow focus:shadow-[var(--shadow-focus)]"
                style={{
                  ...inputStyle,
                  fontFamily: 'var(--font-display)',
                }}
                required
              >
                <option value="">Select a connection…</option>
                {connections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Report type */}
            <div>
              <label
                className="mb-1.5 block text-[13px] font-medium"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}
              >
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
                className="w-full rounded-[var(--radius-md)] border px-4 py-2.5 text-[14px] outline-none"
                style={{ ...inputStyle, fontFamily: 'var(--font-display)' }}
              >
                {REPORT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
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
                style={{
                  background: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                }}
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
                    placeholder="Query hint (e.g. 'monthly revenue by product')"
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
            disabled={createTemplate.isPending}
            className="rounded-[var(--radius-lg)] px-5 py-2 text-[13px] transition-colors hover:opacity-90 disabled:opacity-50"
            style={{
              background: 'var(--color-foreground)',
              color: 'var(--color-background)',
              fontFamily: 'var(--font-display)',
            }}
          >
            {createTemplate.isPending ? 'Saving…' : 'Save template'}
          </button>
        </div>
      </form>
    </div>
  );
}
