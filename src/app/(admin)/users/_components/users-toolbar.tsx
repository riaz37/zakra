"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface UsersToolbarProps {
  searchRaw: string;
  onSearchChange: (value: string) => void;
  page: number;
  totalPages: number;
  isFetching: boolean;
  isLoading: boolean;
}

export function UsersToolbar({
  searchRaw,
  onSearchChange,
  page,
  totalPages,
  isFetching,
  isLoading,
}: UsersToolbarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[260px] max-w-[420px]">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--fg-subtle)]"
          strokeWidth={1.75}
        />
        <Input
          placeholder="Search by email…"
          value={searchRaw}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 pl-9 rounded-[var(--radius-input)] border-[var(--border-strong)] bg-[var(--surface)]"
        />
        {searchRaw && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--fg-subtle)] hover:bg-[var(--surface-muted)] hover:text-[var(--fg)]"
            aria-label="Clear search"
          >
            <X className="size-3.5" strokeWidth={1.75} />
          </button>
        )}
      </div>
      <span className="caption-upper">
        {isFetching && !isLoading
          ? "Updating…"
          : `Page ${page} of ${Math.max(totalPages, 1)}`}
      </span>
    </div>
  );
}
