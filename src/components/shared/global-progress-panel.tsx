'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';

import { useSchemaProgress } from '@/hooks/useDbConnections';
import {
  useBackgroundTasksStore,
  type ReportTask,
  type SchemaTask,
} from '@/store/backgroundTasksStore';
import { cn } from '@/lib/utils';

const MAX_VISIBLE = 3;
const AUTO_DISMISS_MS = 4000;

// ── GlobalProgressPanel ───────────────────────────────────────────────────────

export function GlobalProgressPanel() {
  const tasks = useBackgroundTasksStore((s) => s.tasks);
  const visible = tasks.slice(0, MAX_VISIBLE);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 right-6 z-50 flex w-72 flex-col gap-2"
    >
      <AnimatePresence initial={false}>
        {visible.map((task) => (
          <motion.div
            key={taskKey(task)}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto"
          >
            {task.type === 'schema_learning' ? (
              <SchemaTaskCard task={task} />
            ) : (
              <ReportTaskCard task={task} />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function taskKey(task: SchemaTask | ReportTask): string {
  return task.type === 'schema_learning'
    ? `schema:${task.connectionId}`
    : `report:${task.templateId}`;
}

// ── Schema task card ──────────────────────────────────────────────────────────

interface SchemaTaskCardProps {
  task: SchemaTask;
}

function SchemaTaskCard({ task }: SchemaTaskCardProps) {
  const router = useRouter();
  const completeSchemaTask = useBackgroundTasksStore(
    (s) => s.completeSchemaTask,
  );
  const failSchemaTask = useBackgroundTasksStore((s) => s.failSchemaTask);
  const dismissSchemaTask = useBackgroundTasksStore(
    (s) => s.dismissSchemaTask,
  );
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: progress } = useSchemaProgress(
    task.connectionId,
    task.status === 'running',
  );

  // Detect completion/failure from server progress
  useEffect(() => {
    if (!progress || task.status !== 'running') return;

    const basicDone = progress.basic_extraction.status === 'completed';
    const aiDone = progress.ai_sync.status === 'completed';
    const basicFailed = progress.basic_extraction.status === 'failed';
    const aiFailed = progress.ai_sync.status === 'failed';

    if (basicFailed || aiFailed) {
      failSchemaTask(task.connectionId);
    } else if (basicDone && aiDone) {
      completeSchemaTask(task.connectionId);
    }
  }, [
    progress,
    task.connectionId,
    task.status,
    completeSchemaTask,
    failSchemaTask,
  ]);

  // Auto-dismiss on completion
  useEffect(() => {
    if (task.status !== 'completed') return;
    dismissTimer.current = setTimeout(() => {
      dismissSchemaTask(task.connectionId);
    }, AUTO_DISMISS_MS);
    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [task.status, task.connectionId, dismissSchemaTask]);

  const isAiPhase = progress?.ai_sync.status === 'in_progress';
  const pct = isAiPhase
    ? progress?.ai_sync.progress_percent ?? 0
    : progress?.total_tables
      ? (progress.basic_extraction.tables_extracted / progress.total_tables) *
        100
      : progress?.progress_percent ?? 0;

  const isIndeterminate = task.status === 'running' && pct < 3;
  const stepLabel = isAiPhase ? 'Generating AI context' : 'Extracting schema';

  const detail =
    isAiPhase && progress?.total_tables
      ? `${progress.ai_sync.completed} of ${progress.total_tables} tables`
      : !isAiPhase &&
          progress?.total_tables &&
          progress.basic_extraction.tables_extracted > 0
        ? `${progress.basic_extraction.tables_extracted} of ${progress.total_tables} tables`
        : null;

  return (
    <div
      className={cn(
        'flex flex-col gap-2.5 rounded-xl border bg-surface-200 px-4 py-3.5 shadow-elevated',
        task.status === 'completed' && 'border-accent/25',
        task.status === 'failed' && 'border-error/25',
        task.status === 'running' && 'border-border',
      )}
    >
      <div className="flex items-center gap-2">
        {task.status === 'completed' ? (
          <Check
            aria-hidden
            size={13}
            strokeWidth={2.5}
            className="shrink-0 text-accent"
          />
        ) : task.status === 'failed' ? (
          <X
            aria-hidden
            size={13}
            strokeWidth={2.5}
            className="shrink-0 text-error"
          />
        ) : (
          <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
        )}

        <span
          className={cn(
            'flex-1 font-sans text-body font-medium',
            task.status === 'completed' && 'text-accent',
            task.status === 'failed' && 'text-error',
            task.status === 'running' && 'text-foreground',
          )}
        >
          {task.status === 'completed'
            ? 'Schema ready'
            : task.status === 'failed'
              ? 'Learning failed'
              : stepLabel}
        </span>

        <button
          type="button"
          onClick={() => dismissSchemaTask(task.connectionId)}
          aria-label="Dismiss"
          className="shrink-0 rounded p-0.5 text-fg-subtle transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <X aria-hidden size={13} strokeWidth={1.75} />
        </button>
      </div>

      <p className="-mt-1 truncate font-mono text-mono-sm text-fg-muted">
        {task.connectionName}
      </p>

      {task.status === 'running' && (
        <>
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-accent/12">
            {isIndeterminate ? (
              <div
                className="animate-shimmer absolute inset-0 rounded-full"
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, transparent 0%, rgba(62,207,142,0.5) 50%, transparent 100%)',
                  backgroundSize: '200% 100%',
                }}
              />
            ) : (
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
                style={{ width: `${Math.max(2, pct)}%` }}
                role="progressbar"
                aria-valuenow={Math.round(pct)}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-mono text-micro text-fg-subtle">
              {detail ?? 'Connecting to database…'}
            </p>
            <div className="flex shrink-0 items-center gap-3">
              {!isIndeterminate && (
                <span className="font-mono text-micro tabular-nums text-fg-subtle">
                  {Math.round(pct)}%
                </span>
              )}
              <button
                type="button"
                onClick={() =>
                  router.push(`/db-connections/${task.connectionId}`)
                }
                className="font-mono text-micro text-accent/80 transition-colors hover:text-accent focus-visible:outline-none"
              >
                View
              </button>
            </div>
          </div>
        </>
      )}

      {task.status === 'completed' && progress?.total_tables ? (
        <p className="-mt-1 font-mono text-micro text-fg-subtle">
          {progress.total_tables}{' '}
          {progress.total_tables === 1 ? 'table' : 'tables'} learned
        </p>
      ) : null}

      {task.status === 'failed' && (
        <p className="-mt-1 font-mono text-micro text-error/70">
          Check the connection and try again.
        </p>
      )}
    </div>
  );
}

// ── Report task card ──────────────────────────────────────────────────────────

interface ReportTaskCardProps {
  task: ReportTask;
}

function ReportTaskCard({ task }: ReportTaskCardProps) {
  const router = useRouter();
  const dismissReportTask = useBackgroundTasksStore(
    (s) => s.dismissReportTask,
  );
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-dismiss on completion
  useEffect(() => {
    if (task.status !== 'completed') return;
    dismissTimer.current = setTimeout(() => {
      dismissReportTask(task.templateId);
    }, AUTO_DISMISS_MS);
    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [task.status, task.templateId, dismissReportTask]);

  const pct =
    task.totalSteps > 0
      ? (task.completedSteps / task.totalSteps) * 100
      : 0;
  const isIndeterminate = task.status === 'running' && pct < 3;

  const headerLabel =
    task.status === 'completed'
      ? 'Report ready'
      : task.status === 'failed'
        ? 'Generation failed'
        : 'Generating report';

  const handleView = () => {
    if (task.generationId) {
      router.push(`/reports/${task.generationId}`);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-2.5 rounded-xl border bg-surface-200 px-4 py-3.5 shadow-elevated',
        task.status === 'completed' && 'border-accent/25',
        task.status === 'failed' && 'border-error/25',
        task.status === 'running' && 'border-border',
      )}
    >
      <div className="flex items-center gap-2">
        {task.status === 'completed' ? (
          <Check
            aria-hidden
            size={13}
            strokeWidth={2.5}
            className="shrink-0 text-accent"
          />
        ) : task.status === 'failed' ? (
          <X
            aria-hidden
            size={13}
            strokeWidth={2.5}
            className="shrink-0 text-error"
          />
        ) : (
          <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
        )}

        <span
          className={cn(
            'flex-1 font-sans text-body font-medium',
            task.status === 'completed' && 'text-accent',
            task.status === 'failed' && 'text-error',
            task.status === 'running' && 'text-foreground',
          )}
        >
          {headerLabel}
        </span>

        <button
          type="button"
          onClick={() => dismissReportTask(task.templateId)}
          aria-label="Dismiss"
          className="shrink-0 rounded p-0.5 text-fg-subtle transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <X aria-hidden size={13} strokeWidth={1.75} />
        </button>
      </div>

      <p className="-mt-1 truncate font-mono text-mono-sm text-fg-muted">
        {task.templateName}
      </p>

      {task.status === 'running' && (
        <>
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-accent/12">
            {isIndeterminate ? (
              <div
                className="animate-shimmer absolute inset-0 rounded-full"
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, transparent 0%, rgba(62,207,142,0.5) 50%, transparent 100%)',
                  backgroundSize: '200% 100%',
                }}
              />
            ) : (
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
                style={{ width: `${Math.max(2, pct)}%` }}
                role="progressbar"
                aria-valuenow={Math.round(pct)}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-mono text-micro text-fg-subtle tabular-nums">
              {task.completedSteps}/{task.totalSteps} steps
            </p>
            {!isIndeterminate && (
              <span className="font-mono text-micro tabular-nums text-fg-subtle">
                {Math.round(pct)}%
              </span>
            )}
          </div>
        </>
      )}

      {task.status === 'completed' && task.generationId && (
        <div className="-mt-1 flex items-center justify-between gap-2">
          <p className="font-mono text-micro text-fg-subtle">
            {task.totalSteps} steps complete
          </p>
          <button
            type="button"
            onClick={handleView}
            className="font-mono text-micro text-accent/80 transition-colors hover:text-accent focus-visible:outline-none"
          >
            View →
          </button>
        </div>
      )}

      {task.status === 'failed' && (
        <p className="-mt-1 font-mono text-micro text-error/70">
          Open the report page to retry.
        </p>
      )}
    </div>
  );
}
