"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusDot } from "@/components/admin/status-dot";
import {
  useConnectionSchema,
  useLearnSchema,
  useSchemaProgress,
} from "@/hooks/useDbConnections";
import { BusinessRulesPanel } from "./business-rules";
import { DangerZone } from "./danger-zone";
import {
  ChevronRight,
  Database,
  KeyRound,
  Link2,
  Loader2,
  Table as TableIcon,
  Waypoints,
} from "lucide-react";
import { toast } from "sonner";
import type { ColumnSchema, DatabaseConnection, TableSchema } from "@/types";

interface ConnectionDrawerProps {
  connection: DatabaseConnection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConnectionDrawer({
  connection,
  open,
  onOpenChange,
}: ConnectionDrawerProps) {
  const id = connection?.id;
  const [learning, setLearning] = useState(false);
  const schemaQuery = useConnectionSchema(id);
  const learn = useLearnSchema(id ?? "");
  const progress = useSchemaProgress(id, learning);

  useEffect(() => {
    if (!progress.data) return;
    const status = progress.data.ai_sync?.status;
    const basicStatus = progress.data.basic_extraction?.status;
    if (
      learning &&
      (status === "completed" || status === "failed") &&
      (basicStatus === "completed" || basicStatus === "failed")
    ) {
      setLearning(false);
      if (status === "failed" || basicStatus === "failed") {
        toast.error("Schema learning failed", {
          description: progress.data.error,
        });
      } else {
        toast.success("Schema learned", {
          description: `${progress.data.total_tables ?? 0} tables indexed`,
        });
      }
      void schemaQuery.refetch();
    }
  }, [learning, progress.data, schemaQuery]);

  const startLearn = async () => {
    if (!id) return;
    try {
      await learn.mutateAsync(undefined);
      setLearning(true);
      toast.info("Schema learning started", {
        description: "Indexing tables in the background.",
      });
    } catch (err) {
      toast.error("Could not start schema learning", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const sortedTables = useMemo(() => {
    if (!schemaQuery.data) return [];
    return [...schemaQuery.data].sort((a, b) => {
      const aKey = `${a.schema_name}.${a.table_name}`;
      const bKey = `${b.schema_name}.${b.table_name}`;
      return aKey.localeCompare(bKey);
    });
  }, [schemaQuery.data]);

  if (!connection) return null;

  const status =
    connection.last_error
      ? "failed"
      : connection.is_active
        ? "live"
        : "idle";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 bg-[var(--surface)] p-0 sm:max-w-[560px]"
      >
        <header className="border-b border-[var(--border)] px-6 pt-6 pb-5">
          <div className="flex items-start gap-3">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--primary-soft)] text-[var(--primary)]">
              <Database className="size-[20px]" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 grow">
              <SheetTitle className="font-display text-[20px] font-semibold leading-[26px] -tracking-[0.01em]">
                {connection.name}
              </SheetTitle>
              <SheetDescription className="mt-0.5 truncate font-mono text-[12px] text-[var(--fg-subtle)]">
                {connection.host}:{connection.port} / {connection.database_name}
              </SheetDescription>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-[13px]">
            <MetaField label="Status">
              <div className="flex items-center gap-1.5">
                <StatusDot status={status} />
                <span className="capitalize">{status === "live" ? "Live" : status}</span>
              </div>
            </MetaField>
            <MetaField label="Engine">
              <span className="font-mono text-[var(--fg-muted)]">
                {connection.database_type}
              </span>
            </MetaField>
            <MetaField label="Username">
              <span className="font-mono text-[var(--fg-muted)]">
                {connection.username}
              </span>
            </MetaField>
            <MetaField label="SSL">
              <span>{connection.ssl_enabled ? "Required" : "Optional"}</span>
            </MetaField>
          </div>
        </header>

        <Tabs defaultValue="schema" className="flex min-h-0 grow flex-col gap-0">
          <TabsList className="h-auto shrink-0 justify-start rounded-none border-b border-[var(--border)] bg-[var(--surface)] px-6 py-0">
            <TabsTrigger
              value="schema"
              className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-0 mr-6 text-[13px] font-medium text-[var(--fg-muted)] shadow-none data-[state=active]:border-[var(--primary)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--fg)] data-[state=active]:shadow-none"
            >
              Schema
            </TabsTrigger>
            <TabsTrigger
              value="rules"
              className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-0 mr-6 text-[13px] font-medium text-[var(--fg-muted)] shadow-none data-[state=active]:border-[var(--primary)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--fg)] data-[state=active]:shadow-none"
            >
              Business Rules
            </TabsTrigger>
            <TabsTrigger
              value="danger"
              className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-0 text-[13px] font-medium text-[var(--fg-muted)] shadow-none data-[state=active]:border-[var(--destructive)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--destructive)] data-[state=active]:shadow-none"
            >
              Danger Zone
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schema" className="flex min-h-0 grow flex-col gap-0 data-[state=inactive]:hidden">
            <div className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--surface-muted)]/40 px-6 py-3">
              <div className="grow">
                <div className="caption-upper text-[var(--fg-subtle)]">Schema</div>
                <div className="mt-1 text-[13px] text-[var(--fg-muted)]">
                  {connection.schema_learned
                    ? `${schemaQuery.data?.length ?? 0} tables indexed${
                        connection.schema_learned_at
                          ? " · " + new Date(connection.schema_learned_at).toLocaleDateString()
                          : ""
                      }`
                    : "Not yet learned"}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={startLearn}
                disabled={learning || learn.isPending}
              >
                {learning || learn.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" strokeWidth={1.75} />
                ) : (
                  <Waypoints className="size-3.5" strokeWidth={1.75} />
                )}
                {connection.schema_learned ? "Re-learn" : "Learn schema"}
              </Button>
            </div>

            {learning && progress.data && (
              <LearnProgressBar progress={progress.data.progress_percent ?? 0} label={
                progress.data.current_table
                  ? `Indexing ${progress.data.current_table}`
                  : progress.data.phase === "ai_sync"
                    ? "Running AI sync"
                    : "Extracting basic schema"
              } />
            )}

            <ScrollArea className="min-h-0 grow">
              <div className="p-6">
                {schemaQuery.isLoading ? (
                  <div className="flex flex-col gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <span key={i} className="skel h-8 w-full" />
                    ))}
                  </div>
                ) : sortedTables.length === 0 ? (
                  <EmptySchema learned={connection.schema_learned} />
                ) : (
                  <ul className="divide-y divide-[var(--border)]">
                    {sortedTables.map((t) => (
                      <TableRow key={`${t.schema_name}.${t.table_name}`} table={t} />
                    ))}
                  </ul>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="rules" className="min-h-0 grow data-[state=inactive]:hidden">
            <ScrollArea className="h-full">
              <BusinessRulesPanel connectionId={connection.id} companyId={connection.company_id} />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="danger" className="min-h-0 grow data-[state=inactive]:hidden">
            <ScrollArea className="h-full">
              <DangerZone
                connection={connection}
                progress={progress.data}
                schemaTables={schemaQuery.data}
              />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function MetaField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="caption-upper text-[var(--fg-subtle)]">{label}</div>
      <div className="mt-1 text-[13px]">{children}</div>
    </div>
  );
}

function LearnProgressBar({ progress, label }: { progress: number; label: string }) {
  return (
    <div className="border-b border-[var(--border)] px-6 py-3">
      <div className="flex items-center gap-2 text-[12px] text-[var(--fg-muted)]">
        <Loader2 className="size-3 animate-spin text-[var(--primary)]" strokeWidth={2} />
        <span className="grow truncate">{label}</span>
        <span className="font-mono text-[var(--primary)]">{Math.round(progress)}%</span>
      </div>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]">
        <div
          className="h-full rounded-full bg-[var(--primary)] transition-[width] duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}

function EmptySchema({ learned }: { learned: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="mb-3 inline-flex size-10 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--fg-subtle)]">
        <TableIcon className="size-5" strokeWidth={1.75} />
      </span>
      <h4 className="font-display text-[14px] font-semibold">
        {learned ? "No tables indexed" : "Schema not learned yet"}
      </h4>
      <p className="mt-1 max-w-[300px] text-[12px] text-[var(--fg-subtle)]">
        {learned
          ? "This connection has no learned tables. Run a re-learn to discover schema."
          : "Run schema learning to unlock natural language queries against this connection."}
      </p>
    </div>
  );
}

function TableRow({ table }: { table: TableSchema }) {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 py-2.5 text-left transition-colors hover:bg-[var(--surface-muted)]/50"
      >
        <ChevronRight
          className={`size-3 shrink-0 text-[var(--fg-subtle)] transition-transform ${open ? "rotate-90" : ""}`}
          strokeWidth={2}
        />
        <TableIcon className="size-3.5 shrink-0 text-[var(--fg-muted)]" strokeWidth={1.75} />
        <span className="grow truncate font-mono text-[13px]">
          <span className="text-[var(--fg-subtle)]">{table.schema_name}.</span>
          {table.table_name}
        </span>
        <span className="shrink-0 font-mono text-[11px] text-[var(--fg-subtle)]">
          {table.columns?.length ?? 0} cols
        </span>
      </button>
      {open && table.columns?.length > 0 && (
        <ul className="mb-2 ml-5 border-l border-[var(--border)] pl-3">
          {table.columns.map((c) => (
            <ColumnRow key={c.name} column={c} />
          ))}
        </ul>
      )}
    </li>
  );
}

function ColumnRow({ column }: { column: ColumnSchema }) {
  return (
    <li className="flex items-center gap-2 py-1 font-mono text-[12px]">
      {column.is_primary_key ? (
        <KeyRound className="size-3 shrink-0 text-[var(--primary)]" strokeWidth={2} />
      ) : column.is_foreign_key ? (
        <Link2 className="size-3 shrink-0 text-[var(--info)]" strokeWidth={2} />
      ) : (
        <span className="size-3 shrink-0" />
      )}
      <span className="grow truncate">{column.name}</span>
      <span className="shrink-0 text-[var(--fg-subtle)]">{column.data_type}</span>
    </li>
  );
}
