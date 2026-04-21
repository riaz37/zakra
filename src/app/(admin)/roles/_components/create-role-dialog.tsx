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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCreateRole } from "@/hooks/useRoles";

const createSchema = z.object({
  name: z.string().min(2, "Name too short"),
  slug: z
    .string()
    .min(2, "Slug too short")
    .regex(/^[a-z0-9][a-z0-9-_]*$/i, "Use letters, numbers, - or _"),
  description: z.string().max(280).optional(),
  hierarchy_level: z
    .number({ error: "Must be a number" })
    .int()
    .min(0)
    .max(1000),
  is_default: z.boolean(),
});

type CreateFormValues = z.infer<typeof createSchema>;

interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function CreateRoleDialog({
  open,
  onOpenChange,
}: CreateRoleDialogProps) {
  const create = useCreateRole();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema as never),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      hierarchy_level: 10,
      is_default: false,
    },
  });

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const name = watch("name");
  useEffect(() => {
    if (!name) return;
    const auto = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setValue("slug", auto, { shouldValidate: true });
  }, [name, setValue]);

  const onSubmit = async (values: CreateFormValues) => {
    try {
      await create.mutateAsync({
        name: values.name,
        slug: values.slug,
        description: values.description || undefined,
        hierarchy_level: values.hierarchy_level,
        is_default: values.is_default,
      });
      toast.success("Role created", { description: `${values.name} is ready.` });
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not create role.";
      toast.error("Create failed", { description: message });
    }
  };

  const isDefault = watch("is_default");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="font-display text-[18px] font-semibold -tracking-[0.01em]">
              New role
            </DialogTitle>
            <DialogDescription>
              Roles group permissions for users. You can tune permissions after
              creating it.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex flex-col gap-4">
            <Field label="Name" error={errors.name?.message}>
              <Input
                {...register("name")}
                placeholder="Billing operator"
              />
            </Field>
            <Field
              label="Slug"
              hint="Lowercase identifier used in API calls."
              error={errors.slug?.message}
            >
              <Input
                {...register("slug")}
                placeholder="billing-operator"
                className="font-mono"
              />
            </Field>
            <Field label="Description" error={errors.description?.message}>
              <Textarea
                {...register("description")}
                placeholder="Who gets this role and what they can do."
                className="min-h-[72px] rounded-[var(--radius-input)] border-[var(--border-strong)]"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Hierarchy level"
                hint="Higher levels override lower ones."
                error={errors.hierarchy_level?.message}
              >
                <Input
                  {...register("hierarchy_level", { valueAsNumber: true })}
                  type="number"
                  min={0}
                  max={1000}
                />
              </Field>
              <Field label="Default role">
                <label className="flex h-9 items-center justify-between rounded-[var(--radius-input)] border border-[var(--border-strong)] bg-[var(--surface)] px-3">
                  <span className="text-[13px] text-[var(--fg-muted)]">
                    Assign to new users
                  </span>
                  <Switch
                    checked={isDefault}
                    onCheckedChange={(v) => setValue("is_default", v)}
                  />
                </label>
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
              Create role
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
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
