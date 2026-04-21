"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  useBusinessRules,
  useDeleteBusinessRule,
  useUpdateBusinessRule,
} from "@/hooks/useBusinessRules";
import type { BusinessRule, BusinessRuleScopeType } from "@/types";
import {
  ChevronRight,
  Globe,
  Loader2,
  Pencil,
  Plus,
  ScrollText,
  Table as TableIcon,
  Trash2,
  User,
} from "lucide-react";
import { BusinessRuleDialog } from "./business-rule-dialog";

interface BusinessRulesPanelProps {
  connectionId: string;
  companyId?: string;
}

type ScopeFilter = "all" | BusinessRuleScopeType;

const SCOPE_ORDER: BusinessRuleScopeType[] = ["global", "table", "user"];

const SCOPE_ICON = {
  global: Globe,
  table: TableIcon,
  user: User,
} as const;

const SCOPE_LABEL: Record<BusinessRuleScopeType, string> = {
  global: "Global",
  table: "Table",
  user: "User",
};

export function BusinessRulesPanel({ connectionId, companyId }: BusinessRulesPanelProps) {
  const [filter, setFilter] = useState<ScopeFilter>("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<BusinessRule | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<BusinessRule | null>(null);

  const rulesQuery = useBusinessRules(connectionId, undefined, companyId);
  const updateMut = useUpdateBusinessRule(connectionId, companyId);
  const deleteMut = useDeleteBusinessRule(connectionId, companyId);

  const grouped = useMemo(() => {
    const rules = rulesQuery.data?.rules ?? [];
    const filtered = filter === "all" ? rules : rules.filter((r) => r.scope_type === filter);
    const groups = new Map<BusinessRuleScopeType, BusinessRule[]>();
    for (const scope of SCOPE_ORDER) groups.set(scope, []);
    for (const rule of filtered) {
      groups.get(rule.scope_type)?.push(rule);
    }
    for (const scope of SCOPE_ORDER) {
      groups.get(scope)?.sort((a, b) => a.name.localeCompare(b.name));
    }
    return groups;
  }, [rulesQuery.data, filter]);

  const totalVisible = Array.from(grouped.values()).reduce((sum, arr) => sum + arr.length, 0);

  const openNew = () => {
    setEditingRule(undefined);
    setEditorOpen(true);
  };

  const openEdit = (rule: BusinessRule) => {
    setEditingRule(rule);
    setEditorOpen(true);
  };

  const toggleActive = async (rule: BusinessRule, next: boolean) => {
    try {
      await updateMut.mutateAsync({
        ruleId: rule.id,
        data: { is_active: next },
      });
      toast.success(next ? "Rule activated" : "Rule deactivated", { description: rule.name });
    } catch (err) {
      toast.error("Could not update rule", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    try {
      await deleteMut.mutateAsync(target.id);
      toast.success("Rule deleted", { description: target.name });
      setDeleteTarget(null);
    } catch (err) {
      toast.error("Could not delete rule", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 px-6 pt-5 pb-3">
        <ScopeChips value={filter} onChange={setFilter} />
        <div className="grow" />
        <Button size="sm" onClick={openNew}>
          <Plus className="size-3.5" strokeWidth={1.75} />
          New rule
        </Button>
      </div>

      <div className="px-6 pb-6">
        {rulesQuery.isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} className="skel h-14 w-full" />
            ))}
          </div>
        ) : totalVisible === 0 ? (
          <EmptyRules onCreate={openNew} filtered={filter !== "all"} />
        ) : (
          <div className="flex flex-col gap-6">
            {SCOPE_ORDER.map((scope) => {
              const items = grouped.get(scope) ?? [];
              if (items.length === 0) return null;
              return (
                <section key={scope}>
                  <div className="mb-2 flex items-center gap-1.5">
                    <span className="caption-upper text-[var(--fg-subtle)]">
                      {SCOPE_LABEL[scope]}
                    </span>
                    <span className="font-mono text-[11px] text-[var(--fg-subtle)]">
                      {items.length}
                    </span>
                  </div>
                  <ul className="divide-y divide-[var(--border)] rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]">
                    {items.map((rule) => (
                      <RuleRow
                        key={rule.id}
                        rule={rule}
                        onEdit={() => openEdit(rule)}
                        onDelete={() => setDeleteTarget(rule)}
                        onToggle={(v) => toggleActive(rule, v)}
                        isToggling={updateMut.isPending}
                      />
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </div>

      <BusinessRuleDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        connectionId={connectionId}
        companyId={companyId}
        rule={editingRule}
      />

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this rule?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.name} will be permanently removed. Queries generated after this
              change will no longer apply this constraint.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMut.isPending}
            >
              {deleteMut.isPending && (
                <Loader2 className="size-3.5 animate-spin" strokeWidth={1.75} />
              )}
              Delete rule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ScopeChips({
  value,
  onChange,
}: {
  value: ScopeFilter;
  onChange: (v: ScopeFilter) => void;
}) {
  const options: { id: ScopeFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "global", label: "Global" },
    { id: "table", label: "Table" },
    { id: "user", label: "User" },
  ];
  return (
    <div className="inline-flex items-center gap-1 rounded-[var(--radius-input)] bg-[var(--surface-muted)] p-0.5">
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`rounded-[6px] px-2.5 py-1 text-[12px] font-medium transition-colors ${
              active
                ? "bg-[var(--surface)] text-[var(--fg)] shadow-token-sm"
                : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function RuleRow({
  rule,
  onEdit,
  onDelete,
  onToggle,
  isToggling,
}: {
  rule: BusinessRule;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (v: boolean) => void;
  isToggling: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = SCOPE_ICON[rule.scope_type];
  return (
    <li className="flex flex-col gap-2 px-4 py-3">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-[4px] text-[var(--fg-subtle)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--fg-muted)]"
          aria-label={expanded ? "Collapse rule text" : "Expand rule text"}
        >
          <ChevronRight
            className={`size-3 transition-transform ${expanded ? "rotate-90" : ""}`}
            strokeWidth={2}
          />
        </button>
        <div className="min-w-0 grow">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="truncate text-[13px] font-medium text-[var(--fg)]">
              {rule.name}
            </span>
            <span className="inline-flex items-center gap-1 rounded-[var(--radius-badge)] bg-[var(--surface-muted)] px-1.5 py-0.5 text-[11px] text-[var(--fg-muted)]">
              <Icon className="size-[11px]" strokeWidth={1.75} />
              {SCOPE_LABEL[rule.scope_type]}
              {rule.scope_value && (
                <span className="font-mono text-[var(--fg-subtle)]">
                  · {rule.scope_value}
                </span>
              )}
            </span>
          </div>
          <p
            className={`mt-1 text-[12px] leading-[18px] text-[var(--fg-muted)] ${
              expanded ? "" : "line-clamp-2"
            }`}
          >
            {rule.rule_text}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Switch
            size="sm"
            checked={rule.is_active}
            onCheckedChange={onToggle}
            disabled={isToggling}
            aria-label={rule.is_active ? "Deactivate rule" : "Activate rule"}
          />
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={onEdit}
            aria-label="Edit rule"
            className="ml-1"
          >
            <Pencil className="size-3" strokeWidth={1.75} />
          </Button>
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={onDelete}
            aria-label="Delete rule"
            className="text-[var(--fg-muted)] hover:text-[var(--destructive)]"
          >
            <Trash2 className="size-3" strokeWidth={1.75} />
          </Button>
        </div>
      </div>
    </li>
  );
}

function EmptyRules({ onCreate, filtered }: { onCreate: () => void; filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-[var(--border)] px-6 py-14 text-center">
      <span className="mb-3 inline-flex size-10 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--fg-subtle)]">
        <ScrollText className="size-5" strokeWidth={1.75} />
      </span>
      <h4 className="font-display text-[14px] font-semibold">
        {filtered ? "No rules in this scope" : "No business rules yet"}
      </h4>
      <p className="mt-1 max-w-[320px] text-[12px] text-[var(--fg-subtle)]">
        {filtered
          ? "Try switching scope, or add a new rule for this context."
          : "Rules teach the assistant domain logic — row exclusions, definitions, preferences — so every query stays on the rails."}
      </p>
      <Button size="sm" onClick={onCreate} className="mt-4">
        <Plus className="size-3.5" strokeWidth={1.75} />
        Add rule
      </Button>
    </div>
  );
}
