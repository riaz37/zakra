"use client";

import { useState } from "react";
import { Download, Eye, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useReportGenerations } from "@/hooks/useReportGenerations";
import { useReportDownload } from "@/hooks/useReportDownload";
import { formatDateTime } from "@/utils/formatters";
import type { GeneratedReport, ReportGenerationStatus } from "@/types";
import { HistoryDetail } from "./history-detail";

interface HistoryTableProps {
  companyId: string | undefined;
}

const PAGE_SIZE = 20;

export function HistoryTable({ companyId }: HistoryTableProps) {
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<GeneratedReport | null>(null);
  const download = useReportDownload();

  const { data, isLoading } = useReportGenerations(
    companyId,
    page * PAGE_SIZE,
    PAGE_SIZE,
  );

  const generations = data?.generations ?? [];
  const total = data?.total ?? 0;

  const handleDownload = (r: GeneratedReport) => {
    download.download(
      r.id,
      companyId,
      `${r.title || "report"}.pdf`.replace(/\s+/g, "-"),
    );
  };

  return (
    <>
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-token-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                <Th>Title</Th>
                <Th>Status</Th>
                <Th>Started</Th>
                <Th>Duration</Th>
                <Th className="w-[120px] text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr
                    key={i}
                    className="border-b border-[var(--border)] last:border-b-0"
                  >
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <span className="skel h-3 w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : generations.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-16 text-center text-[13px] text-[var(--fg-subtle)]"
                  >
                    No reports yet. Generate one from the Generate tab.
                  </td>
                </tr>
              ) : (
                generations.map((r) => (
                  <tr
                    key={r.id}
                    className="cursor-pointer border-b border-[var(--border)] transition-colors last:border-b-0 hover:bg-[var(--surface-muted)]"
                    onClick={() => setSelected(r)}
                  >
                    <td className="px-4 py-3">
                      <div className="text-[14px] font-medium text-[var(--fg)]">
                        {r.title || "Untitled report"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[var(--fg-muted)]">
                      {formatDateTime(r.started_at ?? r.created_at)}
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-[var(--fg-muted)] tabular-nums">
                      {formatDuration(r.duration_ms)}
                    </td>
                    <td
                      className="px-4 py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <button
                              type="button"
                              aria-label="Report actions"
                              className="inline-flex size-7 items-center justify-center rounded-md text-[var(--fg-subtle)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--fg)]"
                            />
                          }
                        >
                          <MoreHorizontal
                            className="size-4"
                            strokeWidth={1.75}
                          />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="min-w-[160px]"
                        >
                          <DropdownMenuItem onClick={() => setSelected(r)}>
                            <Eye className="size-3.5" strokeWidth={1.75} />
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={
                              !r.has_pdf || r.status !== "completed"
                            }
                            onClick={() => handleDownload(r)}
                          >
                            <Download className="size-3.5" strokeWidth={1.75} />
                            Download PDF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-3 text-[12px] text-[var(--fg-muted)]">
            <span>
              Showing {page * PAGE_SIZE + 1}–
              {Math.min((page + 1) * PAGE_SIZE, total)} of {total}
            </span>
            <div className="flex items-center gap-2">
              <PagerButton
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </PagerButton>
              <PagerButton
                disabled={(page + 1) * PAGE_SIZE >= total}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </PagerButton>
            </div>
          </div>
        )}
      </div>

      <HistoryDetail
        report={selected}
        companyId={companyId}
        onClose={() => setSelected(null)}
      />
    </>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`caption-upper h-10 px-4 text-left text-[11px] font-semibold text-[var(--fg-subtle)] ${className}`}
    >
      {children}
    </th>
  );
}

function StatusBadge({ status }: { status: ReportGenerationStatus }) {
  const map: Record<
    ReportGenerationStatus,
    { bg: string; fg: string; label: string }
  > = {
    completed: {
      bg: "bg-[var(--primary-soft)]",
      fg: "text-[var(--primary)]",
      label: "Completed",
    },
    running: {
      bg: "bg-[var(--info-soft)]",
      fg: "text-[var(--info)]",
      label: "Running",
    },
    pending: {
      bg: "bg-[var(--warning-soft)]",
      fg: "text-[var(--warning)]",
      label: "Pending",
    },
    failed: {
      bg: "bg-[var(--destructive-soft)]",
      fg: "text-[var(--destructive)]",
      label: "Failed",
    },
  };
  const s = map[status];
  return (
    <span
      className={`inline-flex h-[22px] items-center rounded-[var(--radius-badge)] px-2 text-[12px] font-medium ${s.bg} ${s.fg}`}
    >
      {s.label}
    </span>
  );
}

function formatDuration(ms: number | null): string {
  if (ms === null || ms === undefined) return "—";
  if (ms < 1000) return `${ms} ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)} s`;
  const m = Math.floor(s / 60);
  const rem = Math.round(s - m * 60);
  return `${m}m ${rem}s`;
}

function PagerButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-7 items-center rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 text-[12px] font-medium text-[var(--fg)] transition-colors hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
