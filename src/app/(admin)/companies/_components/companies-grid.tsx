import { Building2, ExternalLink, GitBranch, Plus } from "lucide-react";
import type { Company } from "@/types";
import { StatusBadge } from "./status-badge";

interface CompaniesGridProps {
  isLoading: boolean;
  items: Company[] | undefined;
  onOpen: (id: string) => void;
  onCreate: () => void;
}

export function CompaniesGrid({
  isLoading,
  items,
  onOpen,
  onCreate,
}: CompaniesGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className="skel h-[148px] rounded-[var(--radius-card)]"
          />
        ))}
      </div>
    );
  }

  if (items && items.length > 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onOpen(c.id)}
            className="group flex flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 text-left shadow-token-sm transition-all hover:border-[var(--primary)] hover:shadow-token-md"
          >
            <div className="flex items-start gap-3">
              <span
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-[var(--primary-soft)] font-display text-[18px] font-semibold text-[var(--primary)]"
                aria-hidden="true"
              >
                {c.name[0]?.toUpperCase() ?? "?"}
              </span>
              <div className="min-w-0 grow">
                <div className="flex items-start gap-2">
                  <h3 className="min-w-0 truncate font-display text-[16px] font-semibold -tracking-[0.01em]">
                    {c.name}
                  </h3>
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="truncate font-mono text-[12px] text-[var(--fg-muted)]">
                    {c.slug}
                  </span>
                  {c.company_type === "subsidiary" && (
                    <span className="inline-flex items-center gap-1 rounded-[var(--radius-badge)] bg-[var(--surface-muted)] px-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
                      <GitBranch className="size-2.5" strokeWidth={2} />
                      Subsidiary
                    </span>
                  )}
                </div>
              </div>
              <StatusBadge status={c.status} />
            </div>

            {c.description && (
              <p className="line-clamp-2 text-[13px] leading-5 text-[var(--fg-muted)]">
                {c.description}
              </p>
            )}

            <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-[var(--border)] pt-3">
              <Mini label="Subsidiaries" value={c.subsidiaries?.length ?? 0} />
              <Mini label="Members" value={c.user_count ?? 0} />
              <Mini label="Admins" value={c.admin_count ?? 0} />
            </dl>

            <div className="flex items-center justify-between text-[12px]">
              <span className="text-[var(--fg-subtle)]">
                {new Date(c.created_at).toLocaleDateString()}
              </span>
              <span className="inline-flex items-center gap-1 font-medium text-[var(--primary)] opacity-0 transition-opacity group-hover:opacity-100">
                Open <ExternalLink className="size-3" strokeWidth={1.75} />
              </span>
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-12 text-center shadow-token-sm">
      <span className="inline-flex size-10 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
        <Building2 className="size-[18px]" strokeWidth={1.75} />
      </span>
      <h3 className="font-display text-[16px] font-semibold -tracking-[0.01em]">
        No companies yet
      </h3>
      <p className="max-w-sm text-[13px] text-[var(--fg-subtle)]">
        Add your first tenant to start assigning users and connections.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="btn btn-primary mt-1"
      >
        <Plus className="size-[14px]" strokeWidth={1.75} />
        New company
      </button>
    </div>
  );
}

interface MiniProps {
  label: string;
  value: number;
}

function Mini({ label, value }: MiniProps) {
  return (
    <div>
      <div className="caption-upper text-[10px] tracking-[0.08em]">{label}</div>
      <div className="mt-0.5 font-display text-[16px] font-semibold -tracking-[0.01em] text-[var(--fg)]">
        {value}
      </div>
    </div>
  );
}
