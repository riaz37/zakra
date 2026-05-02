'use client';

import { Edit2, Trash2, LayoutTemplate } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReportTemplate } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/shared/skeleton';
import { formatDate } from '@/lib/format-date';

interface TemplateCardProps {
  template: ReportTemplate;
  onEdit: (template: ReportTemplate) => void;
  onDelete: (template: ReportTemplate) => void;
}

export function TemplateCard({
  template,
  onEdit,
  onDelete,
}: TemplateCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onEdit(template)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onEdit(template);
        }
      }}
      className={cn(
        'group relative flex cursor-pointer flex-col rounded-xl border border-border bg-surface-100 p-5 transition-all duration-200',
        'hover:border-border-medium hover:bg-surface-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-300 text-muted-strong shadow-sm ring-1 ring-border transition-colors group-hover:text-foreground">
            <LayoutTemplate size={20} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="line-clamp-1 font-sans text-[15px] font-semibold tracking-tight text-foreground">
              {template.name}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="default" size="sm" className="font-mono">
                {template.report_type}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Body Snippet */}
      <div className="mt-4 flex-1">
        <p className="line-clamp-2 text-sm leading-relaxed text-muted">
          {template.description || 'No description provided.'}
        </p>
      </div>

      {/* Footer Meta & Actions */}
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-strong">
            {template.sections.length} Section{template.sections.length !== 1 ? 's' : ''}
          </span>
          <span className="font-sans text-xs text-subtle">
            Created {formatDate(template.created_at)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted hover:text-foreground"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(template);
            }}
            aria-label={`Edit ${template.name}`}
          >
            <Edit2 size={14} strokeWidth={2} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted hover:text-error"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(template);
            }}
            aria-label={`Delete ${template.name}`}
          >
            <Trash2 size={14} strokeWidth={2} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function TemplateCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-surface-100 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
      <div className="mt-4 flex-1 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <div className="space-y-1">
          <Skeleton className="h-2.5 w-12" />
          <Skeleton className="h-2.5 w-20" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="size-8 rounded-md" />
        </div>
      </div>
    </div>
  );
}
