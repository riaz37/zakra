import { create } from 'zustand';

// ── Types ─────────────────────────────────────────────────────────────────────

export type TaskStatus = 'running' | 'completed' | 'failed';

export interface SchemaTask {
  type: 'schema_learning';
  connectionId: string;
  connectionName: string;
  status: TaskStatus;
}

export interface ReportTask {
  type: 'report_generation';
  templateId: string;
  templateName: string;
  generationId: string | null;
  status: TaskStatus;
  completedSteps: number;
  totalSteps: number;
}

export type BackgroundTask = SchemaTask | ReportTask;

interface BackgroundTasksState {
  tasks: BackgroundTask[];

  // Schema learning
  startSchemaLearning: (connectionId: string, connectionName: string) => void;
  completeSchemaTask: (connectionId: string) => void;
  failSchemaTask: (connectionId: string) => void;
  dismissSchemaTask: (connectionId: string) => void;

  // Report generation
  startReportGeneration: (
    templateId: string,
    templateName: string,
    totalSteps: number,
  ) => void;
  updateReportProgress: (templateId: string, completedSteps: number) => void;
  completeReportTask: (templateId: string, generationId: string) => void;
  failReportTask: (templateId: string) => void;
  dismissReportTask: (templateId: string) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function isSchema(task: BackgroundTask, connectionId: string): task is SchemaTask {
  return task.type === 'schema_learning' && task.connectionId === connectionId;
}

function isReport(task: BackgroundTask, templateId: string): task is ReportTask {
  return task.type === 'report_generation' && task.templateId === templateId;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useBackgroundTasksStore = create<BackgroundTasksState>()((set) => ({
  tasks: [],

  startSchemaLearning: (connectionId, connectionName) =>
    set((state) => {
      const without = state.tasks.filter((t) => !isSchema(t, connectionId));
      const next: SchemaTask = {
        type: 'schema_learning',
        connectionId,
        connectionName,
        status: 'running',
      };
      return { tasks: [next, ...without] };
    }),

  completeSchemaTask: (connectionId) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        isSchema(t, connectionId) ? { ...t, status: 'completed' as const } : t,
      ),
    })),

  failSchemaTask: (connectionId) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        isSchema(t, connectionId) ? { ...t, status: 'failed' as const } : t,
      ),
    })),

  dismissSchemaTask: (connectionId) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => !isSchema(t, connectionId)),
    })),

  startReportGeneration: (templateId, templateName, totalSteps) =>
    set((state) => {
      const without = state.tasks.filter((t) => !isReport(t, templateId));
      const next: ReportTask = {
        type: 'report_generation',
        templateId,
        templateName,
        generationId: null,
        status: 'running',
        completedSteps: 0,
        totalSteps,
      };
      return { tasks: [next, ...without] };
    }),

  updateReportProgress: (templateId, completedSteps) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        isReport(t, templateId) ? { ...t, completedSteps } : t,
      ),
    })),

  completeReportTask: (templateId, generationId) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        isReport(t, templateId)
          ? {
              ...t,
              status: 'completed' as const,
              generationId,
              completedSteps: t.totalSteps,
            }
          : t,
      ),
    })),

  failReportTask: (templateId) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        isReport(t, templateId) ? { ...t, status: 'failed' as const } : t,
      ),
    })),

  dismissReportTask: (templateId) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => !isReport(t, templateId)),
    })),
}));
