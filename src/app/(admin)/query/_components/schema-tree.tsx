"use client";

import { useState, useMemo } from "react";
import {
  ChevronRight,
  Hash,
  KeyRound,
  Link2,
  Search,
  Table as TableIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TableSchema } from "@/types";

interface SchemaTreeProps {
  tables: TableSchema[] | undefined;
  loading: boolean;
}

export function SchemaTree({ tables, loading }: SchemaTreeProps) {
  const [query, setQuery] = useState("");
  const [openTables, setOpenTables] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    if (!tables) return [];
    if (!query.trim()) return tables;
    const q = query.toLowerCase();
    return tables.filter((t) => {
      if (
        t.table_name.toLowerCase().includes(q) ||
        t.schema_name.toLowerCase().includes(q)
      )
        return true;
      return t.columns?.some((c) => c.name.toLowerCase().includes(q));
    });
  }, [tables, query]);

  return (
    <div className="flex min-h-0 flex-col">
      <div className="p-3 border-b border-[var(--border)]">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[var(--fg-subtle)]"
            strokeWidth={1.75}
          />
          <Input
            className="pl-8 text-[13px]"
            placeholder="Find tables or columns…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="min-h-0 grow">
        <div className="px-1 py-2">
          {loading ? (
            <div className="flex flex-col gap-1 px-3 py-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className="skel h-6 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-[12px] text-[var(--fg-subtle)]">
              {tables && tables.length === 0
                ? "No schema learned yet for this connection."
                : "No tables match your search."}
            </div>
          ) : (
            <ul>
              {filtered.map((table) => {
                const key = `${table.schema_name}.${table.table_name}`;
                const isOpen = !!openTables[key];
                return (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => setOpenTables((o) => ({ ...o, [key]: !o[key] }))}
                      className="flex w-full items-center gap-1.5 rounded-[6px] px-2 py-1.5 text-left transition-colors hover:bg-[var(--surface-muted)]"
                    >
                      <ChevronRight
                        className={`size-3 shrink-0 text-[var(--fg-subtle)] transition-transform ${
                          isOpen ? "rotate-90" : ""
                        }`}
                        strokeWidth={2}
                      />
                      <TableIcon
                        className="size-3.5 shrink-0 text-[var(--fg-muted)]"
                        strokeWidth={1.75}
                      />
                      <span className="grow truncate font-mono text-[12px]">
                        <span className="text-[var(--fg-subtle)]">
                          {table.schema_name}.
                        </span>
                        {table.table_name}
                      </span>
                      <span className="shrink-0 font-mono text-[10px] text-[var(--fg-subtle)]">
                        {table.columns?.length ?? 0}
                      </span>
                    </button>
                    {isOpen && table.columns?.length > 0 && (
                      <ul className="mb-1 ml-5 border-l border-[var(--border)] pl-2">
                        {table.columns.map((col) => (
                          <li
                            key={col.name}
                            className="flex items-center gap-1.5 py-0.5 pl-1.5 font-mono text-[11px]"
                          >
                            {col.is_primary_key ? (
                              <KeyRound
                                className="size-2.5 shrink-0 text-[var(--primary)]"
                                strokeWidth={2}
                              />
                            ) : col.is_foreign_key ? (
                              <Link2
                                className="size-2.5 shrink-0 text-[var(--info)]"
                                strokeWidth={2}
                              />
                            ) : (
                              <Hash
                                className="size-2.5 shrink-0 text-[var(--fg-subtle)]"
                                strokeWidth={2}
                              />
                            )}
                            <span className="grow truncate">{col.name}</span>
                            <span className="shrink-0 text-[var(--fg-subtle)]">
                              {col.data_type}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
