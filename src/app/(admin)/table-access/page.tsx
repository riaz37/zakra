"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  Database,
  Plus,
  Search,
  Table as TableIcon,
} from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useManagedTables } from "@/hooks/useTableAccess";
import { useCurrentCompanyId } from "@/hooks/useCurrentCompany";
import { PermissionMatrix } from "./_components/permission-matrix";
import { RegisterTableDialog } from "./_components/register-table-dialog";

export default function TableAccessPage() {
  const companyId = useCurrentCompanyId();
  const tablesQuery = useManagedTables({
    company_id: companyId,
    page: 1,
    page_size: 100,
  });

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [registerOpen, setRegisterOpen] = useState(false);

  const managedTables = tablesQuery.data?.items ?? [];

  // Auto-select first table on load
  useEffect(() => {
    if (!selectedKey && managedTables.length > 0) {
      const first = managedTables[0];
      setSelectedKey(`${first.schema_name}.${first.table_name}`);
    }
  }, [managedTables, selectedKey]);

  const filtered = useMemo(() => {
    if (!search.trim()) return managedTables;
    const q = search.toLowerCase();
    return managedTables.filter((t) =>
      [t.table_name, t.schema_name, t.display_name]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q)),
    );
  }, [managedTables, search]);

  const selected = useMemo(() => {
    if (!selectedKey) return null;
    return managedTables.find(
      (t) => `${t.schema_name}.${t.table_name}` === selectedKey,
    );
  }, [managedTables, selectedKey]);

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col">
      <PageHeader
        title="Table Access"
        subtitle="Grant column-level permissions per user, with optional masking."
        actions={
          <Button variant="outline" onClick={() => setRegisterOpen(true)}>
            <Plus className="size-3.5" strokeWidth={1.75} />
            Register table
          </Button>
        }
      />

      {tablesQuery.isLoading ? (
        <LayoutSkeleton />
      ) : managedTables.length === 0 ? (
        <EmptyState onRegister={() => setRegisterOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
          {/* Left: tables list */}
          <aside className="flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-token-sm">
            <div className="border-b border-[var(--border)] p-3">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[var(--fg-subtle)]"
                  strokeWidth={1.75}
                />
                <Input
                  className="pl-8"
                  placeholder="Find a table…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <ScrollArea className="min-h-0 grow">
              <ul className="py-1.5">
                {filtered.map((table) => {
                  const key = `${table.schema_name}.${table.table_name}`;
                  const active = key === selectedKey;
                  return (
                    <li key={key}>
                      <button
                        type="button"
                        onClick={() => setSelectedKey(key)}
                        className={`group flex w-full items-center gap-2 px-3 py-2 text-left transition-colors ${
                          active
                            ? "bg-[var(--primary-soft)]"
                            : "hover:bg-[var(--surface-muted)]"
                        }`}
                      >
                        <TableIcon
                          className={`size-3.5 shrink-0 ${
                            active ? "text-[var(--primary)]" : "text-[var(--fg-muted)]"
                          }`}
                          strokeWidth={1.75}
                        />
                        <div className="min-w-0 grow">
                          <div
                            className={`truncate text-[13px] ${
                              active ? "font-medium text-[var(--primary)]" : ""
                            }`}
                          >
                            {table.display_name || table.table_name}
                          </div>
                          <div className="truncate font-mono text-[11px] text-[var(--fg-subtle)]">
                            {table.schema_name}.{table.table_name}
                          </div>
                        </div>
                        <span className="shrink-0 font-mono text-[10px] text-[var(--fg-subtle)]">
                          {table.columns?.length ?? 0}
                        </span>
                        {active && (
                          <ChevronRight
                            className="size-3 text-[var(--primary)]"
                            strokeWidth={2}
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
                {filtered.length === 0 && (
                  <li className="px-4 py-6 text-center text-[12px] text-[var(--fg-subtle)]">
                    No tables match “{search}”
                  </li>
                )}
              </ul>
            </ScrollArea>
          </aside>

          {/* Right: matrix */}
          <section className="flex min-h-[70vh] flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-token-sm">
            {selected ? (
              <PermissionMatrix
                key={`${selected.schema_name}.${selected.table_name}`}
                table={selected}
                companyId={companyId}
              />
            ) : (
              <div className="flex grow items-center justify-center p-10 text-center">
                <div>
                  <span className="mb-3 inline-flex size-10 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--fg-subtle)]">
                    <TableIcon className="size-5" strokeWidth={1.75} />
                  </span>
                  <div className="font-display text-[14px] font-semibold">
                    Select a table
                  </div>
                  <div className="mt-1 text-[13px] text-[var(--fg-muted)]">
                    Choose a table from the left to edit its permission matrix.
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      <RegisterTableDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        companyId={companyId}
        onRegistered={() => {
          void tablesQuery.refetch();
        }}
      />
    </div>
  );
}

function LayoutSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
      <div className="h-[500px] rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="skel mb-2 h-8 w-full" />
        ))}
      </div>
      <div className="h-[500px] rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <span className="skel h-10 w-1/3" />
        <div className="mt-6 flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="skel h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onRegister }: { onRegister: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-8 py-20 text-center">
      <span className="mb-4 inline-flex size-14 items-center justify-center rounded-[14px] bg-[var(--primary-soft)] text-[var(--primary)]">
        <Database className="size-6" strokeWidth={1.75} />
      </span>
      <h2 className="font-display text-[20px] font-semibold leading-[26px] -tracking-[0.01em]">
        No tables under management yet
      </h2>
      <p className="mt-2 max-w-[440px] text-[14px] text-[var(--fg-muted)]">
        Register a table from a connected database to start granting column-level read, masked, and
        write permissions per user.
      </p>
      <Button className="mt-6" onClick={onRegister}>
        <Plus className="size-3.5" strokeWidth={1.75} />
        Register a table
      </Button>
    </div>
  );
}

