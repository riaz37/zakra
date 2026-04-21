"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Database,
  Loader2,
  Play,
  Sparkle,
  Square,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusDot } from "@/components/admin/status-dot";
import {
  useConnectionSchema,
  useDbConnections,
} from "@/hooks/useDbConnections";
import { useCurrentCompanyId } from "@/hooks/useCurrentCompany";
import { useExecuteQuery } from "@/hooks/useDbQuery";
import { SchemaTree } from "./_components/schema-tree";
import { PipelinePanel } from "./_components/pipeline-panel";
import { ResultsTable } from "./_components/results-table";
import { highlightSql } from "./_components/sql-highlighter";

const SAMPLE_PROMPTS = [
  "Top 10 accounts by monthly recurring revenue this quarter",
  "Show users who signed up in the last 7 days with their company",
  "Count of failed logins by day for the past 30 days",
];

export default function QueryPage() {
  const companyId = useCurrentCompanyId();
  const connections = useDbConnections({
    company_id: companyId,
    page: 1,
    page_size: 50,
  });

  const activeConnections = useMemo(
    () => connections.data?.items.filter((c) => c.is_active) ?? [],
    [connections.data],
  );

  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");

  // Pick default connection once
  useEffect(() => {
    if (connectionId || activeConnections.length === 0) return;
    const def = activeConnections.find((c) => c.is_default) ?? activeConnections[0];
    setConnectionId(def.id);
  }, [activeConnections, connectionId]);

  const schema = useConnectionSchema(connectionId ?? undefined);

  const { execute, reset, pipeline, isLoading } = useExecuteQuery();

  const selectedConnection = useMemo(
    () => activeConnections.find((c) => c.id === connectionId) ?? null,
    [activeConnections, connectionId],
  );

  const run = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error("Describe what you want to query");
      return;
    }
    if (!connectionId) {
      toast.error("Select a connection first");
      return;
    }
    await execute(
      {
        query: prompt.trim(),
        connection_id: connectionId,
        include_explanation: true,
      },
      companyId,
    );
  }, [prompt, connectionId, companyId, execute]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        void run();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-var(--topbar-h)-4rem)] max-w-[1440px] flex-col gap-6">
      <PageHeader
        title="Query Runner"
        subtitle="Ask a question in plain English — we turn it into SQL, enforce your permissions, and run it."
        actions={
          <div className="flex items-center gap-2">
            {pipeline.status !== "idle" && (
              <Button variant="ghost" onClick={reset}>
                <Square className="size-3.5" strokeWidth={1.75} />
                Reset
              </Button>
            )}
            <Button onClick={() => void run()} disabled={isLoading || !connectionId}>
              {isLoading ? (
                <Loader2 className="size-3.5 animate-spin" strokeWidth={1.75} />
              ) : (
                <Play className="size-3.5" strokeWidth={1.75} />
              )}
              Run
              <span className="ml-1 rounded-[4px] bg-[var(--primary-fg)]/15 px-1.5 py-0.5 font-mono text-[10px] font-medium">
                {typeof navigator !== "undefined" && /Mac/.test(navigator.userAgent) ? "⌘↵" : "Ctrl ↵"}
              </span>
            </Button>
          </div>
        }
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
        {/* Left: connection + schema */}
        <aside className="flex min-h-[70vh] flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-token-sm">
          <div className="border-b border-[var(--border)] p-3">
            <div className="caption-upper mb-2">Connection</div>
            {connections.isLoading ? (
              <span className="skel h-8 w-full" />
            ) : activeConnections.length === 0 ? (
              <div className="flex items-center gap-2 text-[12px] text-[var(--fg-subtle)]">
                <AlertCircle className="size-3.5" strokeWidth={1.75} />
                No active connections
              </div>
            ) : (
              <Select
                value={connectionId ?? ""}
                onValueChange={(v) => {
                  if (typeof v === "string" && v) setConnectionId(v);
                }}
                items={activeConnections.reduce<Record<string, string>>(
                  (acc, c) => {
                    acc[c.id] = c.name;
                    return acc;
                  },
                  {},
                )}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select connection" />
                </SelectTrigger>
                <SelectContent>
                  {activeConnections.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <Database
                        className="size-3.5 text-[var(--primary)]"
                        strokeWidth={1.75}
                      />
                      <span className="font-mono text-[12px]">{c.name}</span>
                      <span className="ml-auto text-[10px] text-[var(--fg-subtle)]">
                        {c.database_type}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {selectedConnection && (
              <div className="mt-2 flex items-center gap-1.5 font-mono text-[11px] text-[var(--fg-subtle)]">
                <StatusDot
                  status={
                    selectedConnection.last_error
                      ? "failed"
                      : selectedConnection.schema_learned
                        ? "live"
                        : "idle"
                  }
                />
                {selectedConnection.schema_learned
                  ? "Schema learned"
                  : "Schema not learned"}
              </div>
            )}
          </div>

          <SchemaTree tables={schema.data} loading={schema.isFetching && !schema.data} />
        </aside>

        {/* Middle: prompt + SQL */}
        <section className="flex min-h-[70vh] flex-col gap-5">
          <div className="flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-token-sm">
            <header className="flex items-center gap-2 border-b border-[var(--border)] px-5 py-3">
              <Sparkle className="size-3.5 text-[var(--primary)]" strokeWidth={2} />
              <span className="caption-upper">Ask a question</span>
            </header>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Which accounts churned in the last 30 days and what was their total lifetime revenue?"
              className="min-h-[180px] rounded-none border-0 bg-transparent px-5 py-4 font-mono text-[14px] leading-[22px] focus-visible:ring-0"
            />
            <div className="flex flex-wrap items-center gap-1.5 border-t border-[var(--border)] bg-[var(--surface-muted)]/40 px-5 py-3">
              <span className="mr-1 text-[11px] text-[var(--fg-subtle)]">Try:</span>
              {SAMPLE_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrompt(p)}
                  className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[11px] text-[var(--fg-muted)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* SQL preview */}
          {pipeline.generatedSql && (
            <div className="flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-token-sm">
              <header className="flex items-center gap-2 border-b border-[var(--border)] px-5 py-3">
                <span className="caption-upper">Generated SQL</span>
                {pipeline.confidenceScore !== null && (
                  <span className="ml-auto font-mono text-[11px] text-[var(--primary)]">
                    confidence {Math.round(pipeline.confidenceScore * 100)}%
                  </span>
                )}
              </header>
              <pre
                className="overflow-auto bg-[var(--surface-muted)] px-5 py-4 font-mono text-[12.5px] leading-[20px]"
                dangerouslySetInnerHTML={{
                  __html: highlightSql(pipeline.generatedSql),
                }}
              />
            </div>
          )}

          {/* Results */}
          <div className="flex min-h-[260px] flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-token-sm">
            {pipeline.status === "idle" && !pipeline.queryResult ? (
              <IdleState />
            ) : pipeline.queryResult ? (
              <ResultsTable result={pipeline.queryResult} />
            ) : pipeline.status === "running" ? (
              <RunningState />
            ) : pipeline.status === "error" ? (
              <ErrorBlock
                code={pipeline.error?.code ?? "UNKNOWN"}
                message={pipeline.error?.message ?? "Query pipeline failed."}
                stepName={pipeline.error?.stepName}
              />
            ) : (
              <IdleState message="Query completed without a result set." />
            )}
          </div>
        </section>

        {/* Right: pipeline */}
        <aside className="flex min-h-[70vh] flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-token-sm">
          <PipelinePanel
            steps={pipeline.steps}
            confidenceScore={pipeline.confidenceScore}
            queryExplanation={pipeline.queryExplanation}
            durationMs={pipeline.durationMs}
            error={pipeline.error}
            totalRows={pipeline.queryResult?.row_count ?? null}
          />
        </aside>
      </div>
    </div>
  );
}

function IdleState({ message }: { message?: string }) {
  return (
    <div className="flex min-h-[260px] grow flex-col items-center justify-center p-10 text-center">
      <span className="mb-3 inline-flex size-10 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--fg-subtle)]">
        <Database className="size-5" strokeWidth={1.75} />
      </span>
      <div className="font-display text-[14px] font-semibold">
        {message ? "No rows" : "Run a query to see results"}
      </div>
      <p className="mt-1 max-w-[360px] text-[12px] text-[var(--fg-subtle)]">
        {message ??
          "Describe what you want in the box above. We'll generate the SQL, check permissions, and run it against your connected database."}
      </p>
    </div>
  );
}

function RunningState() {
  return (
    <div className="p-5">
      <div className="mb-3 flex items-center gap-2 text-[12px] text-[var(--fg-muted)]">
        <Loader2 className="size-3 animate-spin text-[var(--primary)]" strokeWidth={2} />
        Preparing your results…
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            {Array.from({ length: 5 }).map((_, j) => (
              <span
                key={j}
                className="skel h-4"
                style={{ width: `${80 + ((i * 13 + j * 17) % 80)}px` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorBlock({
  code,
  message,
  stepName,
}: {
  code: string;
  message: string;
  stepName?: string;
}) {
  return (
    <div className="p-5">
      <div className="rounded-[var(--radius-input)] border border-[var(--destructive-soft)] bg-[var(--destructive-soft)]/50 p-4">
        <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--destructive)]">
          <AlertCircle className="size-4" strokeWidth={1.75} />
          {stepName ? `${stepName} failed` : "Query pipeline failed"}
        </div>
        <p className="mt-1 text-[13px] text-[var(--fg-muted)]">{message}</p>
        <p className="mt-2 font-mono text-[11px] text-[var(--fg-subtle)]">{code}</p>
      </div>
    </div>
  );
}
