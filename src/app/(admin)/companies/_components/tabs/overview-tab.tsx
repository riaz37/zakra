"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateCompany } from "@/hooks/useCompanies";
import type { Company, CompanyUpdate } from "@/types";

const inputClass =
  "h-9 rounded-[var(--radius-input)] border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[14px] text-[var(--fg)] transition-colors hover:border-[var(--fg-subtle)] focus-visible:border-[var(--primary)] focus-visible:ring-[3px] focus-visible:ring-[var(--ring)] md:text-[14px] dark:bg-[var(--surface)]";

const selectClass =
  "h-9 w-full rounded-[var(--radius-input)] border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[14px] text-[var(--fg)] outline-none transition-colors hover:border-[var(--fg-subtle)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--ring)]";

interface OverviewTabProps {
  company: Company;
}

export function OverviewTab({ company }: OverviewTabProps) {
  const update = useUpdateCompany(company.id);
  const [form, setForm] = useState<CompanyUpdate>({
    name: company.name,
    description: company.description ?? undefined,
    domain: company.domain ?? undefined,
    industry: company.industry ?? undefined,
    size: company.size ?? undefined,
    address: company.address ?? undefined,
    country: company.country ?? undefined,
    status: company.status,
  });

  useEffect(() => {
    setForm({
      name: company.name,
      description: company.description ?? undefined,
      domain: company.domain ?? undefined,
      industry: company.industry ?? undefined,
      size: company.size ?? undefined,
      address: company.address ?? undefined,
      country: company.country ?? undefined,
      status: company.status,
    });
  }, [company]);

  const baseline: CompanyUpdate = {
    name: company.name,
    description: company.description ?? undefined,
    domain: company.domain ?? undefined,
    industry: company.industry ?? undefined,
    size: company.size ?? undefined,
    address: company.address ?? undefined,
    country: company.country ?? undefined,
    status: company.status,
  };

  const dirty = JSON.stringify(form) !== JSON.stringify(baseline);

  const onSave = async () => {
    try {
      await update.mutateAsync(form);
      toast.success("Company updated");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not update company.";
      toast.error("Update failed", { description: message });
    }
  };

  const set = <K extends keyof CompanyUpdate>(k: K, v: CompanyUpdate[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Name">
          <Input
            value={form.name ?? ""}
            onChange={(e) => set("name", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Status">
          <select
            value={form.status ?? "active"}
            onChange={(e) =>
              set("status", e.target.value as Company["status"])
            }
            className={selectClass}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </Field>
      </div>
      <Field label="Description">
        <Textarea
          value={form.description ?? ""}
          onChange={(e) => set("description", e.target.value)}
          className="min-h-[80px] rounded-[var(--radius-input)] border-[var(--border-strong)]"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Domain">
          <Input
            value={form.domain ?? ""}
            onChange={(e) => set("domain", e.target.value)}
            placeholder="acme.com"
            className={inputClass}
          />
        </Field>
        <Field label="Industry">
          <Input
            value={form.industry ?? ""}
            onChange={(e) => set("industry", e.target.value)}
            placeholder="Finance"
            className={inputClass}
          />
        </Field>
        <Field label="Size">
          <Input
            value={form.size ?? ""}
            onChange={(e) => set("size", e.target.value)}
            placeholder="50-200"
            className={inputClass}
          />
        </Field>
        <Field label="Country">
          <Input
            value={form.country ?? ""}
            onChange={(e) => set("country", e.target.value)}
            placeholder="US"
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Address">
        <Textarea
          value={form.address ?? ""}
          onChange={(e) => set("address", e.target.value)}
          className="min-h-[60px] rounded-[var(--radius-input)] border-[var(--border-strong)]"
        />
      </Field>

      <div className="sticky bottom-0 -mx-6 flex items-center justify-end gap-2 border-t border-[var(--border)] bg-[var(--surface-muted)] px-6 py-3">
        <span className="mr-auto text-[12px] text-[var(--fg-subtle)]">
          {dirty ? "Unsaved changes" : "Up to date"}
        </span>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={!dirty || update.isPending}
          onClick={() =>
            setForm({
              name: company.name,
              description: company.description ?? undefined,
              domain: company.domain ?? undefined,
              industry: company.industry ?? undefined,
              size: company.size ?? undefined,
              address: company.address ?? undefined,
              country: company.country ?? undefined,
              status: company.status,
            })
          }
        >
          Discard
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!dirty || update.isPending}
          onClick={onSave}
        >
          {update.isPending && <Loader2 className="size-4 animate-spin" />}
          Save changes
        </button>
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
