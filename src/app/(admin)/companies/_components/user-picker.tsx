"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/hooks/useDebounce";
import { useUsers } from "@/hooks/useUsers";
import { cn } from "@/lib/utils";
import { displayName, initialsFor } from "@/utils/user-display";
import type { User } from "@/types/user";

interface UserPickerProps {
  selected: User | null;
  onSelect: (user: User | null) => void;
  excludeIds: Set<string>;
}

export function UserPicker({ selected, onSelect, excludeIds }: UserPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 250);

  const search = debouncedQuery.trim();
  const users = useUsers({
    page: 1,
    page_size: 50,
    ...(search ? { search } : {}),
  });

  const candidates = useMemo(() => {
    const items = users.data?.items ?? [];
    return items.filter((u) => !excludeIds.has(u.id));
  }, [users.data, excludeIds]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label="Select user"
            className={cn(
              "flex h-9 w-full items-center justify-between gap-2 rounded-[var(--radius-input)]",
              "border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-left text-[14px] text-[var(--fg)]",
              "outline-none transition-colors placeholder:text-[var(--fg-subtle)]",
              "hover:border-[var(--fg-subtle)]",
              "focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--ring)]",
            )}
          >
            {selected ? (
              <span className="flex min-w-0 items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] font-display text-[10px] font-semibold text-[var(--primary)]"
                >
                  {initialsFor(selected)}
                </span>
                <span className="min-w-0 truncate text-[14px] text-[var(--fg)]">
                  {displayName(selected)}{" "}
                  <span className="font-mono text-[12px] text-[var(--fg-muted)]">
                    &lt;{selected.email}&gt;
                  </span>
                </span>
              </span>
            ) : (
              <span className="text-[var(--fg-subtle)]">Select user…</span>
            )}
            <ChevronDown
              className="size-4 shrink-0 text-[var(--fg-subtle)]"
              strokeWidth={1.75}
            />
          </button>
        }
      />
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[var(--anchor-width,20rem)] min-w-[320px] max-w-[480px] p-0"
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search by email or name…"
          />
          <CommandList>
            {users.isPending ? (
              <div className="flex items-center gap-2 px-3 py-4 text-[13px] text-[var(--fg-subtle)]">
                <Loader2 className="size-3.5 animate-spin" strokeWidth={1.75} />
                Loading…
              </div>
            ) : candidates.length === 0 ? (
              <CommandEmpty className="py-6 text-[13px] text-[var(--fg-subtle)]">
                No users found.
              </CommandEmpty>
            ) : (
              candidates.map((u) => (
                <CommandItem
                  key={u.id}
                  value={`${u.email} ${u.first_name ?? ""} ${u.last_name ?? ""} ${u.id}`}
                  onSelect={() => {
                    onSelect(u);
                    setOpen(false);
                  }}
                  className="gap-2.5"
                >
                  <span
                    aria-hidden="true"
                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] font-display text-[11px] font-semibold text-[var(--primary)]"
                  >
                    {initialsFor(u)}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-[13px] font-medium text-[var(--fg)]">
                      {displayName(u)}
                    </span>
                    <span className="truncate font-mono text-[11px] text-[var(--fg-muted)]">
                      {u.email}
                    </span>
                  </span>
                </CommandItem>
              ))
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
