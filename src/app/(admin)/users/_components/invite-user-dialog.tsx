"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCreateUser } from "@/hooks/useUsers";
import { useRoles } from "@/hooks/useRoles";
import { cn } from "@/lib/utils";
import type { UserCreate } from "@/types";

export const inviteSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Minimum 8 characters"),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  user_type: z.enum(["admin", "regular"]),
});

export type InviteFormValues = z.infer<typeof inviteSchema>;

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string | undefined;
}

export function InviteUserDialog({
  open,
  onOpenChange,
  companyId,
}: InviteUserDialogProps) {
  const createUser = useCreateUser();
  const rolesQuery = useRoles({ page: 1, page_size: 100 });
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema as never),
    defaultValues: {
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      user_type: "regular",
    },
  });

  useEffect(() => {
    if (!open) {
      reset();
      setSelectedRoles([]);
    }
  }, [open, reset]);

  const userType = watch("user_type");

  const onSubmit = async (values: InviteFormValues) => {
    const payload: UserCreate = {
      email: values.email,
      password: values.password,
      first_name: values.first_name || undefined,
      last_name: values.last_name || undefined,
      user_type: values.user_type,
      company_id: companyId,
    };
    try {
      await createUser.mutateAsync(payload);
      toast.success("User invited", {
        description: `${values.email} has been created.`,
      });
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not create user. Try again.";
      toast.error("Invite failed", { description: message });
    }
  };

  const toggleRole = (id: string) => {
    setSelectedRoles((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-[480px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
          <SheetHeader className="border-b border-[var(--border)] px-6 py-5">
            <SheetTitle className="font-display text-[18px] font-semibold -tracking-[0.01em]">
              Invite a user
            </SheetTitle>
            <SheetDescription className="text-[13px] text-[var(--fg-muted)]">
              They&apos;ll be added to your workspace immediately.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="flex flex-col gap-4">
              <Field label="Email address" error={errors.email?.message}>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="teammate@acme.com"
                  autoComplete="email"
                  className="h-9 rounded-[var(--radius-input)] border-[var(--border-strong)] bg-[var(--surface)]"
                />
              </Field>
              <Field
                label="Temporary password"
                hint="They can change this after their first sign-in."
                error={errors.password?.message}
              >
                <Input
                  {...register("password")}
                  type="password"
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  className="h-9 rounded-[var(--radius-input)] border-[var(--border-strong)] bg-[var(--surface)]"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="First name" error={errors.first_name?.message}>
                  <Input
                    {...register("first_name")}
                    type="text"
                    placeholder="Jane"
                    className="h-9 rounded-[var(--radius-input)] border-[var(--border-strong)] bg-[var(--surface)]"
                  />
                </Field>
                <Field label="Last name" error={errors.last_name?.message}>
                  <Input
                    {...register("last_name")}
                    type="text"
                    placeholder="Doe"
                    className="h-9 rounded-[var(--radius-input)] border-[var(--border-strong)] bg-[var(--surface)]"
                  />
                </Field>
              </div>

              <Field label="User type">
                <Select
                  value={userType}
                  onValueChange={(v) =>
                    setValue("user_type", v as "admin" | "regular")
                  }
                >
                  <SelectTrigger className="h-9 w-full rounded-[var(--radius-input)] border-[var(--border-strong)] bg-[var(--surface)]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Member · default access</SelectItem>
                    <SelectItem value="admin">Admin · can manage workspace</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field
                label={`Roles · optional${selectedRoles.length ? ` (${selectedRoles.length})` : ""}`}
                hint="Roles can be assigned later from the user drawer."
              >
                <div className="flex flex-col gap-1.5 rounded-[var(--radius-input)] border border-[var(--border-strong)] bg-[var(--surface)] p-2 max-h-[180px] overflow-y-auto">
                  {rolesQuery.isLoading ? (
                    <div className="px-2 py-3 text-[13px] text-[var(--fg-subtle)]">
                      Loading roles…
                    </div>
                  ) : rolesQuery.data?.items.length ? (
                    rolesQuery.data.items.map((r) => {
                      const active = selectedRoles.includes(r.id);
                      return (
                        <label
                          key={r.id}
                          className={cn(
                            "flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 transition-colors hover:bg-[var(--surface-muted)]",
                            active && "bg-[var(--primary-soft)]",
                          )}
                        >
                          <Checkbox
                            checked={active}
                            onCheckedChange={() => toggleRole(r.id)}
                          />
                          <div className="min-w-0 grow">
                            <div className="truncate text-[13px] font-medium text-[var(--fg)]">
                              {r.name}
                            </div>
                            {r.description && (
                              <div className="truncate text-[12px] text-[var(--fg-subtle)]">
                                {r.description}
                              </div>
                            )}
                          </div>
                        </label>
                      );
                    })
                  ) : (
                    <div className="px-2 py-3 text-[13px] text-[var(--fg-subtle)]">
                      No roles defined yet.
                    </div>
                  )}
                </div>
              </Field>
            </div>
          </div>

          <SheetFooter className="flex-row justify-end border-t border-[var(--border)] bg-[var(--surface-muted)] px-6 py-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Create user
            </button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
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
      {error && (
        <p className="mt-1 text-[12px] text-[var(--destructive)]">{error}</p>
      )}
    </div>
  );
}
