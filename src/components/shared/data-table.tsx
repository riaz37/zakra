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
      <div className="hidden overflow-hidden rounded-lg border border-border bg-background md:block">
        <table className="w-full border-collapse">
          {caption ? <caption className="sr-only">{caption}</caption> : null}

          <thead>
            {headerGroups.map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-border bg-surface-200/50"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className="px-4 py-3 text-left align-middle font-sans text-[11px] font-medium uppercase tracking-[0.048px] text-muted"
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
                  className="px-4 py-12 text-center font-serif text-[17px] text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-border last:border-b-0",
                    "transition-colors hover:bg-surface-300",
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 align-middle font-sans text-button text-foreground"
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
          <div
            className="rounded-lg border border-border bg-background px-4 py-10 text-center font-serif text-[17px] text-muted"
            role="status"
          >
            {emptyMessage}
          </div>
        ) : (
          <ul className="space-y-2">
            {rows.map((row) => (
              <li
                key={row.id}
                className="rounded-lg border border-border bg-background p-3"
              >
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
                  {row.getVisibleCells().map((cell) => {
                    const label = columnLabels.get(cell.column.id);
                    return (
                      <div key={cell.id} className="contents">
                        <dt className="font-sans text-[11px] font-medium uppercase tracking-[0.048px] text-muted">
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
              className="rounded bg-surface-400 px-3 py-1.5 font-sans text-button text-foreground font-feat-tnum"
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
        "inline-flex items-center gap-1 rounded border border-border bg-surface-300 px-3 py-1.5",
        "font-sans text-button text-foreground transition-colors",
        "hover:bg-surface-400",
        "focus-visible:border-border-medium focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface-300",
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
              <div className="h-5 animate-pulse rounded bg-surface-300" />
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
          className="rounded-lg border border-border bg-background p-3"
        >
          <div className="h-10 animate-pulse rounded bg-surface-300" />
        </li>
      ))}
    </ul>
  );
}
