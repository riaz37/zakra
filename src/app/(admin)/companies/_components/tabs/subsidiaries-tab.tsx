"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { GitBranch, Loader2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateSubsidiary, useSubsidiaries } from "@/hooks/useCompanies";
import { cn } from "@/lib/utils";
import type { Company } from "@/types";
import { StatusBadge } from "../status-badge";

const subSchema = z.object({
  name: z.string().min(2, "Name too short"),
  slug: z
    .string()
    .min(2, "Slug too short")
    .regex(/^[a-z0-9][a-z0-9-_]*$/i, "Use letters, numbers, - or _"),
});
type SubFormValues = z.infer<typeof subSchema>;

const inputClass =
  "h-9 rounded-[var(--radius-input)] border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[14px] text-[var(--fg)] transition-colors hover:border-[var(--fg-subtle)] focus-visible:border-[var(--primary)] focus-visible:ring-[3px] focus-visible:ring-[var(--ring)] md:text-[14px] dark:bg-[var(--surface)]";

interface SubsidiariesTabProps {
  company: Company;
}

export function SubsidiariesTab({ company }: SubsidiariesTabProps) {
  const subs = useSubsidiaries(company.id, { page: 1, page_size: 60 });
  const create = useCreateSubsidiary(company.id);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SubFormValues>({
    resolver: zodResolver(subSchema as never),
    defaultValues: { name: "", slug: "" },
  });

  const name = watch("name");
  useEffect(() => {
    if (!name) return;
    setValue(
      "slug",
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
      { shouldValidate: true },
    );
  }, [name, setValue]);

  const onSubmit = async (values: SubFormValues) => {
    try {
      await create.mutateAsync(values);
      toast.success("Subsidiary created", { description: values.name });
      reset();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not create subsidiary.";
      toast.error("Create failed", { description: message });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-muted)] p-3"
      >
        <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
          <Field label="Name" error={errors.name?.message}>
            <Input
              {...register("name")}
              placeholder="Acme Europe"
              className={cn(inputClass, "bg-[var(--surface)]")}
            />
          </Field>
          <Field label="Slug" error={errors.slug?.message}>
            <Input
              {...register("slug")}
              placeholder="acme-europe"
              className={cn(inputClass, "bg-[var(--surface)] font-mono")}
            />
          </Field>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary h-9"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-[14px]" strokeWidth={1.75} />
            )}
            Create
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <GitBranch className="size-4 text-[var(--fg-muted)]" strokeWidth={1.75} />
            <span className="text-[13px] font-medium">Subsidiaries</span>
          </div>
          <span className="text-[12px] text-[var(--fg-subtle)]">
            {subs.data?.total ?? 0}
          </span>
        </div>
        {subs.isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="size-5 animate-spin text-[var(--fg-subtle)]" />
          </div>
        ) : subs.data?.items.length ? (
          <ul>
            {subs.data.items.map((s, i, arr) => (
              <li
                key={s.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3",
                  i < arr.length - 1 && "border-b border-[var(--border)]",
                )}
              >
                <span
                  aria-hidden="true"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-[var(--surface-muted)] font-display text-[12px] font-semibold text-[var(--fg-muted)]"
                >
                  {s.name[0]?.toUpperCase() ?? "?"}
                </span>
                <div className="min-w-0 grow">
                  <div className="truncate text-[13px] font-medium text-[var(--fg)]">
                    {s.name}
                  </div>
                  <div className="truncate font-mono text-[11px] text-[var(--fg-muted)]">
                    {s.slug}
                  </div>
                </div>
                <StatusBadge status={s.status} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-8 text-center text-[13px] text-[var(--fg-subtle)]">
            No subsidiaries yet.
          </div>
        )}
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

function Field({ label, error, hint, children }: FieldProps) {
  return (
    <div>
      <Label className="mb-1.5 block text-[13px] font-medium text-[var(--fg-muted)]">
        {label}
      </Label>
      {children}
      {hint && !error && (
        <p className="mt-1 text-[12px] text-[var(--fg-subtle)]">{hint}</p>
      )}
      {error && <p className="mt-1 text-[12px] text-[var(--destructive)]">{error}</p>}
    </div>
  );
}
