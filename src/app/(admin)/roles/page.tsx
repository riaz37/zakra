"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  ChevronRight,
  Hash,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useRoles,
  useRolePermissions,
  usePermissions,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useSetRolePermissions,
} from "@/hooks/useRoles";
import { cn } from "@/lib/utils";
import type { Permission, Role } from "@/types";

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

function humanizeModule(m: string): string {
  return m.charAt(0).toUpperCase() + m.slice(1).replace(/[_-]/g, " ");
}

export default function RolesPage() {
  const roles = useRoles({ page: 1, page_size: 100 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [deleteRole, setDeleteRole] = useState<Role | null>(null);

  // Default to first role once loaded
  useEffect(() => {
    if (!selectedId && roles.data?.items.length) {
      setSelectedId(roles.data.items[0].id);
    }
  }, [roles.data, selectedId]);

  const selectedRole = useMemo(
    () => roles.data?.items.find((r) => r.id === selectedId) ?? null,
    [roles.data, selectedId],
  );

  return (
    <div className="mx-auto max-w-[1440px]">
      <PageHeader
        title="Roles"
        subtitle="Define what each role can do and who inherits it"
        actions={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="btn btn-primary"
          >
            <Plus className="size-[14px]" strokeWidth={1.75} />
            New role
          </button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        {/* Roles list */}
        <aside className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-token-sm">
          <div className="border-b border-[var(--border)] px-4 py-3">
            <div className="caption-upper">Roles</div>
            <div className="mt-0.5 text-[12px] text-[var(--fg-subtle)]">
              {roles.data?.total ?? 0} total
            </div>
          </div>
          <div className="flex max-h-[70vh] flex-col overflow-y-auto p-2">
            {roles.isLoading ? (
              <div className="flex flex-col gap-1 p-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <span key={i} className="skel h-12" />
                ))}
              </div>
            ) : roles.data?.items.length ? (
              roles.data.items.map((r) => {
                const active = r.id === selectedId;
                return (
                  <div
                    key={r.id}
                    className={cn(
                      "group relative flex cursor-pointer items-start gap-2.5 rounded-md px-3 py-2.5 transition-colors",
                      active
                        ? "bg-[var(--primary-soft)]"
                        : "hover:bg-[var(--surface-muted)]",
                    )}
                    onClick={() => setSelectedId(r.id)}
                  >
                    <span
                      className={cn(
                        "mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md",
                        active
                          ? "bg-[var(--primary)] text-[var(--primary-fg)]"
                          : "bg-[var(--surface-muted)] text-[var(--fg-muted)]",
                      )}
                    >
                      <ShieldCheck className="size-3.5" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 grow">
                      <div
                        className={cn(
                          "flex items-center gap-2 truncate text-[13px] font-medium",
                          active ? "text-[var(--primary)]" : "text-[var(--fg)]",
                        )}
                      >
                        {r.name}
                        {r.role_type === "system" && (
                          <span className="inline-flex items-center rounded-[var(--radius-badge)] bg-[var(--surface-muted)] px-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                            System
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 truncate font-mono text-[11px] text-[var(--fg-subtle)]">
                        {r.slug} · L{r.hierarchy_level}
                      </div>
                    </div>

                    <div
                      className="shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <button
                              type="button"
                              aria-label="Role actions"
                              className="inline-flex size-6 items-center justify-center rounded text-[var(--fg-subtle)] opacity-0 transition-opacity hover:bg-[var(--surface)] hover:text-[var(--fg)] group-hover:opacity-100 data-[popup-open]:opacity-100"
                            >
                              <MoreHorizontal className="size-3.5" strokeWidth={1.75} />
                            </button>
                          }
                        />
                        <DropdownMenuContent align="end" className="min-w-[140px]">
                          <DropdownMenuItem onClick={() => setEditRole(r)}>
                            <Pencil className="size-3.5" strokeWidth={1.75} />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            disabled={r.role_type === "system"}
                            onClick={() => setDeleteRole(r)}
                          >
                            <Trash2 className="size-3.5" strokeWidth={1.75} />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {active && (
                      <ChevronRight
                        className="size-4 shrink-0 self-center text-[var(--primary)]"
                        strokeWidth={1.75}
                      />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-2 py-6 text-center text-[13px] text-[var(--fg-subtle)]">
                No roles yet.
              </div>
            )}
          </div>
        </aside>

        {/* Matrix */}
        <section className="min-w-0">
          {selectedRole ? (
            <PermissionMatrix role={selectedRole} />
          ) : (
            <div className="flex h-[60vh] items-center justify-center rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
              <div>
                <div className="mx-auto mb-3 inline-flex size-10 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
                  <ShieldCheck className="size-[18px]" strokeWidth={1.75} />
                </div>
                <h3 className="font-display text-[16px] font-semibold -tracking-[0.01em]">
                  Select a role
                </h3>
                <p className="mt-1 text-[13px] text-[var(--fg-subtle)]">
                  Pick a role from the list to edit its permissions.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      <CreateRoleDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditRoleDialog
        role={editRole}
        onClose={() => setEditRole(null)}
      />
      <DeleteRoleDialog
        role={deleteRole}
        onClose={() => setDeleteRole(null)}
        onDeleted={(id) => {
          if (id === selectedId) setSelectedId(null);
        }}
      />
    </div>
  );
}

/* ------------------------- Permission Matrix ------------------------- */

function PermissionMatrix({ role }: { role: Role }) {
  const perms = usePermissions();
  const rolePerms = useRolePermissions(role.id);
  const setPerms = useSetRolePermissions(role.id);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [baseline, setBaseline] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (rolePerms.data) {
      const ids = new Set(rolePerms.data.map((p) => p.id));
      setSelected(new Set(ids));
      setBaseline(new Set(ids));
    }
  }, [rolePerms.data, role.id]);

  const dirty = useMemo(() => {
    if (selected.size !== baseline.size) return true;
    for (const id of selected) if (!baseline.has(id)) return true;
    return false;
  }, [selected, baseline]);

  const dirtyCount = useMemo(() => {
    const added = [...selected].filter((id) => !baseline.has(id)).length;
    const removed = [...baseline].filter((id) => !selected.has(id)).length;
    return added + removed;
  }, [selected, baseline]);

  const grouped = useMemo(() => {
    if (!perms.data) return [] as { module: string; items: Permission[] }[];
    const byModule = new Map<string, Permission[]>();
    for (const p of perms.data.items) {
      const key = p.module || "other";
      const arr = byModule.get(key) ?? [];
      arr.push(p);
      byModule.set(key, arr);
    }
    return [...byModule.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([module, items]) => ({
        module,
        items: items.sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }, [perms.data]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllInModule = (items: Permission[], allOn: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const p of items) {
        if (allOn) next.delete(p.id);
        else next.add(p.id);
      }
      return next;
    });
  };

  const onSave = async () => {
    try {
      await setPerms.mutateAsync({ permission_ids: [...selected] });
      setBaseline(new Set(selected));
      toast.success("Permissions saved", {
        description: `${role.name} updated with ${dirtyCount} ${dirtyCount === 1 ? "change" : "changes"}.`,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not save permissions.";
      toast.error("Save failed", { description: message });
    }
  };

  const onDiscard = () => setSelected(new Set(baseline));

  return (
    <div className="relative">
      {/* Header card */}
      <div className="mb-4 flex flex-wrap items-center gap-4 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-token-sm">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--primary-soft)] text-[var(--primary)]">
          <ShieldCheck className="size-[18px]" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 grow">
          <h2 className="font-display text-[18px] font-semibold -tracking-[0.01em]">
            {role.name}
          </h2>
          <div className="mt-0.5 font-mono text-[12px] text-[var(--fg-muted)]">
            {role.slug}
          </div>
          {role.description && (
            <p className="mt-2 text-[13px] text-[var(--fg-muted)] max-w-[68ch]">
              {role.description}
            </p>
          )}
        </div>
        <dl className="grid grid-cols-3 gap-6 sm:min-w-[260px]">
          <Stat label="Level" value={`L${role.hierarchy_level}`} />
          <Stat
            label="Default"
            value={role.is_default ? "Yes" : "No"}
          />
          <Stat
            label="Type"
            value={role.role_type.replace("_", " ")}
          />
        </dl>
      </div>

      {/* Matrix card */}
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-token-sm">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div>
            <h3 className="font-display text-[16px] font-semibold -tracking-[0.01em]">
              Permissions
            </h3>
            <div className="mt-0.5 text-[12px] text-[var(--fg-subtle)]">
              {selected.size} of {perms.data?.total ?? 0} enabled
            </div>
          </div>
        </div>

        {perms.isLoading || rolePerms.isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="size-5 animate-spin text-[var(--fg-subtle)]" />
          </div>
        ) : grouped.length === 0 ? (
          <div className="px-5 py-12 text-center text-[13px] text-[var(--fg-subtle)]">
            No permissions available.
          </div>
        ) : (
          <div>
            {grouped.map(({ module, items }, gi) => {
              const allOn = items.every((p) => selected.has(p.id));
              return (
                <div key={module}>
                  <div className="sticky top-0 z-[1] flex items-center gap-3 border-b border-[var(--border)] bg-[var(--surface-muted)] px-5 py-2.5">
                    <Hash className="size-3.5 text-[var(--fg-subtle)]" strokeWidth={1.75} />
                    <div className="text-[13px] font-semibold text-[var(--fg)]">
                      {humanizeModule(module)}
                    </div>
                    <span className="text-[11px] text-[var(--fg-subtle)]">
                      {items.filter((p) => selected.has(p.id)).length}/{items.length}
                    </span>
                    <div className="grow" />
                    <button
                      type="button"
                      onClick={() => toggleAllInModule(items, allOn)}
                      className="inline-flex h-6 items-center rounded-md px-2 text-[11px] font-medium text-[var(--fg-muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--fg)]"
                    >
                      {allOn ? "Clear all" : "Enable all"}
                    </button>
                  </div>
                  {items.map((p, ci) => {
                    const isOn = selected.has(p.id);
                    const inBaseline = baseline.has(p.id);
                    const rowDirty = isOn !== inBaseline;
                    const isLast =
                      gi === grouped.length - 1 && ci === items.length - 1;
                    return (
                      <label
                        key={p.id}
                        className={cn(
                          "grid cursor-pointer grid-cols-[1fr_auto] items-start gap-4 px-5 py-3 transition-colors",
                          !isLast && "border-b border-[var(--border)]",
                          rowDirty && "bg-[var(--primary-soft)]/40",
                        )}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-medium text-[var(--fg)]">
                              {p.name}
                            </span>
                            <span className="font-mono text-[11px] text-[var(--fg-subtle)]">
                              {p.resource_type}:{p.action}
                            </span>
                          </div>
                          {p.description && (
                            <div className="mt-0.5 text-[12px] text-[var(--fg-muted)]">
                              {p.description}
                            </div>
                          )}
                        </div>
                        <Checkbox
                          checked={isOn}
                          onCheckedChange={() => toggle(p.id)}
                          className="mt-1"
                        />
                      </label>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky save bar */}
      {dirty && (
        <div className="pointer-events-none sticky bottom-4 z-20 mt-4 flex justify-center">
          <div className="pointer-events-auto flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 shadow-token-lg">
            <span
              className="inline-block size-2 rounded-full bg-[var(--warning)]"
              aria-hidden="true"
            />
            <span className="text-[13px] text-[var(--fg)]">
              <strong className="font-semibold">{dirtyCount}</strong>{" "}
              {dirtyCount === 1 ? "change" : "changes"} pending
            </span>
            <div className="h-5 w-px bg-[var(--border)]" />
            <button
              type="button"
              onClick={onDiscard}
              disabled={setPerms.isPending}
              className="btn btn-ghost btn-sm"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={setPerms.isPending}
              className="btn btn-primary btn-sm"
            >
              {setPerms.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" strokeWidth={1.75} />
              )}
              Save changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="caption-upper mb-1">{label}</dt>
      <dd className="font-display text-[16px] font-semibold capitalize -tracking-[0.01em] text-[var(--fg)]">
        {value}
      </dd>
    </div>
  );
}

/* ---------------------------- Create Dialog ---------------------------- */

const INPUT_CLASSES =
  "h-9 w-full rounded-[var(--radius-input)] border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[14px] text-[var(--fg)] outline-none transition-colors placeholder:text-[var(--fg-subtle)] hover:border-[var(--fg-subtle)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--ring)]";

function CreateRoleDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
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
              <input
                {...register("name")}
                placeholder="Billing operator"
                className={INPUT_CLASSES}
              />
            </Field>
            <Field
              label="Slug"
              hint="Lowercase identifier used in API calls."
              error={errors.slug?.message}
            >
              <input
                {...register("slug")}
                placeholder="billing-operator"
                className={cn(INPUT_CLASSES, "font-mono")}
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
                <input
                  {...register("hierarchy_level", { valueAsNumber: true })}
                  type="number"
                  min={0}
                  max={1000}
                  className={INPUT_CLASSES}
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

/* ----------------------------- Edit Dialog ----------------------------- */

function EditRoleDialog({
  role,
  onClose,
}: {
  role: Role | null;
  onClose: () => void;
}) {
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
              <input {...register("name")} className={INPUT_CLASSES} />
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
                <input
                  {...register("hierarchy_level", { valueAsNumber: true })}
                  type="number"
                  min={0}
                  max={1000}
                  className={INPUT_CLASSES}
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

/* ---------------------------- Delete Dialog ---------------------------- */

function DeleteRoleDialog({
  role,
  onClose,
  onDeleted,
}: {
  role: Role | null;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const del = useDeleteRole();

  const onConfirm = async () => {
    if (!role) return;
    try {
      await del.mutateAsync(role.id);
      toast.success("Role deleted", { description: `${role.name} has been removed.` });
      onDeleted(role.id);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not delete role.";
      toast.error("Delete failed", { description: message });
    }
  };

  return (
    <Dialog open={!!role} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="font-display text-[18px] font-semibold -tracking-[0.01em]">
            Delete this role?
          </DialogTitle>
          <DialogDescription>
            Users with <span className="font-medium">{role?.name}</span> lose its
            permissions. This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="-mx-4 -mb-4 mt-2 border-t bg-[var(--surface-muted)]">
          <button type="button" onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={del.isPending}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-[var(--radius-btn)] bg-[var(--destructive)] px-3.5 text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {del.isPending && <Loader2 className="size-4 animate-spin" />}
            Delete role
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------- Field -------------------------------- */

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
