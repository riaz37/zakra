'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

import { useReportGenerationContext } from '@/contexts/ReportGenerationContext';
import { useReportTemplate } from '@/hooks/useReportTemplates';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';

import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { ScaffoldContainer } from '@/components/shared/scaffold';
import { AnimatedPage } from '@/components/shared/animated-container';
import {
  PipelineStepList,
  type NormalizedStep,
} from '@/components/features/chat/pipeline-step-list';
import { fadeUp, fadeIn } from '@/lib/motion';
import type { ReportPipelineStep } from '@/types';

function normalizeSteps(steps: ReportPipelineStep[]): NormalizedStep[] {
  return steps.map((s) => ({
    key: String(s.number),
    name: s.name,
    status: s.status,
    durationMs: s.durationMs,
  }));
}

export default function ReportGeneratePage() {
  const t = useTranslations('dashboard.reports.generate');
  const tv = useTranslations('dashboard.reports.viewer');
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const companyId = useCurrentCompanyId();
  const reduced = useReducedMotion();

  const { data: template } = useReportTemplate(id, companyId);
  const { state, generate, reset } = useReportGenerationContext();

  // Auto-start generation when page loads
  useEffect(() => {
    if (id && state.status === 'idle') {
      void generate(id, companyId);
    }
    // Intentionally narrow deps: we want to trigger only on id/companyId change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, companyId]);

  // Auto-redirect on completion
  useEffect(() => {
    if (state.status === 'completed' && state.generationId) {
      const timer = setTimeout(() => {
        router.push(`/reports/${state.generationId}`);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [state.status, state.generationId, router]);

  // Surface errors as toast
  useEffect(() => {
    if (state.status === 'error' && state.error) {
      toast.error(state.error.message);
    }
  }, [state.status, state.error]);

  const handleViewReport = () => {
    if (state.generationId) {
      router.push(`/reports/${state.generationId}`);
    }
  };

  const handleRetry = () => {
    reset();
    if (id) {
      void generate(id, companyId);
    }
  };

  const subtitle = template
    ? `${template.name} · ${template.sections.length} ${
        template.sections.length === 1 ? tv('sectionSingular') : tv('sectionPlural')
      }`
    : t('preparingPipeline');

  const isComplete = state.status === 'completed';
  const isError = state.status === 'error';
  const visibleSteps = normalizeSteps(state.steps);
  const hasStarted = state.steps.some((s) => s.status !== 'pending');

  return (
    <ScaffoldContainer size="large">
      <PageHeader
        breadcrumbs={[
          { label: t('breadcrumbReports'), href: '/reports/ai-generate' },
          { label: t('breadcrumbTemplates'), href: '/reports/templates' },
          { label: isComplete ? t('breadcrumbReady') : isError ? t('breadcrumbFailed') : t('breadcrumbGenerating') },
        ]}
        title={isComplete ? t('titleReady') : isError ? t('titleFailed') : t('titleGenerating')}
        subtitle={subtitle}
        primaryActions={
          isComplete ? (
            <Button onClick={handleViewReport}>
              {t('viewReport')}
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          ) : isError ? (
            <Button variant="outline" onClick={handleRetry}>
              {t('retry')}
            </Button>
          ) : null
        }
      />

      <AnimatedPage>
        <div className="grid grid-cols-1 gap-6 pb-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          {/* ── Left: pipeline status panel ─────────────────────────────── */}
          <div className="rounded-card border border-border bg-surface-100 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="font-mono text-mono-sm uppercase tracking-[0.12em] text-fg-subtle">
                {t('pipeline')}
              </span>
              <StatusBadge
                status={state.status}
                stepCount={state.steps.length}
                completedCount={state.steps.filter((s) => s.status === 'completed').length}
              />
            </div>

            {hasStarted ? (
              <PipelineStepList steps={visibleSteps} />
            ) : (
              <div
                className="flex items-center gap-2.5 font-mono text-mono-sm text-fg-subtle"
                aria-live="polite"
              >
                <span
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent"
                  aria-hidden
                />
                {t('connectingStream')}
              </div>
            )}

            {state.durationMs != null && (
              <div className="mt-5 border-t border-border/60 pt-3">
                <div className="flex items-center justify-between font-mono text-mono-sm text-fg-muted">
                  <span>{t('totalDuration')}</span>
                  <span className="text-foreground">
                    {(state.durationMs / 1000).toFixed(1)}s
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: status detail ────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {isError && state.error && (
                <motion.div
                  key="error"
                  variants={fadeUp}
                  initial={reduced ? 'visible' : 'hidden'}
                  animate="visible"
                  exit="exit"
                  role="alert"
                  className="rounded-card border border-error/30 bg-error/5 p-5"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      className="mt-0.5 size-4 shrink-0 text-error"
                      strokeWidth={2}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-sans text-button font-medium text-error">
                        {state.error.code.replace(/_/g, ' ').toLowerCase()}
                      </p>
                      <p className="mt-1 font-sans text-body text-fg-muted">
                        {state.error.message}
                      </p>
                      {state.error.stepName && (
                        <p className="mt-2 font-mono text-mono-sm text-fg-subtle">
                          {t('failedAt', { stepName: state.error.stepName })}
                        </p>
                      )}
                      {state.error.recoverable && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRetry}
                          className="mt-3"
                        >
                          {t('retryGeneration')}
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {isComplete && !isError && (
                <motion.div
                  key="success"
                  variants={fadeUp}
                  initial={reduced ? 'visible' : 'hidden'}
                  animate="visible"
                  exit="exit"
                  className="rounded-card border border-accent/30 bg-accent/5 p-5"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      className="mt-0.5 size-4 shrink-0 text-accent"
                      strokeWidth={2}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-sans text-button font-medium text-foreground">
                        {t('reportReady')}
                      </p>
                      <p className="mt-1 font-sans text-body text-fg-muted">
                        {t('redirecting')}
                      </p>
                      <Button onClick={handleViewReport} size="sm" className="mt-3">
                        {t('viewNow')}
                        <ArrowRight className="size-3.5" aria-hidden />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {!isComplete && !isError && (
                <motion.div
                  key="running"
                  variants={fadeIn}
                  initial={reduced ? 'visible' : 'hidden'}
                  animate="visible"
                  exit="exit"
                  className="rounded-card border border-border bg-surface-100 p-5"
                >
                  <p className="font-sans text-button font-medium text-foreground">
                    {template?.name ?? 'Report'}
                  </p>
                  <p className="mt-1 font-sans text-body text-fg-muted">
                    {t('analysisRunning')}
                  </p>

                  {state.executiveSummary && (
                    <div className="mt-4 border-t border-border/60 pt-4">
                      <span className="font-mono text-mono-sm uppercase tracking-[0.12em] text-fg-subtle">
                        {t('executiveSummary')}
                      </span>
                      <p className="mt-2 whitespace-pre-line font-sans text-body text-foreground">
                        {state.executiveSummary}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Section results stream in progressively */}
            {state.sectionResults.size > 0 && (
              <div className="rounded-card border border-border bg-surface-100 p-5">
                <span className="font-mono text-mono-sm uppercase tracking-[0.12em] text-fg-subtle">
                  {t('sectionAnalyses', { count: state.sectionResults.size })}
                </span>
                <ul className="mt-3 flex flex-col divide-y divide-border/60">
                  {Array.from(state.sectionResults.entries())
                    .sort(([a], [b]) => a - b)
                    .map(([idx, data]) => (
                      <li
                        key={idx}
                        className="flex items-baseline gap-3 py-2.5 first:pt-0 last:pb-0"
                      >
                        <span className="font-mono text-mono-sm text-fg-subtle tabular-nums">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="font-sans text-body text-foreground">
                          {data.title}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </AnimatedPage>
    </ScaffoldContainer>
  );
}

// ── Status badge ───────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: 'idle' | 'running' | 'completed' | 'error';
  stepCount: number;
  completedCount: number;
}

function StatusBadge({ status, stepCount, completedCount }: StatusBadgeProps) {
  const t = useTranslations('dashboard.reports.status');
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-mono-sm text-accent">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
        {t('completed')}
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-mono-sm text-error">
        <span className="h-1.5 w-1.5 rounded-full bg-error" aria-hidden />
        {t('failed')}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-mono-sm text-fg-muted tabular-nums">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden />
      {completedCount}/{stepCount}
    </span>
  );
}
