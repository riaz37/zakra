"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Building2,
  ChevronDown,
  ExternalLink,
  GitBranch,
  Loader2,
  Plus,
  Users as UsersIcon,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { StatusDot } from "@/components/admin/status-dot";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCompanies,
  useSubsidiaries,
  useCompanyUsers,
  useCreateCompany,
  useCreateSubsidiary,
  useUpdateCompany,
  useAddUserToCompany,
  useRemoveUserFromCompany,
} from "@/hooks/useCompanies";
import { useUsers } from "@/hooks/useUsers";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import type { Company, CompanyUpdate } from "@/types";
import type { User } from "@/types/user";

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

const subSchema = z.object({
  name: z.string().min(2, "Name too short"),
  slug: z
    .string()
    .min(2, "Slug too short")
    .regex(/^[a-z0-9][a-z0-9-_]*$/i, "Use letters, numbers, - or _"),
});
type SubFormValues = z.infer<typeof subSchema>;

const INPUT_CLASSES =
  "h-9 w-full rounded-[var(--radius-input)] border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[14px] text-[var(--fg)] outline-none transition-colors placeholder:text-[var(--fg-subtle)] hover:border-[var(--fg-subtle)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--ring)]";

function StatusBadge({ status }: { status: Company["status"] }) {
  const map = {
    active: { dot: "live", bg: "bg-[var(--primary-soft)]", fg: "text-[var(--primary)]", label: "Active" },
    inactive: { dot: "idle", bg: "bg-[var(--surface-muted)]", fg: "text-[var(--fg-muted)]", label: "Inactive" },
    suspended: { dot: "failed", bg: "bg-[var(--destructive-soft)]", fg: "text-[var(--destructive)]", label: "Suspended" },
  } as const;
  const v = map[status];
  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center gap-1.5 rounded-[var(--radius-badge)] px-2 text-[12px] font-medium",
        v.bg,
        v.fg,
      )}
    >
      <StatusDot status={v.dot} />
      {v.label}
    </span>
  );
}

export default function CompaniesPage() {
  const companies = useCompanies({ page: 1, page_size: 60 });
  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const selected = useMemo(
    () => companies.data?.items.find((c) => c.id === detailId) ?? null,
    [companies.data, detailId],
  );

  return (
    <div className="mx-auto max-w-[1440px]">
      <PageHeader
        title="Companies"
        subtitle={
          companies.data
            ? `${companies.data.total.toLocaleString()} in your tenancy`
            : "Tenants using this workspace"
        }
        actions={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="btn btn-primary"
          >
            <Plus className="size-[14px]" strokeWidth={1.75} />
            New company
          </button>
        }
      />

      {companies.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="skel h-[148px] rounded-[var(--radius-card)]"
            />
          ))}
        </div>
      ) : companies.data?.items.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.data.items.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setDetailId(c.id)}
              className="group flex flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 text-left shadow-token-sm transition-all hover:border-[var(--primary)] hover:shadow-token-md"
            >
              <div className="flex items-start gap-3">
                <span
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-[var(--primary-soft)] font-display text-[18px] font-semibold text-[var(--primary)]"
                  aria-hidden="true"
                >
                  {c.name[0]?.toUpperCase() ?? "?"}
                </span>
                <div className="min-w-0 grow">
                  <div className="flex items-start gap-2">
                    <h3 className="min-w-0 truncate font-display text-[16px] font-semibold -tracking-[0.01em]">
                      {c.name}
                    </h3>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="truncate font-mono text-[12px] text-[var(--fg-muted)]">
                      {c.slug}
                    </span>
                    {c.company_type === "subsidiary" && (
                      <span className="inline-flex items-center gap-1 rounded-[var(--radius-badge)] bg-[var(--surface-muted)] px-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
                        <GitBranch className="size-2.5" strokeWidth={2} />
                        Subsidiary
                      </span>
                    )}
                  </div>
                </div>
                <StatusBadge status={c.status} />
              </div>

              {c.description && (
                <p className="line-clamp-2 text-[13px] leading-5 text-[var(--fg-muted)]">
                  {c.description}
                </p>
              )}

              <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-[var(--border)] pt-3">
                <Mini label="Subsidiaries" value={c.subsidiaries?.length ?? 0} />
                <Mini label="Members" value={c.user_count ?? 0} />
                <Mini label="Admins" value={c.admin_count ?? 0} />
              </dl>

              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[var(--fg-subtle)]">
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-[var(--primary)] opacity-0 transition-opacity group-hover:opacity-100">
                  Open <ExternalLink className="size-3" strokeWidth={1.75} />
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-12 text-center shadow-token-sm">
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
            <Building2 className="size-[18px]" strokeWidth={1.75} />
          </span>
          <h3 className="font-display text-[16px] font-semibold -tracking-[0.01em]">
            No companies yet
          </h3>
          <p className="max-w-sm text-[13px] text-[var(--fg-subtle)]">
            Add your first tenant to start assigning users and connections.
          </p>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="btn btn-primary mt-1"
          >
            <Plus className="size-[14px]" strokeWidth={1.75} />
            New company
          </button>
        </div>
      )}

      <CreateCompanyDialog open={createOpen} onOpenChange={setCreateOpen} />

      <CompanyDrawer
        company={selected}
        open={!!selected}
        onClose={() => setDetailId(null)}
      />
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="caption-upper text-[10px] tracking-[0.08em]">{label}</div>
      <div className="mt-0.5 font-display text-[16px] font-semibold -tracking-[0.01em] text-[var(--fg)]">
        {value}
      </div>
    </div>
  );
}

/* ---------------------------- Create Dialog ---------------------------- */

function CreateCompanyDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
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
              <input {...register("name")} placeholder="Acme Inc." className={INPUT_CLASSES} />
            </Field>
            <Field
              label="Slug"
              hint="Lowercase identifier used in URLs."
              error={errors.slug?.message}
            >
              <input
                {...register("slug")}
                placeholder="acme"
                className={cn(INPUT_CLASSES, "font-mono")}
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
                <input
                  {...register("domain")}
                  placeholder="acme.com"
                  className={INPUT_CLASSES}
                />
              </Field>
              <Field label="Industry" error={errors.industry?.message}>
                <input
                  {...register("industry")}
                  placeholder="Finance"
                  className={INPUT_CLASSES}
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

/* ---------------------------- Company Drawer ---------------------------- */

function CompanyDrawer({
  company,
  open,
  onClose,
}: {
  company: Company | null;
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    if (open) setTab("overview");
  }, [open, company?.id]);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-[720px]">
        {company ? (
          <div className="flex h-full flex-col">
            <SheetHeader className="border-b border-[var(--border)] px-6 py-5">
              <div className="flex items-start gap-3.5">
                <span
                  aria-hidden="true"
                  className="inline-flex size-12 shrink-0 items-center justify-center rounded-[12px] bg-[var(--primary-soft)] font-display text-[18px] font-semibold text-[var(--primary)]"
                >
                  {company.name[0]?.toUpperCase() ?? "?"}
                </span>
                <div className="min-w-0 grow">
                  <SheetTitle className="font-display text-[18px] font-semibold -tracking-[0.01em]">
                    {company.name}
                  </SheetTitle>
                  <SheetDescription className="mt-0.5 font-mono text-[12px] text-[var(--fg-muted)]">
                    {company.slug}
                  </SheetDescription>
                  <div className="mt-2 flex items-center gap-2">
                    <StatusBadge status={company.status} />
                    {company.company_type === "subsidiary" && (
                      <span className="inline-flex items-center gap-1 rounded-[var(--radius-badge)] bg-[var(--surface-muted)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                        <GitBranch className="size-2.5" strokeWidth={2} />
                        Subsidiary
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </SheetHeader>

            <Tabs
              value={tab}
              onValueChange={(v: string) => setTab(v)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="border-b border-[var(--border)] bg-[var(--surface)] px-6">
                <TabsList
                  variant="line"
                  className="h-11 w-full justify-start gap-4 rounded-none bg-transparent p-0"
                >
                  <TabsTrigger
                    value="overview"
                    className="h-11 rounded-none border-0 px-0 text-[13px] font-medium data-active:text-[var(--primary)] after:bg-[var(--primary)]"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="members"
                    className="h-11 rounded-none border-0 px-0 text-[13px] font-medium data-active:text-[var(--primary)] after:bg-[var(--primary)]"
                  >
                    Members
                  </TabsTrigger>
                  <TabsTrigger
                    value="subsidiaries"
                    className="h-11 rounded-none border-0 px-0 text-[13px] font-medium data-active:text-[var(--primary)] after:bg-[var(--primary)]"
                  >
                    Subsidiaries
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                <TabsContent value="overview" className="m-0">
                  <OverviewTab company={company} />
                </TabsContent>
                <TabsContent value="members" className="m-0">
                  <MembersTab company={company} />
                </TabsContent>
                <TabsContent value="subsidiaries" className="m-0">
                  <SubsidiariesTab company={company} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

/* ---------------------------- Overview Tab ---------------------------- */

function OverviewTab({ company }: { company: Company }) {
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
          <input
            value={form.name ?? ""}
            onChange={(e) => set("name", e.target.value)}
            className={INPUT_CLASSES}
          />
        </Field>
        <Field label="Status">
          <select
            value={form.status ?? "active"}
            onChange={(e) =>
              set("status", e.target.value as Company["status"])
            }
            className={INPUT_CLASSES}
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
          <input
            value={form.domain ?? ""}
            onChange={(e) => set("domain", e.target.value)}
            placeholder="acme.com"
            className={INPUT_CLASSES}
          />
        </Field>
        <Field label="Industry">
          <input
            value={form.industry ?? ""}
            onChange={(e) => set("industry", e.target.value)}
            placeholder="Finance"
            className={INPUT_CLASSES}
          />
        </Field>
        <Field label="Size">
          <input
            value={form.size ?? ""}
            onChange={(e) => set("size", e.target.value)}
            placeholder="50-200"
            className={INPUT_CLASSES}
          />
        </Field>
        <Field label="Country">
          <input
            value={form.country ?? ""}
            onChange={(e) => set("country", e.target.value)}
            placeholder="US"
            className={INPUT_CLASSES}
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

/* ---------------------------- Members Tab ---------------------------- */

function MembersTab({ company }: { company: Company }) {
  const members = useCompanyUsers(company.id, { page: 1, page_size: 100 });
  const add = useAddUserToCompany(company.id);
  const remove = useRemoveUserFromCompany(company.id);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const userId = selectedUser?.id ?? "";

  const memberIds = useMemo(
    () => new Set((members.data?.items ?? []).map((m) => m.id)),
    [members.data],
  );

  const onAdd = async () => {
    const id = userId.trim();
    if (!id) return;
    try {
      await add.mutateAsync({ userId: id });
      toast.success("Member added");
      setSelectedUser(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not add member.";
      toast.error("Add failed", { description: message });
    }
  };

  const onRemove = async (uid: string, email: string) => {
    try {
      await remove.mutateAsync(uid);
      toast.success("Member removed", { description: email });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not remove member.";
      toast.error("Remove failed", { description: message });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-2 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-muted)] p-3">
        <div className="min-w-0 grow">
          <Label className="mb-1 block text-[12px] font-medium text-[var(--fg-muted)]">
            Add member
          </Label>
          <UserPicker
            selected={selectedUser}
            onSelect={setSelectedUser}
            excludeIds={memberIds}
          />
        </div>
        <button
          type="button"
          onClick={onAdd}
          disabled={!userId || add.isPending}
          className="btn btn-primary"
        >
          {add.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-[14px]" strokeWidth={1.75} />
          )}
          Add
        </button>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <UsersIcon className="size-4 text-[var(--fg-muted)]" strokeWidth={1.75} />
            <span className="text-[13px] font-medium">Members</span>
          </div>
          <span className="text-[12px] text-[var(--fg-subtle)]">
            {members.data?.total ?? 0}
          </span>
        </div>
        {members.isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="size-5 animate-spin text-[var(--fg-subtle)]" />
          </div>
        ) : members.data?.items.length ? (
          <ul>
            {members.data.items.map((m, i, arr) => (
              <li
                key={m.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3",
                  i < arr.length - 1 && "border-b border-[var(--border)]",
                )}
              >
                <span
                  aria-hidden="true"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] font-display text-[12px] font-semibold text-[var(--primary)]"
                >
                  {((m.first_name?.[0] ?? "") + (m.last_name?.[0] ?? "") ||
                    m.email[0] ||
                    "U").toUpperCase()}
                </span>
                <div className="min-w-0 grow">
                  <div className="truncate text-[13px] font-medium text-[var(--fg)]">
                    {[m.first_name, m.last_name].filter(Boolean).join(" ") ||
                      m.email.split("@")[0]}
                  </div>
                  <div className="truncate font-mono text-[11px] text-[var(--fg-muted)]">
                    {m.email}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(m.id, m.email)}
                  disabled={remove.isPending}
                  className="inline-flex size-7 items-center justify-center rounded-md text-[var(--fg-subtle)] hover:bg-[var(--destructive-soft)] hover:text-[var(--destructive)]"
                  aria-label={`Remove ${m.email}`}
                >
                  <X className="size-3.5" strokeWidth={1.75} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-8 text-center text-[13px] text-[var(--fg-subtle)]">
            No members yet.
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------- Subsidiaries Tab -------------------------- */

function SubsidiariesTab({ company }: { company: Company }) {
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
            <input
              {...register("name")}
              placeholder="Acme Europe"
              className={cn(INPUT_CLASSES, "bg-[var(--surface)]")}
            />
          </Field>
          <Field label="Slug" error={errors.slug?.message}>
            <input
              {...register("slug")}
              placeholder="acme-europe"
              className={cn(INPUT_CLASSES, "bg-[var(--surface)] font-mono")}
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

/* ------------------------------ User Picker ----------------------------- */

function displayName(u: User): string {
  const full = [u.first_name, u.last_name].filter(Boolean).join(" ").trim();
  return full || u.email.split("@")[0];
}

function userInitials(u: User): string {
  const a = u.first_name?.[0] ?? "";
  const b = u.last_name?.[0] ?? "";
  const fallback = u.email[0] ?? "U";
  return ((a + b) || fallback).toUpperCase();
}

function UserPicker({
  selected,
  onSelect,
  excludeIds,
}: {
  selected: User | null;
  onSelect: (user: User | null) => void;
  excludeIds: Set<string>;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 250);

  const search = debouncedQuery.trim();
  const users = useUsers({
    page: 1,
    page_size: 50,
    ...(search ? { search } : {}),
  });

  const candidates = useMemo(() => {
    const items = users.data?.items ?? [];
    return items.filter((u) => !excludeIds.has(u.id));
  }, [users.data, excludeIds]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label="Select user"
            className={cn(
              INPUT_CLASSES,
              "flex items-center justify-between gap-2 bg-[var(--surface)] text-left",
            )}
          >
            {selected ? (
              <span className="flex min-w-0 items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] font-display text-[10px] font-semibold text-[var(--primary)]"
                >
                  {userInitials(selected)}
                </span>
                <span className="min-w-0 truncate text-[14px] text-[var(--fg)]">
                  {displayName(selected)}{" "}
                  <span className="font-mono text-[12px] text-[var(--fg-muted)]">
                    &lt;{selected.email}&gt;
                  </span>
                </span>
              </span>
            ) : (
              <span className="text-[var(--fg-subtle)]">Select user…</span>
            )}
            <ChevronDown
              className="size-4 shrink-0 text-[var(--fg-subtle)]"
              strokeWidth={1.75}
            />
          </button>
        }
      />
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[var(--anchor-width,20rem)] min-w-[320px] max-w-[480px] p-0"
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search by email or name…"
          />
          <CommandList>
            {users.isPending ? (
              <div className="flex items-center gap-2 px-3 py-4 text-[13px] text-[var(--fg-subtle)]">
                <Loader2 className="size-3.5 animate-spin" strokeWidth={1.75} />
                Loading…
              </div>
            ) : candidates.length === 0 ? (
              <CommandEmpty className="py-6 text-[13px] text-[var(--fg-subtle)]">
                No users found.
              </CommandEmpty>
            ) : (
              candidates.map((u) => (
                <CommandItem
                  key={u.id}
                  value={`${u.email} ${u.first_name ?? ""} ${u.last_name ?? ""} ${u.id}`}
                  onSelect={() => {
                    onSelect(u);
                    setOpen(false);
                  }}
                  className="gap-2.5"
                >
                  <span
                    aria-hidden="true"
                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] font-display text-[11px] font-semibold text-[var(--primary)]"
                  >
                    {userInitials(u)}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-[13px] font-medium text-[var(--fg)]">
                      {displayName(u)}
                    </span>
                    <span className="truncate font-mono text-[11px] text-[var(--fg-muted)]">
                      {u.email}
                    </span>
                  </span>
                </CommandItem>
              ))
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
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
