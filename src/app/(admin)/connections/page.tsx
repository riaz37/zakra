"use client";

import { useMemo, useState } from "react";
import { Plus, Database } from "lucide-react";
import { toast } from "sonner";
import {
  useDbConnections,
  useDeleteConnection,
  useSetDefaultConnection,
  useTestConnection,
} from "@/hooks/useDbConnections";
import { learnSchema } from "@/api/db-connections";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentCompanyId } from "@/hooks/useCurrentCompany";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { ConnectionWizard } from "./_components/connection-wizard";
import { ConnectionCard } from "./_components/connection-card";
import { ConnectionDrawer } from "./_components/connection-drawer";
import type { DatabaseConnection } from "@/types";

export default function ConnectionsPage() {
  const companyId = useCurrentCompanyId();
  const { data, isLoading, isError } = useDbConnections({
    company_id: companyId,
    page: 1,
    page_size: 60,
  });

  const [wizardOpen, setWizardOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const testConnection = useTestConnection(companyId);
  const setDefault = useSetDefaultConnection(companyId);
  const deleteConnection = useDeleteConnection(companyId);
  const queryClient = useQueryClient();

  const detailConnection = useMemo<DatabaseConnection | null>(() => {
    if (!detailId || !data) return null;
    return data.items.find((c) => c.id === detailId) ?? null;
  }, [data, detailId]);

  const handleTest = async (c: DatabaseConnection) => {
    setTestingId(c.id);
    try {
      const result = await testConnection.mutateAsync(c.id);
      if (result.success) {
        toast.success(`${c.name} reachable`, {
          description: result.latency_ms ? `${result.latency_ms}ms` : result.message,
        });
      } else {
        toast.error(`${c.name} failed`, { description: result.message });
      }
    } catch (err) {
      toast.error("Test failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setTestingId(null);
    }
  };

  const handleSetDefault = async (c: DatabaseConnection) => {
    try {
      await setDefault.mutateAsync(c.id);
      toast.success(`${c.name} set as default`);
    } catch (err) {
      toast.error("Could not update default", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const handleLearnSchema = async (c: DatabaseConnection) => {
    try {
      await learnSchema(c.id);
      await queryClient.invalidateQueries({ queryKey: ["db-connections", c.id] });
      toast.info(`Indexing ${c.name}`, {
        description: "Open the connection to view progress.",
      });
      setDetailId(c.id);
    } catch (err) {
      toast.error("Could not start schema learning", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const handleDelete = async (c: DatabaseConnection) => {
    const ok = window.confirm(`Delete connection "${c.name}"? This cannot be undone.`);
    if (!ok) return;
    try {
      await deleteConnection.mutateAsync(c.id);
      toast.success(`${c.name} deleted`);
    } catch (err) {
      toast.error("Could not delete", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const conns = data?.items ?? [];
  const liveCount = conns.filter((c) => c.is_active && !c.last_error).length;
  const failedCount = conns.filter((c) => c.last_error).length;

  return (
    <div className="mx-auto max-w-[1440px]">
      <PageHeader
        title="DB Connections"
        subtitle={
          isLoading
            ? "Loading connections…"
            : conns.length === 0
              ? "Connect a database to run queries and generate reports."
              : `${liveCount} live · ${failedCount} failed · ${conns.length} total`
        }
        actions={
          <Button onClick={() => setWizardOpen(true)}>
            <Plus className="size-3.5" strokeWidth={1.75} />
            New connection
          </Button>
        }
      />

      {isLoading ? (
        <SkeletonGrid />
      ) : isError ? (
        <ErrorState />
      ) : conns.length === 0 ? (
        <EmptyState onCreate={() => setWizardOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {conns.map((c) => (
            <ConnectionCard
              key={c.id}
              connection={c}
              onOpen={() => setDetailId(c.id)}
              onTest={() => void handleTest(c)}
              testing={testingId === c.id}
              onSetDefault={() => void handleSetDefault(c)}
              onLearnSchema={() => void handleLearnSchema(c)}
              onDelete={() => void handleDelete(c)}
            />
          ))}
        </div>
      )}

      <ConnectionWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        companyId={companyId}
      />

      <ConnectionDrawer
        connection={detailConnection}
        open={!!detailConnection}
        onOpenChange={(next) => {
          if (!next) setDetailId(null);
        }}
      />
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5"
        >
          <div className="flex items-center gap-3">
            <span className="skel size-10 rounded-[10px]" />
            <div className="grow">
              <span className="skel h-3 w-2/3" />
              <span className="skel mt-2 h-2.5 w-1/2" />
            </div>
          </div>
          <span className="skel h-8 w-full" />
          <span className="skel h-6 w-full" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-8 py-20 text-center">
      <span className="mb-4 inline-flex size-14 items-center justify-center rounded-[14px] bg-[var(--primary-soft)] text-[var(--primary)]">
        <Database className="size-6" strokeWidth={1.75} />
      </span>
      <h2 className="font-display text-[20px] font-semibold leading-[26px] -tracking-[0.01em]">
        No connections yet
      </h2>
      <p className="mt-2 max-w-[420px] text-[14px] text-[var(--fg-muted)]">
        Connect a PostgreSQL, SQL Server, or MongoDB database to let your team query it in
        natural language and build reports.
      </p>
      <Button className="mt-6" onClick={onCreate}>
        <Plus className="size-3.5" strokeWidth={1.75} />
        Add your first connection
      </Button>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--destructive-soft)] bg-[var(--destructive-soft)]/40 p-6 text-[13px] text-[var(--destructive)]">
      Could not load connections. Refresh the page or contact support if this persists.
    </div>
  );
}
