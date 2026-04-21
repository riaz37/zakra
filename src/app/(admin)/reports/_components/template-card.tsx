"use client";

import { useState } from "react";
import { FileText, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ReportTemplate } from "@/types";
import {
  useDeleteReportTemplate,
} from "@/hooks/useReportTemplates";
import type { DatabaseConnection } from "@/types";

interface TemplateCardProps {
  template: ReportTemplate;
  connections: DatabaseConnection[];
  companyId: string | undefined;
  onEdit: (template: ReportTemplate) => void;
}

const REPORT_TYPE_LABEL: Record<string, string> = {
  financial: "Financial",
  sales: "Sales",
  hr: "HR",
  inventory: "Inventory",
  custom: "Custom",
};

export function TemplateCard({
  template,
  connections,
  companyId,
  onEdit,
}: TemplateCardProps) {
  const deleteMutation = useDeleteReportTemplate(companyId);
  const [confirming, setConfirming] = useState(false);

  const connection = connections.find((c) => c.id === template.connection_id);
  const sectionCount = template.sections.length;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(template.id);
      toast.success(`Deleted ${template.name}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete template",
      );
    } finally {
      setConfirming(false);
    }
  };

  return (
    <article className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-token-sm transition-colors hover:border-[var(--primary)] hover:shadow-token-md">
      <header className="flex items-start gap-3">
        <span
          aria-hidden
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--primary-soft)] text-[var(--primary)]"
        >
          <FileText className="size-[18px]" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 grow">
          <h3 className="truncate font-display text-[15px] font-semibold leading-[22px] -tracking-[0.01em]">
            {template.name}
          </h3>
          {template.description && (
            <p className="mt-1 line-clamp-2 text-[13px] leading-[18px] text-[var(--fg-muted)]">
              {template.description}
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label="Template actions"
                className="-mr-1.5 -mt-1.5 inline-flex size-7 items-center justify-center rounded-md text-[var(--fg-subtle)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--fg)]"
              />
            }
          >
            <MoreHorizontal className="size-4" strokeWidth={1.75} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[160px]">
            <DropdownMenuItem onClick={() => onEdit(template)}>
              <Pencil className="size-3.5" strokeWidth={1.75} />
              Edit template
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setConfirming(true)}
            >
              <Trash2 className="size-3.5" strokeWidth={1.75} />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <footer className="mt-auto flex items-center gap-2 border-t border-[var(--border)] pt-3 text-[12px]">
        <span className="inline-flex h-[22px] items-center rounded-[var(--radius-badge)] bg-[var(--primary-soft)] px-2 text-[var(--primary)]">
          {REPORT_TYPE_LABEL[template.report_type] ?? template.report_type}
        </span>
        <span className="text-[var(--fg-muted)]">
          {sectionCount} {sectionCount === 1 ? "section" : "sections"}
        </span>
        <span className="grow" />
        <span className="truncate font-mono text-[11px] text-[var(--fg-subtle)]">
          {connection?.name ?? "—"}
        </span>
      </footer>

      {confirming && (
        <div
          role="alertdialog"
          aria-label="Confirm delete"
          className="-mx-5 -mb-5 mt-1 flex items-center gap-3 border-t border-[var(--destructive-soft)] bg-[var(--destructive-soft)] px-5 py-3"
        >
          <span className="grow text-[13px] text-[var(--destructive)]">
            Delete this template?
          </span>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="h-7 rounded-md px-2 text-[12px] font-medium text-[var(--destructive)] hover:bg-[var(--destructive-soft)]/70"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="inline-flex h-7 items-center rounded-md bg-[var(--destructive)] px-2.5 text-[12px] font-medium text-white disabled:opacity-60"
          >
            Delete
          </button>
        </div>
      )}
    </article>
  );
}
