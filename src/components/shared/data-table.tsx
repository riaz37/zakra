"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";

import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";

export interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  isLoading?: boolean;
  /** Zero-indexed current page. */
  pageIndex?: number;
  /** Total number of pages. Pagination UI hides when pageCount <= 1. */
  pageCount?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  totalCount?: number;
  /** Accessible summary for screen readers — announced by <caption>. */
  caption?: string;
  /** Message shown when data is empty and not loading. */
  emptyMessage?: string;
  onRowClick?: (row: TData) => void;
  className?: string;
}

const SKELETON_ROW_COUNT = 3;

/**
 * Generic TanStack Table wrapper used across Companies, Users, Roles,
 * DB Connections, and Table Access pages.
 *
 * Desktop: classic <table> with uppercase micro headers and warm hover rows.
 * Mobile (<md): collapses to a card list, stacking "label: value" pairs so
 * every column remains readable at 375px.
 */
export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  pageIndex = 0,
  pageCount = 1,
  onPageChange,
  pageSize,
  totalCount,
  caption,
  emptyMessage = "No records to display.",
  onRowClick,
  className,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
  });

  const headerGroups = table.getHeaderGroups();
  const rows = table.getRowModel().rows;

  // Pre-compute header labels once for the mobile card fallback so we don't
  // call flexRender during every row render.
  const columnLabels = useMemo(() => {
    const labels = new Map<string, React.ReactNode>();
    for (const group of headerGroups) {
      for (const header of group.headers) {
        if (header.isPlaceholder) continue;
        const label = flexRender(
          header.column.columnDef.header,
          header.getContext(),
        );
        labels.set(header.column.id, label);
      }
    }
    return labels;
  }, [headerGroups]);

  const showPagination = pageCount > 1;
  const isEmpty = !isLoading && rows.length === 0;

  const startIndex =
    pageSize && totalCount !== undefined
      ? Math.min(pageIndex * pageSize + 1, totalCount)
      : null;
  const endIndex =
    pageSize && totalCount !== undefined
      ? Math.min((pageIndex + 1) * pageSize, totalCount)
      : null;

  return (
    <div className={cn("w-full", className)}>
      {/* -------- Desktop: semantic table -------- */}
      <div className="hidden overflow-hidden rounded-lg border border-border bg-surface-200 md:block">
        <table className="w-full border-collapse">
          {caption ? <caption className="sr-only">{caption}</caption> : null}

          <thead>
            {headerGroups.map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-border bg-surface-100/50"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className="px-4 py-3 text-left align-middle font-sans text-caption font-medium uppercase tracking-[0.048px] text-muted"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {isLoading ? (
              <SkeletonRows columnCount={columns.length} />
            ) : isEmpty ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center font-sans text-body text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "group border-b border-border last:border-b-0",
                    "transition-all hover:bg-accent/5",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell, cellIdx) => (
                    <td
                      key={cell.id}
                      className={cn(
                        "px-4 py-3 align-middle font-sans text-button text-foreground",
                        "relative",
                        cellIdx === 0 && "before:absolute before:left-0 before:top-0 before:h-full before:w-[2px] before:bg-accent before:opacity-0 before:transition-opacity group-hover:before:opacity-100"
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* -------- Mobile: card list -------- */}
      <div className="md:hidden">
        {caption ? <p className="sr-only">{caption}</p> : null}

        {isLoading ? (
          <MobileSkeletonCards />
        ) : isEmpty ? (
          <EmptyState title={emptyMessage} />
        ) : (
          <ul className="space-y-2">
            {rows.map((row) => (
              <li
                key={row.id}
                className={cn(
                  "rounded-lg border border-border bg-surface-200 p-3",
                  onRowClick && "cursor-pointer active:bg-accent/5 transition-colors"
                )}
                onClick={() => onRowClick?.(row.original)}
              >
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
                  {row.getVisibleCells().map((cell) => {
                    const label = columnLabels.get(cell.column.id);
                    return (
                      <div key={cell.id} className="contents">
                        <dt className="font-sans text-caption font-medium uppercase tracking-[0.048px] text-muted">
                          {label}
                        </dt>
                        <dd className="font-sans text-button text-foreground">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* -------- Pagination -------- */}
      {showPagination ? (
        <nav
          aria-label="Pagination navigation"
          className="mt-4 flex items-center justify-between gap-3"
        >
          <div className="font-sans text-caption text-muted">
            {startIndex !== null && endIndex !== null && totalCount !== undefined
              ? `${startIndex}–${endIndex} of ${totalCount}`
              : `Page ${pageIndex + 1} of ${pageCount}`}
          </div>

          <div className="flex items-center gap-2">
            <PaginationButton
              onClick={() => onPageChange?.(pageIndex - 1)}
              disabled={pageIndex <= 0}
              ariaLabel="Previous page"
            >
              <ChevronLeft aria-hidden="true" className="size-3.5" />
              <span>Previous</span>
            </PaginationButton>

            <span
              aria-current="page"
              className="rounded bg-surface-300 px-3 py-1.5 font-sans text-button text-foreground font-feat-tnum"
            >
              {pageIndex + 1}
            </span>

            <PaginationButton
              onClick={() => onPageChange?.(pageIndex + 1)}
              disabled={pageIndex >= pageCount - 1}
              ariaLabel="Next page"
            >
              <span>Next</span>
              <ChevronRight aria-hidden="true" className="size-3.5" />
            </PaginationButton>
          </div>
        </nav>
      ) : null}
    </div>
  );
}

function PaginationButton({
  onClick,
  disabled,
  ariaLabel,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-1 rounded border border-border bg-surface-200 px-3 py-1.5",
        "font-sans text-button text-foreground transition-colors",
        "hover:bg-surface-400/60",
        "focus-visible:border-border-medium focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface-200",
      )}
    >
      {children}
    </button>
  );
}

function SkeletonRows({ columnCount }: { columnCount: number }) {
  return (
    <>
      {Array.from({ length: SKELETON_ROW_COUNT }).map((_, rowIdx) => (
        <tr
          key={rowIdx}
          className="border-b border-border last:border-b-0"
          aria-hidden="true"
        >
          {Array.from({ length: columnCount }).map((_, cellIdx) => (
            <td key={cellIdx} className="px-4 py-3">
              <div
                className="h-5 rounded"
                style={{
                  background:
                    "linear-gradient(90deg, var(--color-surface-300) 25%, var(--color-surface-400) 50%, var(--color-surface-300) 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s ease-in-out infinite",
                }}
              />
            </td>
          ))}
        </tr>
      ))}
      <tr className="sr-only">
        <td colSpan={columnCount}>Loading table data…</td>
      </tr>
    </>
  );
}

function MobileSkeletonCards() {
  return (
    <ul className="space-y-2" aria-hidden="true">
      {Array.from({ length: SKELETON_ROW_COUNT }).map((_, idx) => (
        <li
          key={idx}
          className="rounded-lg border border-border bg-surface-200 p-3"
        >
          <div
            className="h-10 rounded"
            style={{
              background:
                "linear-gradient(90deg, var(--color-surface-300) 25%, var(--color-surface-400) 50%, var(--color-surface-300) 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s ease-in-out infinite",
            }}
          />
        </li>
      ))}
    </ul>
  );
}
