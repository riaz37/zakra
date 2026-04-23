'use client';

import { useRouter } from 'next/navigation';
import { useReportTemplates, useDeleteReportTemplate } from '@/hooks/useReportTemplates';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import type { ReportTemplate } from '@/types';
import { Plus, FilePlus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function TemplateRow({
  template,
  onEdit,
  onDelete,
}: {
  template: ReportTemplate;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <tr
      style={{ borderBottom: '1px solid var(--color-border)' }}
      className="group transition-colors hover:bg-[var(--color-surface-100)]"
    >
      <td className="px-5 py-4">
        <p
          className="text-[14px] font-medium"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}
        >
          {template.name}
        </p>
        {template.description && (
          <p
            className="mt-0.5 text-[13px]"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-muted)' }}
          >
            {template.description}
          </p>
        )}
      </td>
      <td className="px-5 py-4">
        <span
          className="rounded-full px-2 py-0.5 text-[11px]"
          style={{
            background: 'var(--color-surface-300)',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-muted-strong)',
          }}
        >
          {template.report_type}
        </span>
      </td>
      <td className="px-5 py-4">
        <span
          className="text-[13px]"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}
        >
          {template.sections.length} section{template.sections.length !== 1 ? 's' : ''}
        </span>
      </td>
      <td className="px-5 py-4">
        <span
          className="text-[13px]"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}
        >
          {formatDate(template.created_at)}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="relative flex justify-end">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-7 w-7 items-center justify-center rounded transition-colors hover:bg-[var(--color-surface-300)]"
            style={{ color: 'var(--color-muted)' }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div
                className="absolute right-0 top-8 z-20 w-[160px] overflow-hidden rounded-[var(--radius-lg)] border shadow-[var(--shadow-elevated)]"
                style={{
                  background: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-[13px] transition-colors hover:bg-[var(--color-surface-200)]"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-[13px] transition-colors hover:bg-[rgba(207,45,86,0.08)]"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-error)' }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function ReportTemplatesPage() {
  const router = useRouter();
  const companyId = useCurrentCompanyId();
  const { data, isLoading } = useReportTemplates(companyId);
  const deleteTemplate = useDeleteReportTemplate(companyId);

  const templates = data?.templates ?? [];

  const handleDelete = (id: string) => {
    if (!confirm('Delete this template? This cannot be undone.')) return;
    deleteTemplate.mutate(id);
  };

  return (
    <div className="mx-auto max-w-[960px] px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1
            className="text-[28px]"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              letterSpacing: '-0.56px',
              color: 'var(--color-foreground)',
            }}
          >
            Report Templates
          </h1>
          <p
            className="mt-1 text-[15px]"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-muted)' }}
          >
            Define reusable templates for AI-generated reports.
          </p>
        </div>
        <button
          onClick={() => router.push('/reports/templates/new')}
          className="flex items-center gap-2 rounded-[var(--radius-lg)] px-4 py-2 text-[13px] transition-colors hover:opacity-90"
          style={{
            background: 'var(--color-foreground)',
            color: 'var(--color-background)',
            fontFamily: 'var(--font-display)',
          }}
        >
          <Plus className="h-4 w-4" />
          New Template
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-[var(--radius-lg)]"
              style={{ background: 'var(--color-surface-300)' }}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && templates.length === 0 && (
        <div
          className="flex flex-col items-center rounded-[var(--radius-xl)] border px-8 py-16 text-center"
          style={{
            background: 'var(--color-surface-100)',
            borderColor: 'var(--color-border)',
          }}
        >
          <FilePlus className="h-7 w-7" strokeWidth={1.25} style={{ color: 'var(--color-muted)', opacity: 0.6 }} />
          <h2
            className="mt-4 text-[18px]"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}
          >
            No report templates
          </h2>
          <p
            className="mt-2 max-w-[340px] text-[15px]"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-muted)' }}
          >
            Create templates to standardize your AI-generated reports.
          </p>
          <button
            onClick={() => router.push('/reports/templates/new')}
            className="mt-6 flex items-center gap-2 rounded-[var(--radius-lg)] px-5 py-[10px] text-[14px] transition-colors hover:opacity-90"
            style={{
              background: 'var(--color-foreground)',
              color: 'var(--color-background)',
              fontFamily: 'var(--font-display)',
            }}
          >
            <Plus className="h-4 w-4" />
            New Template
          </button>
        </div>
      )}

      {/* Table */}
      {!isLoading && templates.length > 0 && (
        <div
          className="overflow-hidden rounded-[var(--radius-xl)] border"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Name', 'Type', 'Sections', 'Created', ''].map((col) => (
                  <th
                    key={col}
                    className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider"
                    style={{
                      background: 'var(--color-surface-200)',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-muted)',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody style={{ background: 'var(--color-background)' }}>
              {templates.map((tpl) => (
                <TemplateRow
                  key={tpl.id}
                  template={tpl}
                  onEdit={() => router.push(`/reports/templates/${tpl.id}`)}
                  onDelete={() => handleDelete(tpl.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
