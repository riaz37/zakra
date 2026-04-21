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
import { useUpdateRole } from "@/hooks/useRoles";
import type { Role } from "@/types";

const editSchema = z.object({
  name: z.string().min(2, "Name too short"),
  description: z.string().max(280).optional(),
  hierarchy_level: z
    .number({ error: "Must be a number" })
    .int()
    .min(0)
    .max(1000),
  is_default: z.boolean(),
});

type EditFormValues = z.infer<typeof editSchema>;

interface EditRoleDialogProps {
  role: Role | null;
  onClose: () => void;
}

export function EditRoleDialog({ role, onClose }: EditRoleDialogProps) {
  const update = useUpdateRole(role?.id ?? "");
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema as never),
    defaultValues: {
      name: "",
      description: "",
      hierarchy_level: 10,
      is_default: false,
    },
  });

  useEffect(() => {
    if (role) {
      reset({
        name: role.name,
        description: role.description ?? "",
        hierarchy_level: role.hierarchy_level,
        is_default: role.is_default,
      });
    }
  }, [role, reset]);

  const onSubmit = async (values: EditFormValues) => {
    if (!role) return;
    try {
      await update.mutateAsync({
        name: values.name,
        description: values.description || undefined,
        hierarchy_level: values.hierarchy_level,
        is_default: values.is_default,
      });
      toast.success("Role updated");
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not update role.";
      toast.error("Update failed", { description: message });
    }
  };

  const isDefault = watch("is_default");

  return (
    <Dialog open={!!role} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="font-display text-[18px] font-semibold -tracking-[0.01em]">
              Edit role
            </DialogTitle>
            <DialogDescription>
              Update role metadata. Permissions are edited in the matrix.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex flex-col gap-4">
            <Field label="Name" error={errors.name?.message}>
              <Input {...register("name")} />
            </Field>
            <Field label="Description" error={errors.description?.message}>
              <Textarea
                {...register("description")}
                className="min-h-[72px] rounded-[var(--radius-input)] border-[var(--border-strong)]"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Hierarchy level"
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
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Save changes
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
