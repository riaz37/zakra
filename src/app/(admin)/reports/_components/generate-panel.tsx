"use client";

import { useMemo, useState } from "react";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReportGeneration } from "@/hooks/useReportGeneration";
import { useAIReportGeneration } from "@/hooks/useAIReportGeneration";
import { useUIStore } from "@/store/uiStore";
import type { DatabaseConnection, ReportTemplate } from "@/types";
import { PipelineSteps } from "./pipeline-steps";

interface GeneratePanelProps {
  companyId: string | undefined;
  templates: ReportTemplate[];
  connections: DatabaseConnection[];
}

export function GeneratePanel({
  companyId,
  templates,
  connections,
}: GeneratePanelProps) {
  const [mode, setMode] = useState<"template" | "ai">("template");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-1 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] p-1 self-start">
        <ModeButton
          active={mode === "template"}
          onClick={() => setMode("template")}
          label="From template"
        />
        <ModeButton
          active={mode === "ai"}
          onClick={() => setMode("ai")}
          label="AI generate"
          icon={<Sparkles className="size-3.5" strokeWidth={1.75} />}
        />
      </div>

      {mode === "template" ? (
        <TemplateGenerator
          companyId={companyId}
          templates={templates}
          connections={connections}
        />
      ) : (
        <AIGenerator
          companyId={companyId}
          connections={connections}
        />
      )}
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-8 items-center gap-1.5 rounded-[8px] px-3 text-[13px] font-medium transition-colors ${
        active
          ? "bg-[var(--primary-soft)] text-[var(--primary)]"
          : "text-[var(--fg-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--fg)]"
      }`}
      aria-pressed={active}
    >
      {icon}
      {label}
    </button>
  );
}

// =========================== Template generator ===========================

interface TemplateGeneratorProps {
  companyId: string | undefined;
  templates: ReportTemplate[];
  connections: DatabaseConnection[];
}

function TemplateGenerator({
  companyId,
  templates,
  connections,
}: TemplateGeneratorProps) {
  const language = useUIStore((s) => s.reportLanguage);
  const { state, generate, reset, isGenerating } = useReportGeneration();

  const [connectionId, setConnectionId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [title, setTitle] = useState("");

  const filteredTemplates = useMemo(() => {
    if (!connectionId) return templates;
    return templates.filter((t) => t.connection_id === connectionId);
  }, [templates, connectionId]);

  const selectedTemplate = templates.find((t) => t.id === templateId);

  const canGenerate =
    !!templateId && !!selectedTemplate && !isGenerating;

  const handleGenerate = async () => {
    if (!templateId) return;
    reset();
    try {
      await generate(templateId, companyId, title.trim() || undefined, language);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to start generation",
      );
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-token-sm sm:grid-cols-2">
        <Field label="Connection">
          <Select
            value={connectionId}
            onValueChange={(v) => {
              if (typeof v === "string") setConnectionId(v);
            }}
          >
            <SelectTrigger className="h-9 w-full rounded-[var(--radius-input)] border-[var(--border-strong)] px-3 text-[14px]">
              <SelectValue placeholder="All connections" />
            </SelectTrigger>
            <SelectContent>
              {connections.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Template">
          <Select
            value={templateId}
            onValueChange={(v) => {
              if (typeof v === "string") setTemplateId(v);
            }}
          >
            <SelectTrigger className="h-9 w-full rounded-[var(--radius-input)] border-[var(--border-strong)] px-3 text-[14px]">
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              {filteredTemplates.length === 0 ? (
                <div className="px-3 py-2 text-[12px] text-[var(--fg-subtle)]">
                  No templates for this connection.
                </div>
              ) : (
                filteredTemplates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Title" optional>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={selectedTemplate?.name ?? "Report title"}
            className="h-9 w-full rounded-[var(--radius-input)] border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[14px] text-[var(--fg)] placeholder:text-[var(--fg-subtle)] focus:border-[var(--primary)] focus:outline-none focus:ring-3 focus:ring-[var(--ring)]"
          />
        </Field>

        <div className="flex items-end">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-[var(--radius-btn)] bg-[var(--primary)] px-4 text-[13px] font-medium text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating ? (
              <Loader2 className="size-3.5 animate-spin" strokeWidth={1.75} />
            ) : null}
            {isGenerating ? "Generating…" : "Generate report"}
          </button>
        </div>
      </div>

      <PipelineSteps
        steps={state.steps}
        status={state.status}
        generationId={state.generationId}
        error={state.error?.message ?? null}
        title={selectedTemplate?.name ?? "Report generation"}
      />

      {state.executiveSummary && (
        <ExecutiveSummary summary={state.executiveSummary} />
      )}
    </section>
  );
}

// =========================== AI generator ===========================

interface AIGeneratorProps {
  companyId: string | undefined;
  connections: DatabaseConnection[];
}

function AIGenerator({ companyId, connections }: AIGeneratorProps) {
  const language = useUIStore((s) => s.reportLanguage);
  const { state, generate, reset, isGenerating } = useAIReportGeneration();

  const [prompt, setPrompt] = useState("");
  const [connectionId, setConnectionId] = useState("");
  const [title, setTitle] = useState("");

  const canGenerate = prompt.trim().length > 0 && !isGenerating;

  const handleGenerate = async () => {
    reset();
    try {
      await generate(
        prompt.trim(),
        companyId,
        connectionId || undefined,
        title.trim() || undefined,
        language,
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to start generation",
      );
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-token-sm">
        <Field
          label="What do you want to see?"
          hint="Describe the report in plain English. The assistant will pick the best template and adapt the queries."
        >
          <div className="relative">
            <Wand2
              className="pointer-events-none absolute left-3 top-3 size-4 text-[var(--primary)]"
              strokeWidth={1.75}
              aria-hidden
            />
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="Weekly revenue by plan for the last 8 weeks, flag plans that lost more than 10% WoW."
              className="w-full resize-none rounded-[var(--radius-input)] border border-[var(--border-strong)] bg-[var(--surface)] py-2.5 pl-9 pr-3 text-[14px] leading-[22px] text-[var(--fg)] placeholder:text-[var(--fg-subtle)] focus:border-[var(--primary)] focus:outline-none focus:ring-3 focus:ring-[var(--ring)]"
            />
          </div>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Connection" optional>
            <Select
              value={connectionId}
              onValueChange={(v) => {
                if (typeof v === "string") setConnectionId(v);
              }}
            >
              <SelectTrigger className="h-9 w-full rounded-[var(--radius-input)] border-[var(--border-strong)] px-3 text-[14px]">
                <SelectValue placeholder="Auto-select" />
              </SelectTrigger>
              <SelectContent>
                {connections.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Title" optional>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Custom title"
              className="h-9 w-full rounded-[var(--radius-input)] border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[14px] text-[var(--fg)] placeholder:text-[var(--fg-subtle)] focus:border-[var(--primary)] focus:outline-none focus:ring-3 focus:ring-[var(--ring)]"
            />
          </Field>
        </div>

        <div className="flex items-center gap-2">
          <span className="grow text-[12px] text-[var(--fg-subtle)]">
            The assistant will select a matching template and adapt the queries.
          </span>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="inline-flex h-9 items-center gap-2 rounded-[var(--radius-btn)] bg-[var(--primary)] px-4 text-[13px] font-medium text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating ? (
              <Loader2 className="size-3.5 animate-spin" strokeWidth={1.75} />
            ) : (
              <Sparkles className="size-3.5" strokeWidth={1.75} />
            )}
            {isGenerating ? "Generating…" : "Generate with AI"}
          </button>
        </div>
      </div>

      <PipelineSteps
        steps={state.steps}
        status={state.status}
        generationId={state.generationId}
        error={state.error?.message ?? null}
        title={title || "AI report"}
      />

      {state.templateSelection && (
        <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-token-sm">
          <div className="caption-upper mb-2 text-[11px]">Interpreted</div>
          <p className="text-[13px] leading-[20px] text-[var(--fg)]">
            {state.templateSelection.interpreted_request}
          </p>
          {state.templateSelection.matches.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1.5">
              {state.templateSelection.matches.slice(0, 3).map((m) => (
                <li
                  key={m.template_id}
                  className="flex items-center gap-2 text-[12px]"
                >
                  <span className="font-medium text-[var(--fg)]">
                    {m.template_name}
                  </span>
                  <span className="font-mono text-[11px] text-[var(--fg-subtle)]">
                    {Math.round(m.relevance_score * 100)}% match
                  </span>
                  <span className="text-[var(--fg-muted)]">
                    — {m.reasoning}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {state.executiveSummary && (
        <ExecutiveSummary summary={state.executiveSummary} />
      )}
    </section>
  );
}

function ExecutiveSummary({ summary }: { summary: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-token-sm">
      <div className="caption-upper mb-2 text-[11px]">Executive summary</div>
      <p className="whitespace-pre-wrap text-[13px] leading-[20px] text-[var(--fg)]">
        {summary}
      </p>
    </div>
  );
}

interface FieldProps {
  label: string;
  optional?: boolean;
  hint?: string;
  children: React.ReactNode;
}

function Field({ label, optional, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-baseline gap-2 text-[12px] font-medium text-[var(--fg)]">
        {label}
        {optional && (
          <span className="text-[11px] font-normal text-[var(--fg-subtle)]">
            Optional
          </span>
        )}
      </label>
      {children}
      {hint && <p className="text-[11px] text-[var(--fg-subtle)]">{hint}</p>}
    </div>
  );
}
