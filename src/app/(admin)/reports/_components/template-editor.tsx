"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, GripVertical, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateReportTemplate,
  useUpdateReportTemplate,
} from "@/hooks/useReportTemplates";
import type {
  ChartPreference,
  DatabaseConnection,
  ReportSectionConfig,
  ReportTemplate,
  ReportType,
} from "@/types";

interface TemplateEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string | undefined;
  connections: DatabaseConnection[];
  template: ReportTemplate | null;
}

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: "financial", label: "Financial" },
  { value: "sales", label: "Sales" },
  { value: "hr", label: "HR" },
  { value: "inventory", label: "Inventory" },
  { value: "custom", label: "Custom" },
];

const CHART_OPTIONS: { value: ChartPreference; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "bar", label: "Bar" },
  { value: "line", label: "Line" },
  { value: "pie", label: "Pie" },
  { value: "scatter", label: "Scatter" },
  { value: "table", label: "Table" },
];

function blankSection(order: number): ReportSectionConfig {
  return {
    title: "",
    description: "",
    query_hint: "",
    chart_preference: "auto",
    analysis_prompt: null,
    include_table: true,
    include_chart: true,
    order,
  };
}

export function TemplateEditor({
  open,
  onOpenChange,
  companyId,
  connections,
  template,
}: TemplateEditorProps) {
  const createMutation = useCreateReportTemplate(companyId);
  const updateMutation = useUpdateReportTemplate(companyId);

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [connectionId, setConnectionId] = useState("");
  const [reportType, setReportType] = useState<ReportType>("custom");
  const [sections, setSections] = useState<ReportSectionConfig[]>([
    blankSection(0),
  ]);

  const isEdit = Boolean(template);
  const saving = createMutation.isPending || updateMutation.isPending;

  // Reset form when dialog (re)opens.
  useEffect(() => {
    if (!open) return;
    setStep(1);
    if (template) {
      setName(template.name);
      setDescription(template.description ?? "");
      setConnectionId(template.connection_id);
      setReportType(template.report_type);
      setSections(
        template.sections.length > 0
          ? [...template.sections].sort((a, b) => a.order - b.order)
          : [blankSection(0)],
      );
    } else {
      setName("");
      setDescription("");
      setConnectionId(connections[0]?.id ?? "");
      setReportType("custom");
      setSections([blankSection(0)]);
    }
  }, [open, template, connections]);

  const canContinue = useMemo(() => {
    if (!name.trim()) return false;
    if (!connectionId) return false;
    return true;
  }, [name, connectionId]);

  const canSave = useMemo(() => {
    if (!canContinue) return false;
    if (sections.length === 0) return false;
    return sections.every((s) => s.title.trim().length > 0);
  }, [canContinue, sections]);

  const updateSection = (
    index: number,
    patch: Partial<ReportSectionConfig>,
  ) => {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    );
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    setSections((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((s, i) => ({ ...s, order: i }));
    });
  };

  const addSection = () => {
    setSections((prev) => [...prev, blankSection(prev.length)]);
  };

  const removeSection = (index: number) => {
    setSections((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, order: i })),
    );
  };

  const handleSave = async () => {
    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      connection_id: connectionId,
      report_type: reportType,
      sections: sections.map((s, i) => ({ ...s, order: i })),
    };

    try {
      if (template) {
        await updateMutation.mutateAsync({
          templateId: template.id,
          data: {
            name: payload.name,
            description: payload.description,
            sections: payload.sections,
          },
        });
        toast.success(`Updated ${payload.name}`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`Created ${payload.name}`);
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save template",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[calc(100vh-4rem)] flex-col gap-0 p-0 sm:max-w-[640px]"
        showCloseButton={false}
      >
        <DialogHeader className="flex-row items-start gap-3 border-b border-[var(--border)] px-6 py-4">
          <div className="grow">
            <DialogTitle className="font-display text-[17px] font-semibold -tracking-[0.01em]">
              {isEdit ? "Edit template" : "New template"}
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-[12px] text-[var(--fg-muted)]">
              Step {step} of 2 · {step === 1 ? "Basics" : "Sections"}
            </DialogDescription>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="inline-flex size-7 items-center justify-center rounded-md text-[var(--fg-subtle)] hover:bg-[var(--surface-muted)] hover:text-[var(--fg)]"
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        </DialogHeader>

        <div className="min-h-0 grow overflow-y-auto px-6 py-5">
          {step === 1 ? (
            <BasicsStep
              name={name}
              description={description}
              connectionId={connectionId}
              reportType={reportType}
              connections={connections}
              onNameChange={setName}
              onDescriptionChange={setDescription}
              onConnectionChange={setConnectionId}
              onReportTypeChange={setReportType}
              isEdit={isEdit}
            />
          ) : (
            <SectionsStep
              sections={sections}
              onUpdate={updateSection}
              onAdd={addSection}
              onRemove={removeSection}
              onMove={moveSection}
            />
          )}
        </div>

        <DialogFooter className="flex-row items-center gap-2 border-t border-[var(--border)] bg-[var(--surface)] px-6 py-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 rounded-[var(--radius-btn)] px-3 text-[13px] font-medium text-[var(--fg)] transition-colors hover:bg-[var(--surface-muted)]"
          >
            Cancel
          </button>
          <span className="grow" />
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-btn)] border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[13px] font-medium text-[var(--fg)] transition-colors hover:bg-[var(--surface-muted)]"
            >
              <ArrowLeft className="size-3.5" strokeWidth={1.75} />
              Back
            </button>
          )}
          {step === 1 ? (
            <button
              type="button"
              disabled={!canContinue}
              onClick={() => setStep(2)}
              className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-btn)] bg-[var(--primary)] px-3 text-[13px] font-medium text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Next
              <ArrowRight className="size-3.5" strokeWidth={1.75} />
            </button>
          ) : (
            <button
              type="button"
              disabled={!canSave || saving}
              onClick={handleSave}
              className="inline-flex h-9 items-center rounded-[var(--radius-btn)] bg-[var(--primary)] px-4 text-[13px] font-medium text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving…"
                : isEdit
                  ? "Save changes"
                  : "Create template"}
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =========================== Step 1 — basics ===========================

interface BasicsStepProps {
  name: string;
  description: string;
  connectionId: string;
  reportType: ReportType;
  connections: DatabaseConnection[];
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onConnectionChange: (v: string) => void;
  onReportTypeChange: (v: ReportType) => void;
  isEdit: boolean;
}

function BasicsStep(props: BasicsStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <Field label="Name">
        <input
          type="text"
          value={props.name}
          onChange={(e) => props.onNameChange(e.target.value)}
          placeholder="Weekly revenue digest"
          className="h-9 w-full rounded-[var(--radius-input)] border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[14px] text-[var(--fg)] placeholder:text-[var(--fg-subtle)] focus:border-[var(--primary)] focus:outline-none focus:ring-3 focus:ring-[var(--ring)]"
        />
      </Field>

      <Field label="Description" optional>
        <textarea
          value={props.description}
          onChange={(e) => props.onDescriptionChange(e.target.value)}
          rows={3}
          placeholder="Short summary shown on the template card."
          className="w-full resize-none rounded-[var(--radius-input)] border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-[14px] text-[var(--fg)] placeholder:text-[var(--fg-subtle)] focus:border-[var(--primary)] focus:outline-none focus:ring-3 focus:ring-[var(--ring)]"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Connection">
          <Select
            value={props.connectionId}
            onValueChange={(v) => {
              if (typeof v === "string") props.onConnectionChange(v);
            }}
            disabled={props.isEdit}
          >
            <SelectTrigger className="h-9 w-full rounded-[var(--radius-input)] border-[var(--border-strong)] px-3 text-[14px]">
              <SelectValue placeholder="Select a connection" />
            </SelectTrigger>
            <SelectContent>
              {props.connections.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {props.isEdit && (
            <p className="mt-1 text-[11px] text-[var(--fg-subtle)]">
              Connection can&rsquo;t be changed after creation.
            </p>
          )}
        </Field>

        <Field label="Report type">
          <Select
            value={props.reportType}
            onValueChange={(v) => props.onReportTypeChange(v as ReportType)}
          >
            <SelectTrigger className="h-9 w-full rounded-[var(--radius-input)] border-[var(--border-strong)] px-3 text-[14px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REPORT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
    </div>
  );
}

// =========================== Step 2 — sections ===========================

interface SectionsStepProps {
  sections: ReportSectionConfig[];
  onUpdate: (index: number, patch: Partial<ReportSectionConfig>) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMove: (index: number, dir: -1 | 1) => void;
}

function SectionsStep({
  sections,
  onUpdate,
  onAdd,
  onRemove,
  onMove,
}: SectionsStepProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[12px] text-[var(--fg-muted)]">
        Each section becomes one chapter of the generated report. Give each a
        clear title and optional guidance.
      </p>

      <ol className="flex flex-col gap-3">
        {sections.map((s, i) => (
          <li
            key={i}
            className="flex flex-col gap-3 rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex size-6 items-center justify-center rounded-md bg-[var(--surface-muted)] text-[12px] font-medium text-[var(--fg-muted)]">
                {i + 1}
              </span>
              <span className="caption-upper text-[11px]">Section</span>
              <span className="grow" />
              <button
                type="button"
                onClick={() => onMove(i, -1)}
                disabled={i === 0}
                aria-label="Move section up"
                className="inline-flex size-7 rotate-90 items-center justify-center rounded-md text-[var(--fg-subtle)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--fg)] disabled:pointer-events-none disabled:opacity-40"
              >
                <GripVertical className="size-4" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={() => onMove(i, 1)}
                disabled={i === sections.length - 1}
                aria-label="Move section down"
                className="inline-flex size-7 -rotate-90 items-center justify-center rounded-md text-[var(--fg-subtle)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--fg)] disabled:pointer-events-none disabled:opacity-40"
              >
                <GripVertical className="size-4" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={() => onRemove(i)}
                disabled={sections.length === 1}
                aria-label="Remove section"
                className="inline-flex size-7 items-center justify-center rounded-md text-[var(--fg-subtle)] transition-colors hover:bg-[var(--destructive-soft)] hover:text-[var(--destructive)] disabled:pointer-events-none disabled:opacity-40"
              >
                <Trash2 className="size-3.5" strokeWidth={1.75} />
              </button>
            </div>

            <Field label="Title">
              <input
                type="text"
                value={s.title}
                onChange={(e) => onUpdate(i, { title: e.target.value })}
                placeholder="Revenue by plan"
                className="h-9 w-full rounded-[var(--radius-input)] border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[14px] text-[var(--fg)] placeholder:text-[var(--fg-subtle)] focus:border-[var(--primary)] focus:outline-none focus:ring-3 focus:ring-[var(--ring)]"
              />
            </Field>

            <Field label="Description" optional>
              <textarea
                value={s.description}
                onChange={(e) => onUpdate(i, { description: e.target.value })}
                rows={2}
                placeholder="What this section covers."
                className="w-full resize-none rounded-[var(--radius-input)] border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-[14px] text-[var(--fg)] placeholder:text-[var(--fg-subtle)] focus:border-[var(--primary)] focus:outline-none focus:ring-3 focus:ring-[var(--ring)]"
              />
            </Field>

            <Field label="Chart">
              <Select
                value={s.chart_preference}
                onValueChange={(v) =>
                  onUpdate(i, { chart_preference: v as ChartPreference })
                }
              >
                <SelectTrigger className="h-9 w-full rounded-[var(--radius-input)] border-[var(--border-strong)] px-3 text-[14px] sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHART_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={onAdd}
        className="inline-flex h-9 items-center justify-center gap-1.5 self-start rounded-[var(--radius-btn)] border border-dashed border-[var(--border-strong)] bg-transparent px-3 text-[13px] font-medium text-[var(--fg-muted)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
      >
        <Plus className="size-3.5" strokeWidth={1.75} />
        Add section
      </button>
    </div>
  );
}

// =========================== Field shell ===========================

interface FieldProps {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}

function Field({ label, optional, children }: FieldProps) {
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
    </div>
  );
}
