'use client';

import { GitBranch, Plus } from 'lucide-react';

import { useCompany } from '@/hooks/useCompanies';
import { StatusBadge, type StatusVariant } from '@/components/shared/status-badge';
import { Skeleton } from '@/components/shared/skeleton';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format-date';
import type { Company } from '@/types';

interface CompanyPopoverProps {
  companyId: string;
  fallback: Company;
  onAddSubsidiary: (parent: Company) => void;
  onClose: () => void;
}



const KNOWN_STATUSES: ReadonlyArray<StatusVariant> = ['active', 'inactive', 'suspended', 'pending'];

function isKnownStatus(value: string): value is StatusVariant {
  return (KNOWN_STATUSES as ReadonlyArray<string>).includes(value);
}

/**
 * Detail panel rendered inside the hierarchy Sheet.
 *
 * Falls back to the list-row data while `useCompany` resolves so the panel
 * never flashes empty: name, type and status are present immediately, and
 * only the count + dates show a skeleton during the fetch.
 */
export function CompanyPopover({
  companyId,
  fallback,
  onAddSubsidiary,
  onClose,
}: CompanyPopoverProps) {
  const { data, isLoading } = useCompany(companyId);
  const company = data ?? fallback;
  const status = isKnownStatus(company.status) ? company.status : 'inactive';
  const subsidiaryCount =
    company.subsidiary_count ?? company.subsidiaries?.length ?? 0;

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-4 p-5 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5 min-w-0">
            <h2 className="font-sans text-subheading font-medium tracking-[-0.01em] text-foreground leading-tight truncate">
              {company.name}
            </h2>
            <div className="flex items-center gap-2">
              <StatusBadge status={status} size="sm" />
              <span className="font-sans text-caption text-fg-muted capitalize">
                {company.company_type}
              </span>
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-caption">
          <dt className="text-fg-muted font-sans">Slug</dt>
          <dd className="font-mono text-mono-sm text-foreground truncate" title={company.slug}>
            {company.slug}
          </dd>

          <dt className="text-fg-muted font-sans">Subsidiaries</dt>
          <dd className="font-sans text-foreground tabular-nums">
            {isLoading && data === undefined ? (
              <Skeleton className="h-3 w-8" />
            ) : (
              subsidiaryCount
            )}
          </dd>

          <dt className="text-fg-muted font-sans">Created</dt>
          <dd className="font-sans text-foreground">
            {isLoading && data === undefined ? (
              <Skeleton className="h-3 w-24" />
            ) : (
              formatDate(company.created_at)
            )}
          </dd>

          {company.parent_id ? (
            <>
              <dt className="text-fg-muted font-sans">Parent</dt>
              <dd className="font-mono text-mono-sm text-fg-subtle truncate" title={company.parent_id}>
                {company.parent_id.slice(0, 8)}…
              </dd>
            </>
          ) : null}
        </dl>
      </div>

      <div className="flex flex-col gap-2 p-5">
        {company.company_type === 'parent' && (
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between gap-2 h-9 px-3"
            onClick={() => onAddSubsidiary(company)}
          >
            <span className="flex items-center gap-2">
              <Plus aria-hidden size={14} strokeWidth={2} />
              Add subsidiary
            </span>
            <GitBranch aria-hidden size={13} strokeWidth={1.75} className="text-fg-muted" />
          </Button>
        )}
      </div>
    </div>
  );
}
