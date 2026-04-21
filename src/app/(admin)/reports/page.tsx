"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentCompanyId } from "@/hooks/useCurrentCompany";
import { useReportTemplates } from "@/hooks/useReportTemplates";
import { useDbConnections } from "@/hooks/useDbConnections";
import type { DatabaseConnection, ReportTemplate } from "@/types";
import { TemplateCard } from "./_components/template-card";
import { TemplateEditor } from "./_components/template-editor";
import { GeneratePanel } from "./_components/generate-panel";
import { HistoryTable } from "./_components/history-table";

type TabValue = "templates" | "generate" | "history";

export default function ReportsPage() {
  const companyId = useCurrentCompanyId();
  const templatesQuery = useReportTemplates(companyId);
  const connectionsQuery = useDbConnections({
    company_id: companyId,
    page: 1,
    page_size: 100,
  });

  const templates = templatesQuery.data?.templates ?? [];
  const connections = useMemo(
    () => connectionsQuery.data?.items ?? [],
    [connectionsQuery.data],
  );

  const [tab, setTab] = useState<TabValue>("templates");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<ReportTemplate | null>(null);

  const openNewTemplate = () => {
    setEditingTemplate(null);
    setEditorOpen(true);
  };

  const openEditTemplate = (t: ReportTemplate) => {
    setEditingTemplate(t);
    setEditorOpen(true);
  };

  return (
    <div className="mx-auto max-w-[1440px]">
      <PageHeader
        title="Reports"
        subtitle="Design templates, run generations, and browse results."
        actions={
          tab === "templates" && (
            <button
              type="button"
              onClick={openNewTemplate}
              disabled={!companyId || connections.length === 0}
              className="inline-flex h-9 items-center gap-2 rounded-[var(--radius-btn)] bg-[var(--primary)] px-3 text-[13px] font-medium text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="size-3.5" strokeWidth={1.75} />
              New template
            </button>
          )
        }
      />

      <Tabs
        value={tab}
        onValueChange={(v: string) => setTab(v as TabValue)}
      >
        <div className="mb-6 border-b border-[var(--border)]">
          <TabsList
            variant="line"
            className="h-11 w-full justify-start gap-6 rounded-none bg-transparent p-0"
          >
            <TabTrigger value="templates">
              Templates
              <TabCount>{templates.length}</TabCount>
            </TabTrigger>
            <TabTrigger value="generate">Generate</TabTrigger>
            <TabTrigger value="history">History</TabTrigger>
          </TabsList>
        </div>

        <TabsContent value="templates" className="m-0">
          <TemplatesView
            isLoading={templatesQuery.isLoading}
            templates={templates}
            connections={connections}
            companyId={companyId}
            onEdit={openEditTemplate}
            onCreate={openNewTemplate}
          />
        </TabsContent>

        <TabsContent value="generate" className="m-0">
          <GeneratePanel
            companyId={companyId}
            templates={templates}
            connections={connections}
          />
        </TabsContent>

        <TabsContent value="history" className="m-0">
          <HistoryTable companyId={companyId} />
        </TabsContent>
      </Tabs>

      <TemplateEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        companyId={companyId}
        connections={connections}
        template={editingTemplate}
      />
    </div>
  );
}

function TabTrigger({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  return (
    <TabsTrigger
      value={value}
      className="relative h-11 gap-2 rounded-none border-0 px-0 text-[14px] font-medium text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)] data-active:text-[var(--primary)] after:bg-[var(--primary)]"
    >
      {children}
    </TabsTrigger>
  );
}

function TabCount({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[4px] bg-[var(--surface-muted)] px-1 font-mono text-[11px] text-[var(--fg-muted)]">
      {children}
    </span>
  );
}

// =========================== Templates view ===========================

interface TemplatesViewProps {
  isLoading: boolean;
  templates: ReportTemplate[];
  connections: DatabaseConnection[];
  companyId: string | undefined;
  onEdit: (t: ReportTemplate) => void;
  onCreate: () => void;
}

function TemplatesView({
  isLoading,
  templates,
  connections,
  companyId,
  onEdit,
  onCreate,
}: TemplatesViewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5"
          >
            <div className="flex gap-3">
              <span className="skel size-9 rounded-[10px]" />
              <div className="grow">
                <span className="skel h-3.5 w-3/4" />
                <span className="skel mt-2 h-3 w-5/6" />
              </div>
            </div>
            <span className="skel h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-6 py-16 text-center">
        <h3 className="font-display text-[17px] font-semibold -tracking-[0.01em]">
          No templates yet
        </h3>
        <p className="mt-1 max-w-[42ch] text-[13px] text-[var(--fg-muted)]">
          Templates define the structure of a report — its sections, queries,
          and recommended chart types.
        </p>
        <button
          type="button"
          onClick={onCreate}
          disabled={!companyId || connections.length === 0}
          className="mt-5 inline-flex h-9 items-center gap-2 rounded-[var(--radius-btn)] bg-[var(--primary)] px-3 text-[13px] font-medium text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="size-3.5" strokeWidth={1.75} />
          Create a template
        </button>
        {connections.length === 0 && (
          <p className="mt-2 text-[11px] text-[var(--fg-subtle)]">
            Add a database connection first.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((t) => (
        <TemplateCard
          key={t.id}
          template={t}
          connections={connections}
          companyId={companyId}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
