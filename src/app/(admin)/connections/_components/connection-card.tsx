"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusDot } from "@/components/admin/status-dot";
import {
  AlertCircle,
  Database,
  Loader2,
  MoreHorizontal,
  Star,
  Trash2,
  Waypoints,
  Zap,
} from "lucide-react";
import type { DatabaseConnection } from "@/types";

interface ConnectionCardProps {
  connection: DatabaseConnection;
  onOpen: () => void;
  onTest: () => void;
  testing: boolean;
  onSetDefault: () => void;
  onLearnSchema: () => void;
  onDelete: () => void;
}

function resolveStatus(c: DatabaseConnection): "live" | "idle" | "failed" {
  if (c.last_error) return "failed";
  if (!c.is_active) return "idle";
  return "live";
}

function formatRelative(iso: string | null): string {
  if (!iso) return "never";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString();
}

export function ConnectionCard({
  connection,
  onOpen,
  onTest,
  testing,
  onSetDefault,
  onLearnSchema,
  onDelete,
}: ConnectionCardProps) {
  const status = resolveStatus(connection);
  const statusColor =
    status === "failed"
      ? "text-[var(--destructive)]"
      : status === "idle"
        ? "text-[var(--warning)]"
        : "text-[var(--primary)]";

  return (
    <article
      className="group relative flex cursor-pointer flex-col rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-token-sm transition-all hover:border-[var(--primary)] hover:shadow-token-md"
      onClick={onOpen}
    >
      {/* Head */}
      <div className="flex items-start gap-3 p-5">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--primary-soft)] text-[var(--primary)]">
          <Database className="size-[20px]" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 grow">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-display text-[15px] font-semibold leading-[20px] -tracking-[0.01em]">
              {connection.name}
            </h3>
            {connection.is_default && (
              <Badge className="h-[20px] shrink-0 gap-1 bg-[var(--primary-soft)] px-1.5 text-[11px] font-medium text-[var(--primary)]">
                <Star className="size-2.5" strokeWidth={2} /> Default
              </Badge>
            )}
          </div>
          <div className="mt-0.5 truncate font-mono text-[12px] text-[var(--fg-subtle)]">
            {connection.host}:{connection.port} / {connection.database_name}
          </div>
        </div>

        <div onClick={(e) => e.stopPropagation()} className="shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Connection actions"
              className="inline-flex size-8 items-center justify-center rounded-[8px] text-[var(--fg-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--fg)]"
            >
              <MoreHorizontal className="size-[16px]" strokeWidth={1.75} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[180px]">
              <DropdownMenuItem onClick={onSetDefault}>
                <Star className="size-3.5" strokeWidth={1.75} />
                Set as default
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onLearnSchema}>
                <Waypoints className="size-3.5" strokeWidth={1.75} />
                Learn schema
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onDelete}>
                <Trash2 className="size-3.5" strokeWidth={1.75} />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Status strip */}
      <div className="mx-5 flex items-center gap-2.5 rounded-[8px] bg-[var(--surface-muted)] px-3 py-2">
        <StatusDot status={status} />
        <span className={`text-[12px] font-medium capitalize ${statusColor}`}>
          {status === "live" ? "Live" : status}
        </span>
        <span className="grow" />
        <span className="text-[11px] text-[var(--fg-subtle)]">
          {connection.last_connected_at
            ? `Tested ${formatRelative(connection.last_connected_at)}`
            : "Not yet tested"}
        </span>
      </div>

      {connection.last_error && (
        <div className="mx-5 mt-2 flex items-start gap-2 rounded-[8px] bg-[var(--destructive-soft)] px-3 py-2">
          <AlertCircle className="mt-0.5 size-3 shrink-0 text-[var(--destructive)]" strokeWidth={1.75} />
          <p className="text-[12px] leading-[16px] text-[var(--destructive)]">
            {connection.last_error}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] px-5 py-3">
        <div className="flex items-center gap-1.5 text-[12px]">
          <span className="text-[var(--fg-subtle)]">Engine</span>
          <span className="font-mono text-[var(--fg-muted)]">
            {connection.database_type}
          </span>
          {connection.schema_learned && (
            <Badge className="ml-2 h-[18px] bg-[var(--primary-soft)] px-1.5 text-[10px] text-[var(--primary)]">
              schema learned
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onTest();
          }}
          disabled={testing}
        >
          {testing ? (
            <Loader2 className="size-3.5 animate-spin" strokeWidth={1.75} />
          ) : (
            <Zap className="size-3.5" strokeWidth={1.75} />
          )}
          Test
        </Button>
      </div>
    </article>
  );
}
