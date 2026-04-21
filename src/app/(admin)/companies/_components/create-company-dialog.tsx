"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCompany } from "@/hooks/useCompanies";
import { cn } from "@/lib/utils";

const createSchema = z.object({
  name: z.string().min(2, "Name too short"),
  slug: z
    .string()
    .min(2, "Slug too short")
    .regex(/^[a-z0-9][a-z0-9-_]*$/i, "Use letters, numbers, - or _"),
  description: z.string().max(280).optional(),
  domain: z.string().max(120).optional(),
  industry: z.string().max(80).optional(),
});
type CreateFormValues = z.infer<typeof createSchema>;

const inputClass =
  "h-9 rounded-[var(--radius-input)] border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[14px] text-[var(--fg)] transition-colors hover:border-[var(--fg-subtle)] focus-visible:border-[var(--primary)] focus-visible:ring-[3px] focus-visible:ring-[var(--ring)] md:text-[14px] dark:bg-[var(--surface)]";

interface CreateCompanyDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function CreateCompanyDialog({
  open,
  onOpenChange,
}: CreateCompanyDialogProps) {
  const create = useCreateCompany();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema as never),
    defaultValues: { name: "", slug: "", description: "", domain: "", industry: "" },
  });

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

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

  const onSubmit = async (values: CreateFormValues) => {
    try {
      await create.mutateAsync({
        name: values.name,
        slug: values.slug,
        description: values.description || undefined,
        domain: values.domain || undefined,
        industry: values.industry || undefined,
      });
      toast.success("Company created", { description: `${values.name} is ready.` });
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not create company.";
      toast.error("Create failed", { description: message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="font-display text-[18px] font-semibold -tracking-[0.01em]">
              New company
            </DialogTitle>
            <DialogDescription>
              Each company is a tenant. You can add subsidiaries and members later.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex flex-col gap-4">
            <Field label="Name" error={errors.name?.message}>
              <Input
                {...register("name")}
                placeholder="Acme Inc."
                className={inputClass}
              />
            </Field>
            <Field
              label="Slug"
              hint="Lowercase identifier used in URLs."
              error={errors.slug?.message}
            >
              <Input
                {...register("slug")}
                placeholder="acme"
                className={cn(inputClass, "font-mono")}
              />
            </Field>
            <Field label="Description" error={errors.description?.message}>
              <Textarea
                {...register("description")}
                placeholder="One-line summary of this tenant."
                className="min-h-[72px] rounded-[var(--radius-input)] border-[var(--border-strong)]"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Primary domain" error={errors.domain?.message}>
                <Input
                  {...register("domain")}
                  placeholder="acme.com"
                  className={inputClass}
                />
              </Field>
              <Field label="Industry" error={errors.industry?.message}>
                <Input
                  {...register("industry")}
                  placeholder="Finance"
                  className={inputClass}
                />
              </Field>
            </div>
          </div>

          <DialogFooter className="mt-4 -mx-4 -mb-4 border-t bg-[var(--surface-muted)]">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Create company
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
