"use client";

import {
  ChevronRight,
  MoreHorizontal,
  Pencil,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

interface RolesListProps {
  roles: Role[];
  total: number;
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export function RolesList({
  roles,
  total,
  isLoading,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: RolesListProps) {
  return (
    <aside className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-token-sm">
      <div className="border-b border-[var(--border)] px-4 py-3">
        <div className="caption-upper">Roles</div>
        <div className="mt-0.5 text-[12px] text-[var(--fg-subtle)]">
          {total} total
        </div>
      </div>
      <div className="flex max-h-[70vh] flex-col overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex flex-col gap-1 p-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} className="skel h-12" />
            ))}
          </div>
        ) : roles.length ? (
          roles.map((r) => {
            const active = r.id === selectedId;
            return (
              <div
                key={r.id}
                className={cn(
                  "group relative flex cursor-pointer items-start gap-2.5 rounded-md px-3 py-2.5 transition-colors",
                  active
                    ? "bg-[var(--primary-soft)]"
                    : "hover:bg-[var(--surface-muted)]",
                )}
                onClick={() => onSelect(r.id)}
              >
                <span
                  className={cn(
                    "mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md",
                    active
                      ? "bg-[var(--primary)] text-[var(--primary-fg)]"
                      : "bg-[var(--surface-muted)] text-[var(--fg-muted)]",
                  )}
                >
                  <ShieldCheck className="size-3.5" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 grow">
                  <div
                    className={cn(
                      "flex items-center gap-2 truncate text-[13px] font-medium",
                      active ? "text-[var(--primary)]" : "text-[var(--fg)]",
                    )}
                  >
                    {r.name}
                    {r.role_type === "system" && (
                      <span className="inline-flex items-center rounded-[var(--radius-badge)] bg-[var(--surface-muted)] px-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                        System
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 truncate font-mono text-[11px] text-[var(--fg-subtle)]">
                    {r.slug} · L{r.hierarchy_level}
                  </div>
                </div>

                <div
                  className="shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <button
                          type="button"
                          aria-label="Role actions"
                          className="inline-flex size-6 items-center justify-center rounded text-[var(--fg-subtle)] opacity-0 transition-opacity hover:bg-[var(--surface)] hover:text-[var(--fg)] group-hover:opacity-100 data-[popup-open]:opacity-100"
                        >
                          <MoreHorizontal className="size-3.5" strokeWidth={1.75} />
                        </button>
                      }
                    />
                    <DropdownMenuContent align="end" className="min-w-[140px]">
                      <DropdownMenuItem onClick={() => onEdit(r)}>
                        <Pencil className="size-3.5" strokeWidth={1.75} />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        disabled={r.role_type === "system"}
                        onClick={() => onDelete(r)}
                      >
                        <Trash2 className="size-3.5" strokeWidth={1.75} />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {active && (
                  <ChevronRight
                    className="size-4 shrink-0 self-center text-[var(--primary)]"
                    strokeWidth={1.75}
                  />
                )}
              </div>
            );
          })
        ) : (
          <div className="px-2 py-6 text-center text-[13px] text-[var(--fg-subtle)]">
            No roles yet.
          </div>
        )}
      </div>
    </aside>
  );
}
