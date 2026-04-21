"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2, ScrollText } from "lucide-react";
import {
  useCreateBusinessRule,
  useUpdateBusinessRule,
} from "@/hooks/useBusinessRules";
import type {
  BusinessRule,
  BusinessRuleCreate,
  BusinessRuleScopeType,
  BusinessRuleUpdate,
} from "@/types";

interface BusinessRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectionId: string;
  companyId?: string;
  rule?: BusinessRule;
}

const SCOPES: { id: BusinessRuleScopeType; label: string; hint: string }[] = [
  { id: "global", label: "Global", hint: "Applies to every query on this connection" },
  { id: "table", label: "Table", hint: "Applies only when a specific table is referenced" },
  { id: "user", label: "User", hint: "Applies only when a specific user runs the query" },
];

const schema = z
  .object({
    name: z.string().min(1, "Name is required").max(120),
    scope_type: z.enum(["global", "table", "user"]),
    scope_value: z.string().optional(),
    rule_text: z.string().min(10, "Rule text must be at least 10 characters"),
    is_active: z.boolean(),
  })
  .refine(
    (data) => data.scope_type === "global" || (data.scope_value && data.scope_value.length > 0),
    {
      message: "Scope value is required for table and user scopes",
      path: ["scope_value"],
    },
  );

type FormValues = z.infer<typeof schema>;

export function BusinessRuleDialog({
  open,
  onOpenChange,
  connectionId,
  companyId,
  rule,
}: BusinessRuleDialogProps) {
  const isEdit = Boolean(rule);
  const createMut = useCreateBusinessRule(connectionId, companyId);
  const updateMut = useUpdateBusinessRule(connectionId, companyId);

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema as never),
    defaultValues: {
      name: "",
      scope_type: "global",
      scope_value: "",
      rule_text: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      name: rule?.name ?? "",
      scope_type: rule?.scope_type ?? "global",
      scope_value: rule?.scope_value ?? "",
      rule_text: rule?.rule_text ?? "",
      is_active: rule?.is_active ?? true,
    });
  }, [open, rule, reset]);

  const scopeType = watch("scope_type");

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && rule) {
        const payload: BusinessRuleUpdate = {
          name: values.name,
          scope_type: values.scope_type,
          scope_value: values.scope_type === "global" ? undefined : values.scope_value,
          rule_text: values.rule_text,
          is_active: values.is_active,
        };
        await updateMut.mutateAsync({ ruleId: rule.id, data: payload });
        toast.success("Rule updated", { description: values.name });
      } else {
        const payload: BusinessRuleCreate = {
          name: values.name,
          scope_type: values.scope_type,
          scope_value: values.scope_type === "global" ? undefined : values.scope_value,
          rule_text: values.rule_text,
        };
        await createMut.mutateAsync(payload);
        toast.success("Rule created", { description: values.name });
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(isEdit ? "Could not update rule" : "Could not create rule", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const submitting = createMut.isPending || updateMut.isPending;
  const scopeValueLabel =
    scopeType === "table" ? "Table name" : scopeType === "user" ? "User ID" : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[calc(100%-2rem)] gap-0 p-0 sm:max-w-[560px]"
        showCloseButton={false}
      >
        <header className="flex items-start gap-3 border-b border-[var(--border)] px-6 py-5">
          <span className="mt-0.5 inline-flex size-9 items-center justify-center rounded-[10px] bg-[var(--primary-soft)] text-[var(--primary)]">
            <ScrollText className="size-[18px]" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 grow">
            <DialogTitle className="font-display text-[18px] font-semibold leading-[24px] -tracking-[0.01em]">
              {isEdit ? "Edit rule" : "New business rule"}
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-[13px] text-[var(--fg-subtle)]">
              {isEdit
                ? "Update how the assistant interprets this connection."
                : "Teach the assistant a constraint, definition, or preference."}
            </DialogDescription>
          </div>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-6 py-6">
          <Field label="Name" error={errors.name?.message}>
            <Input placeholder="e.g. Always exclude soft-deleted rows" {...register("name")} />
          </Field>

          <Field label="Scope" error={errors.scope_type?.message}>
            <Controller
              control={control}
              name="scope_type"
              render={({ field }) => (
                <div className="grid grid-cols-3 gap-2">
                  {SCOPES.map((s) => {
                    const active = field.value === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => field.onChange(s.id)}
                        className={`flex flex-col items-start gap-1 rounded-[var(--radius-input)] border px-3 py-2.5 text-left transition-all ${
                          active
                            ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                            : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--fg-subtle)]"
                        }`}
                      >
                        <span
                          className={`text-[13px] font-medium ${
                            active ? "text-[var(--primary)]" : "text-[var(--fg)]"
                          }`}
                        >
                          {s.label}
                        </span>
                        <span className="text-[11px] leading-[14px] text-[var(--fg-subtle)]">
                          {s.hint}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </Field>

          {scopeValueLabel && (
            <Field label={scopeValueLabel} error={errors.scope_value?.message}>
              <Input
                className="font-mono"
                placeholder={scopeType === "table" ? "public.orders" : "user-id-123"}
                {...register("scope_value")}
              />
            </Field>
          )}

          <Field label="Rule" error={errors.rule_text?.message}>
            <Textarea
              rows={5}
              placeholder="Describe the rule in plain English. The assistant will apply it when generating SQL."
              {...register("rule_text")}
            />
          </Field>

          {isEdit && (
            <Controller
              control={control}
              name="is_active"
              render={({ field }) => (
                <label
                  htmlFor="rule-active-toggle"
                  className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-input)] bg-[var(--surface-muted)] px-3 py-2.5"
                >
                  <Switch
                    id="rule-active-toggle"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <div className="min-w-0 grow">
                    <div className="text-[13px] font-medium">Active</div>
                    <div className="text-[12px] text-[var(--fg-subtle)]">
                      Inactive rules are kept but not applied to new queries.
                    </div>
                  </div>
                </label>
              )}
            />
          )}
        </form>

        <footer className="flex items-center gap-2 border-t border-[var(--border)] bg-[var(--surface-muted)]/40 px-6 py-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <div className="grow" />
          <Button onClick={handleSubmit(onSubmit)} disabled={submitting}>
            {submitting && <Loader2 className="size-3.5 animate-spin" strokeWidth={1.75} />}
            {isEdit ? "Save rule" : "Create rule"}
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[13px] font-medium text-[var(--fg-muted)]">{label}</Label>
      {children}
      {error && <div className="text-[12px] text-[var(--destructive)]">{error}</div>}
    </div>
  );
}
