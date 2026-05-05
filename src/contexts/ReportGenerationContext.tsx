'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';

import { useAIReportGeneration } from '@/hooks/useAIReportGeneration';
import { useBackgroundTasksStore } from '@/store/backgroundTasksStore';
import { AI_REPORT_PIPELINE_STEPS, type AIReportPipelineState } from '@/types';

interface ReportGenerationContextValue {
  state: AIReportPipelineState;
  isGenerating: boolean;
  activeTemplateId: string | null;
  generate: (
    templateId: string,
    companyId?: string,
    connectionId?: string,
    title?: string,
    language?: string,
  ) => Promise<void>;
  cancel: () => void;
  reset: () => void;
}

const ReportGenerationContext =
  createContext<ReportGenerationContextValue | null>(null);

const TOTAL_AI_STEPS = AI_REPORT_PIPELINE_STEPS.length;

export function ReportGenerationProvider({ children }: { children: ReactNode }) {
  const hook = useAIReportGeneration();
  const startReportGeneration = useBackgroundTasksStore(
    (s) => s.startReportGeneration,
  );
  const updateReportProgress = useBackgroundTasksStore(
    (s) => s.updateReportProgress,
  );
  const completeReportTask = useBackgroundTasksStore((s) => s.completeReportTask);
  const failReportTask = useBackgroundTasksStore((s) => s.failReportTask);

  // Track the templateId of the in-flight generation so the panel and the
  // sync effect can identify it across status transitions.
  const activeTemplateIdRef = useRef<string | null>(null);

  const generate = useCallback(
    async (
      templateId: string,
      companyId?: string,
      connectionId?: string,
      title?: string,
      language?: string,
    ) => {
      activeTemplateIdRef.current = templateId;
      startReportGeneration(templateId, title ?? templateId, TOTAL_AI_STEPS);
      await hook.generate(templateId, companyId, connectionId, title, language);
    },
    [hook, startReportGeneration],
  );

  // Mirror hook state into the background tasks store so the global panel
  // can render progress without subscribing to the context.
  const completedCount = hook.state.steps.filter(
    (s) => s.status === 'completed',
  ).length;

  useEffect(() => {
    const templateId = activeTemplateIdRef.current;
    if (!templateId) return;

    if (hook.state.status === 'running') {
      updateReportProgress(templateId, completedCount);
      return;
    }

    if (hook.state.status === 'completed') {
      completeReportTask(templateId, hook.state.generationId ?? '');
      return;
    }

    if (hook.state.status === 'error') {
      failReportTask(templateId);
    }
  }, [
    hook.state.status,
    hook.state.generationId,
    completedCount,
    updateReportProgress,
    completeReportTask,
    failReportTask,
  ]);

  const value: ReportGenerationContextValue = {
    state: hook.state,
    isGenerating: hook.isGenerating,
    activeTemplateId: activeTemplateIdRef.current,
    generate,
    cancel: hook.cancel,
    reset: hook.reset,
  };

  return (
    <ReportGenerationContext.Provider value={value}>
      {children}
    </ReportGenerationContext.Provider>
  );
}

export function useReportGenerationContext(): ReportGenerationContextValue {
  const ctx = useContext(ReportGenerationContext);
  if (!ctx) {
    throw new Error(
      'useReportGenerationContext must be used inside ReportGenerationProvider',
    );
  }
  return ctx;
}
