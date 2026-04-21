"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";
import {
  useResumeAiSync,
  useUnlearnTables,
} from "@/hooks/useDbConnections";
import type {
  DatabaseConnection,
  SchemaLearningProgress,
  TableSchema,
} from "@/types";
import {
  AlertTriangle,
  Eraser,
  Loader2,
  RotateCw,
  Search,
  Table as TableIcon,
} from "lucide-react";

interface DangerZoneProps {
  connection: DatabaseConnection;
  progress: SchemaLearningProgress | undefined;
  schemaTables: TableSchema[] | undefined;
}

export function DangerZone({ connection, progress, schemaTables }: DangerZoneProps) {
  const connectionId = connection.id;
  const companyId = connection.company_id;

  const resumeMut = useResumeAiSync(connectionId);
  const unlearnMut = useUnlearnTables(connectionId, companyId);
  const queryClient = useQueryClient();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const aiSync = progress?.ai_sync;
  const showResume = Boolean(aiSync && (aiSync.status === "failed" || aiSync.pending > 0));

  const sortedTables = useMemo(() => {
    if (!schemaTables) return [];
    const q = search.trim().toLowerCase();
    const base = [...schemaTables].sort((a, b) =>
      `${a.schema_name}.${a.table_name}`.localeCompare(`${b.schema_name}.${b.table_name}`),
    );
    return q ? base.filter((t) =>
      `${t.schema_name}.${t.table_name}`.toLowerCase().includes(q),
    ) : base;
  }, [schemaTables, search]);

  const toggleOne = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === sortedTables.length && sortedTables.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(sortedTables.map((t) => `${t.schema_name}.${t.table_name}`)));
    }
  };

  const handleResume = async () => {
    try {
      const result = await resumeMut.mutateAsync();
      toast.success("AI sync resumed", {
        description:
          typeof result.pending === "number"
            ? `${result.pending} tables queued`
            : result.status,
      });
    } catch (err) {
      toast.error("Could not resume AI sync", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const handleUnlearn = async () => {
    const names = Array.from(selected);
    if (names.length === 0) return;
    try {
      const result = await unlearnMut.mutateAsync(names);
      toast.success("Tables unlearned", {
        description: `${result.deleted} entr${result.deleted === 1 ? "y" : "ies"} removed`,
      });
      setSelected(new Set());
      setConfirmOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["db-connections", connectionId, "schema"] }),
        queryClient.invalidateQueries({ queryKey: ["db-connections", connectionId, "progress"] }),
      ]);
    } catch (err) {
      toast.error("Could not unlearn tables", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const allVisibleSelected =
    sortedTables.length > 0 && selected.size === sortedTables.length;

  return (
    <div className="flex flex-col gap-5 px-6 py-5">
      {showResume && aiSync && (
        <section className="rounded-[var(--radius-card)] border border-[var(--warning)]/30 bg-[var(--warning-soft)]/60 p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex size-8 items-center justify-center rounded-[8px] bg-[var(--surface)] text-[var(--warning)]">
              <AlertTriangle className="size-4" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 grow">
              <h4 className="text-[13px] font-semibold text-[var(--fg)]">
                AI sync needs attention
              </h4>
              <p className="mt-0.5 text-[12px] leading-[18px] text-[var(--fg-muted)]">
                <span className="font-mono">{aiSync.pending}</span> pending ·{" "}
                <span className="font-mono">{aiSync.failed}</span> failed ·{" "}
                <span className="font-mono">{aiSync.completed}</span> completed. Resuming
                will re-queue the AI enrichment step without re-extracting the raw schema.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleResume}
                disabled={resumeMut.isPending}
                className="mt-3"
              >
                {resumeMut.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" strokeWidth={1.75} />
                ) : (
                  <RotateCw className="size-3.5" strokeWidth={1.75} />
                )}
                Resume AI sync
              </Button>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-[var(--radius-card)] border border-[var(--destructive)]/25 bg-[var(--surface)] p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex size-8 items-center justify-center rounded-[8px] bg-[var(--destructive-soft)] text-[var(--destructive)]">
            <Eraser className="size-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 grow">
            <h4 className="text-[13px] font-semibold text-[var(--fg)]">Unlearn tables</h4>
            <p className="mt-0.5 text-[12px] leading-[18px] text-[var(--fg-muted)]">
              Remove indexed schema for specific tables. The assistant will stop referencing
              them until you run Learn schema again.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-[var(--fg-subtle)]"
              strokeWidth={1.75}
            />
            <Input
              placeholder="Filter tables"
              className="pl-8 font-mono"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {sortedTables.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[var(--radius-input)] border border-dashed border-[var(--border)] px-4 py-10 text-center">
              <TableIcon
                className="mb-2 size-5 text-[var(--fg-subtle)]"
                strokeWidth={1.75}
              />
              <p className="text-[12px] text-[var(--fg-subtle)]">
                {schemaTables && schemaTables.length > 0
                  ? "No tables match your filter."
                  : "No learned tables yet. Run Learn schema first."}
              </p>
            </div>
          ) : (
            <>
              <label className="flex cursor-pointer items-center gap-2 px-2 pb-1 text-[12px] text-[var(--fg-muted)]">
                <Checkbox
                  checked={allVisibleSelected}
                  onCheckedChange={toggleAll}
                />
                <span>
                  Select all{" "}
                  <span className="font-mono text-[var(--fg-subtle)]">
                    ({sortedTables.length})
                  </span>
                </span>
              </label>
              <ul className="max-h-[320px] divide-y divide-[var(--border)] overflow-y-auto rounded-[var(--radius-input)] border border-[var(--border)]">
                {sortedTables.map((t) => {
                  const key = `${t.schema_name}.${t.table_name}`;
                  const checked = selected.has(key);
                  return (
                    <li key={key}>
                      <label className="flex cursor-pointer items-center gap-2.5 px-3 py-2 transition-colors hover:bg-[var(--surface-muted)]/60">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleOne(key)}
                        />
                        <TableIcon
                          className="size-3.5 shrink-0 text-[var(--fg-muted)]"
                          strokeWidth={1.75}
                        />
                        <span className="grow truncate font-mono text-[12px]">
                          <span className="text-[var(--fg-subtle)]">{t.schema_name}.</span>
                          {t.table_name}
                        </span>
                        <span className="shrink-0 font-mono text-[11px] text-[var(--fg-subtle)]">
                          {t.columns?.length ?? 0} cols
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          <div className="flex items-center justify-between gap-2">
            <span className="text-[12px] text-[var(--fg-subtle)]">
              {selected.size > 0
                ? `${selected.size} selected`
                : "Pick tables to unlearn."}
            </span>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setConfirmOpen(true)}
              disabled={selected.size === 0 || unlearnMut.isPending}
            >
              {unlearnMut.isPending && (
                <Loader2 className="size-3.5 animate-spin" strokeWidth={1.75} />
              )}
              Unlearn {selected.size > 0 ? selected.size : ""} table
              {selected.size === 1 ? "" : "s"}
            </Button>
          </div>
        </div>
      </section>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlearn {selected.size} table{selected.size === 1 ? "" : "s"}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes learned schema for {selected.size} table
              {selected.size === 1 ? "" : "s"}. Run &ldquo;Learn schema&rdquo; again to
              re-index. Stored business rules are unaffected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleUnlearn}
              disabled={unlearnMut.isPending}
            >
              {unlearnMut.isPending && (
                <Loader2 className="size-3.5 animate-spin" strokeWidth={1.75} />
              )}
              Unlearn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
