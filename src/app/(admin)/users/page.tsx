"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { StatusDot } from "@/components/admin/status-dot";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useUsers,
  useUser,
  useUserRoles,
  useCreateUser,
  useDeleteUser,
  useAssignUserRoles,
} from "@/hooks/useUsers";
import { useRoles } from "@/hooks/useRoles";
import { useCurrentCompanyId } from "@/hooks/useCurrentCompany";
import { cn } from "@/lib/utils";
import type { User, UserCreate } from "@/types";

const inviteSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Minimum 8 characters"),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  user_type: z.enum(["admin", "regular"]),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

const INPUT_CLASSES =
  "h-9 w-full rounded-[var(--radius-input)] border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[14px] text-[var(--fg)] outline-none transition-colors placeholder:text-[var(--fg-subtle)] hover:border-[var(--fg-subtle)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--ring)]";

function useDebounced<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function initialsFor(u: { first_name: string | null; last_name: string | null; email: string }) {
  const f = u.first_name?.[0] ?? "";
  const l = u.last_name?.[0] ?? "";
  return (f + l || u.email[0] || "U").toUpperCase();
}

function displayName(u: { first_name: string | null; last_name: string | null; email: string }) {
  const full = [u.first_name, u.last_name].filter(Boolean).join(" ");
  return full || u.email.split("@")[0];
}

function formatRelative(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString();
}

function UserTypeBadge({ type }: { type: User["user_type"] }) {
  const map = {
    super_admin: { bg: "bg-[var(--primary-soft)]", fg: "text-[var(--primary)]", label: "Super admin" },
    admin: { bg: "bg-[var(--primary-soft)]", fg: "text-[var(--primary)]", label: "Admin" },
    regular: { bg: "bg-[var(--surface-muted)]", fg: "text-[var(--fg-muted)]", label: "Member" },
  } as const;
  const v = map[type];
  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center rounded-[var(--radius-badge)] px-2 text-[12px] font-medium",
        v.bg,
        v.fg,
      )}
    >
      {v.label}
    </span>
  );
}

function StatusLabel({ status }: { status: User["status"] }) {
  const dotMap = {
    active: "live",
    inactive: "idle",
    suspended: "failed",
    pending: "idle",
  } as const;
  return (
    <div className="inline-flex items-center gap-2">
      <StatusDot status={dotMap[status]} />
      <span className="text-[13px] capitalize text-[var(--fg)]">{status}</span>
    </div>
  );
}

export default function UsersPage() {
  const companyId = useCurrentCompanyId();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [searchRaw, setSearchRaw] = useState("");
  const search = useDebounced(searchRaw, 250);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const list = useUsers({
    company_id: companyId,
    page,
    page_size: pageSize,
    search: search || undefined,
  });

  const total = list.data?.total ?? 0;
  const totalPages = list.data?.total_pages ?? 1;

  return (
    <div className="mx-auto max-w-[1440px]">
      <PageHeader
        title="Users"
        subtitle={
          total > 0
            ? `${total.toLocaleString()} ${total === 1 ? "user" : "users"} in your workspace`
            : "Invite teammates to collaborate in your workspace"
        }
        actions={
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="btn btn-primary"
          >
            <Plus className="size-[14px]" strokeWidth={1.75} />
            Invite user
          </button>
        }
      />

      {/* Search */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[260px] max-w-[420px]">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--fg-subtle)]"
            strokeWidth={1.75}
          />
          <Input
            placeholder="Search by email…"
            value={searchRaw}
            onChange={(e) => setSearchRaw(e.target.value)}
            className="h-9 pl-9 rounded-[var(--radius-input)] border-[var(--border-strong)] bg-[var(--surface)]"
          />
          {searchRaw && (
            <button
              type="button"
              onClick={() => setSearchRaw("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--fg-subtle)] hover:bg-[var(--surface-muted)] hover:text-[var(--fg)]"
              aria-label="Clear search"
            >
              <X className="size-3.5" strokeWidth={1.75} />
            </button>
          )}
        </div>
        <span className="caption-upper">
          {list.isFetching && !list.isLoading ? "Updating…" : `Page ${page} of ${Math.max(totalPages, 1)}`}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-token-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                <Th className="w-[32%]">User</Th>
                <Th className="w-[22%]">Email</Th>
                <Th className="w-[12%]">Type</Th>
                <Th className="w-[14%]">Status</Th>
                <Th className="w-[16%]">Last sign-in</Th>
                <Th className="w-[4%]">&nbsp;</Th>
              </tr>
            </thead>
            <tbody>
              {list.isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-[var(--border)]">
                    <Td><div className="flex items-center gap-3"><span className="skel size-8 rounded-full" /><span className="skel h-3 w-36" /></div></Td>
                    <Td><span className="skel h-3 w-44" /></Td>
                    <Td><span className="skel h-[22px] w-16" /></Td>
                    <Td><span className="skel h-3 w-20" /></Td>
                    <Td><span className="skel h-3 w-24" /></Td>
                    <Td>&nbsp;</Td>
                  </tr>
                ))
              ) : list.data?.items.length ? (
                list.data.items.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => setDetailUserId(u.id)}
                    className="cursor-pointer border-b border-[var(--border)] transition-colors hover:bg-[var(--surface-muted)]"
                    style={{ height: "var(--row-h)" }}
                  >
                    <Td>
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] font-display text-[12px] font-semibold text-[var(--primary)]"
                        >
                          {initialsFor(u)}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate text-[14px] font-medium text-[var(--fg)]">
                            {displayName(u)}
                          </div>
                          {u.phone && (
                            <div className="truncate text-[12px] text-[var(--fg-subtle)]">
                              {u.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <span className="font-mono text-[12px] text-[var(--fg-muted)]">
                        {u.email}
                      </span>
                    </Td>
                    <Td>
                      <UserTypeBadge type={u.user_type} />
                    </Td>
                    <Td>
                      <StatusLabel status={u.status} />
                    </Td>
                    <Td>
                      <span className="text-[13px] text-[var(--fg-muted)]">
                        {formatRelative(u.last_login_at)}
                      </span>
                    </Td>
                    <Td onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <button
                              type="button"
                              aria-label="Row actions"
                              className="inline-flex size-7 items-center justify-center rounded-md text-[var(--fg-subtle)] hover:bg-[var(--surface)] hover:text-[var(--fg)]"
                            >
                              <MoreHorizontal className="size-4" strokeWidth={1.75} />
                            </button>
                          }
                        />
                        <DropdownMenuContent align="end" className="min-w-[160px]">
                          <DropdownMenuItem onClick={() => setDetailUserId(u.id)}>
                            View profile
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeleteUser(u)}
                          >
                            <Trash2 className="size-3.5" strokeWidth={1.75} />
                            Delete user
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </Td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                      <div className="inline-flex size-10 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
                        <Search className="size-[18px]" strokeWidth={1.75} />
                      </div>
                      <h3 className="font-display text-[16px] font-semibold -tracking-[0.01em]">
                        {search ? "No users match your search" : "No users yet"}
                      </h3>
                      <p className="text-[13px] text-[var(--fg-subtle)]">
                        {search
                          ? "Try a different email. We search on exact and partial matches."
                          : "Invite your first teammate to start collaborating."}
                      </p>
                      <button
                        type="button"
                        onClick={() => setInviteOpen(true)}
                        className="btn btn-primary mt-2"
                      >
                        <Plus className="size-[14px]" strokeWidth={1.75} />
                        Invite user
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {list.data && list.data.items.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--border)] px-5 py-3">
            <span className="text-[12px] text-[var(--fg-subtle)]">
              Showing <span className="text-[var(--fg)]">{(page - 1) * pageSize + 1}</span>–
              <span className="text-[var(--fg)]">
                {Math.min(page * pageSize, total)}
              </span>{" "}
              of <span className="text-[var(--fg)]">{total.toLocaleString()}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn btn-secondary btn-sm"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="btn btn-secondary btn-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <InviteSheet open={inviteOpen} onOpenChange={setInviteOpen} companyId={companyId} />

      <UserDetailSheet
        userId={detailUserId}
        onClose={() => setDetailUserId(null)}
      />

      <DeleteUserDialog
        user={deleteUser}
        onClose={() => setDeleteUser(null)}
      />
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "px-5 py-3 caption-upper text-left text-[var(--fg-subtle)]",
        className,
      )}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLTableCellElement>) => void;
  className?: string;
}) {
  return (
    <td
      onClick={onClick}
      className={cn("px-5 py-3 align-middle text-[14px]", className)}
    >
      {children}
    </td>
  );
}

/* -------------------------------- Invite -------------------------------- */

function InviteSheet({
  open,
  onOpenChange,
  companyId,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  companyId: string | undefined;
}) {
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
      <SheetContent
        side="right"
        className="w-full p-0 sm:max-w-[480px]"
      >
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
                <input
                  {...register("email")}
                  type="email"
                  placeholder="teammate@acme.com"
                  autoComplete="email"
                  className={INPUT_CLASSES}
                />
              </Field>
              <Field
                label="Temporary password"
                hint="They can change this after their first sign-in."
                error={errors.password?.message}
              >
                <input
                  {...register("password")}
                  type="password"
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  className={INPUT_CLASSES}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="First name" error={errors.first_name?.message}>
                  <input
                    {...register("first_name")}
                    type="text"
                    placeholder="Jane"
                    className={INPUT_CLASSES}
                  />
                </Field>
                <Field label="Last name" error={errors.last_name?.message}>
                  <input
                    {...register("last_name")}
                    type="text"
                    placeholder="Doe"
                    className={INPUT_CLASSES}
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

/* ----------------------------- User Detail ----------------------------- */

function UserDetailSheet({
  userId,
  onClose,
}: {
  userId: string | null;
  onClose: () => void;
}) {
  const open = !!userId;
  const detail = useUser(userId ?? undefined);
  const userRoles = useUserRoles(userId ?? undefined);
  const rolesQuery = useRoles({ page: 1, page_size: 100 });
  const assign = useAssignUserRoles(userId ?? "");

  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [initialIds, setInitialIds] = useState<string[]>([]);

  useEffect(() => {
    if (userRoles.data) {
      const ids = userRoles.data.map((r) => r.id);
      setSelectedRoleIds(ids);
      setInitialIds(ids);
    }
  }, [userRoles.data]);

  const dirty =
    selectedRoleIds.length !== initialIds.length ||
    selectedRoleIds.some((id) => !initialIds.includes(id));

  const toggle = (id: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const saveRoles = async () => {
    if (!userId) return;
    try {
      await assign.mutateAsync({ role_ids: selectedRoleIds });
      setInitialIds(selectedRoleIds);
      toast.success("Roles updated");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not update roles.";
      toast.error("Update failed", { description: message });
    }
  };

  const u = detail.data;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-[520px]">
        {!u ? (
          <div className="flex h-full items-center justify-center p-10">
            <Loader2 className="size-5 animate-spin text-[var(--fg-subtle)]" />
          </div>
        ) : (
          <div className="flex h-full flex-col">
            <SheetHeader className="border-b border-[var(--border)] px-6 py-5">
              <div className="flex items-start gap-3.5">
                <span
                  aria-hidden="true"
                  className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] font-display text-[16px] font-semibold text-[var(--primary)]"
                >
                  {initialsFor(u)}
                </span>
                <div className="min-w-0">
                  <SheetTitle className="font-display text-[18px] font-semibold -tracking-[0.01em]">
                    {displayName(u)}
                  </SheetTitle>
                  <SheetDescription className="mt-0.5 font-mono text-[12px] text-[var(--fg-muted)]">
                    {u.email}
                  </SheetDescription>
                  <div className="mt-2 flex items-center gap-2">
                    <UserTypeBadge type={u.user_type} />
                    <StatusLabel status={u.status} />
                  </div>
                </div>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-5">
                <section>
                  <div className="caption-upper mb-2.5">Profile</div>
                  <dl className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]">
                    <Row label="First name" value={u.first_name} />
                    <Row label="Last name" value={u.last_name} />
                    <Row label="Phone" value={u.phone} />
                    <Row label="Mode" value={u.mode} mono />
                    <Row
                      label="Email verified"
                      value={u.email_verified ? "Yes" : "No"}
                    />
                    <Row
                      label="Joined"
                      value={new Date(u.created_at).toLocaleDateString()}
                    />
                    <Row
                      label="Last sign-in"
                      value={formatRelative(u.last_login_at)}
                      isLast
                    />
                  </dl>
                </section>

                <section>
                  <div className="mb-2.5 flex items-center justify-between">
                    <div className="caption-upper">Roles</div>
                    <span className="text-[12px] text-[var(--fg-subtle)]">
                      {userRoles.data?.length ?? 0} assigned
                    </span>
                  </div>
                  {userRoles.data && userRoles.data.length > 0 ? (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {userRoles.data.map((r) => (
                        <span
                          key={r.id}
                          className="inline-flex items-center gap-1.5 rounded-[var(--radius-badge)] bg-[var(--primary-soft)] px-2 py-1 text-[12px] font-medium text-[var(--primary)]"
                        >
                          <ShieldCheck className="size-3" strokeWidth={1.75} />
                          {r.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="mb-3 rounded-[var(--radius-card)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-muted)] px-4 py-3 text-[13px] text-[var(--fg-muted)]">
                      No roles assigned yet.
                    </div>
                  )}

                  <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]">
                    <div className="border-b border-[var(--border)] px-4 py-2.5">
                      <div className="text-[13px] font-medium text-[var(--fg)]">
                        Assign roles
                      </div>
                      <div className="mt-0.5 text-[12px] text-[var(--fg-subtle)]">
                        Check each role this user should have.
                      </div>
                    </div>
                    <div className="max-h-[240px] overflow-y-auto p-2">
                      {rolesQuery.isLoading ? (
                        <div className="px-2 py-3 text-[13px] text-[var(--fg-subtle)]">
                          Loading roles…
                        </div>
                      ) : rolesQuery.data?.items.length ? (
                        rolesQuery.data.items.map((r) => {
                          const active = selectedRoleIds.includes(r.id);
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
                                onCheckedChange={() => toggle(r.id)}
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
                          No roles available.
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <SheetFooter className="flex-row justify-end border-t border-[var(--border)] bg-[var(--surface-muted)] px-6 py-4">
              <button type="button" onClick={onClose} className="btn btn-ghost">
                Close
              </button>
              <button
                type="button"
                disabled={!dirty || assign.isPending}
                onClick={saveRoles}
                className="btn btn-primary"
              >
                {assign.isPending && <Loader2 className="size-4 animate-spin" />}
                Save roles
              </button>
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Row({
  label,
  value,
  mono,
  isLast,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
  isLast?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[140px_1fr] items-center gap-4 px-4 py-2.5",
        !isLast && "border-b border-[var(--border)]",
      )}
    >
      <dt className="text-[12px] font-medium text-[var(--fg-subtle)]">{label}</dt>
      <dd
        className={cn(
          "truncate text-[13px] text-[var(--fg)]",
          mono && "font-mono text-[12px] text-[var(--fg-muted)]",
          !value && "text-[var(--fg-subtle)]",
        )}
      >
        {value || "—"}
      </dd>
    </div>
  );
}

/* ----------------------------- Delete Dialog ----------------------------- */

function DeleteUserDialog({
  user,
  onClose,
}: {
  user: User | null;
  onClose: () => void;
}) {
  const deleteMut = useDeleteUser();
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    if (!user) setConfirmText("");
  }, [user]);

  const canDelete = user ? confirmText === user.email : false;

  const onConfirm = async () => {
    if (!user || !canDelete) return;
    try {
      await deleteMut.mutateAsync(user.id);
      toast.success("User deleted", { description: `${user.email} has been removed.` });
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not delete user.";
      toast.error("Delete failed", { description: message });
    }
  };

  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="font-display text-[18px] font-semibold -tracking-[0.01em]">
            Delete this user?
          </DialogTitle>
          <DialogDescription>
            This permanently removes access and revokes every active session. This
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {user && (
          <div className="flex flex-col gap-3">
            <div className="rounded-[var(--radius-card)] border border-[var(--destructive-soft)] bg-[var(--destructive-soft)] px-4 py-3">
              <div className="text-[13px] font-medium text-[var(--destructive)]">
                {displayName(user)}
              </div>
              <div className="mt-0.5 font-mono text-[12px] text-[var(--destructive)]/80">
                {user.email}
              </div>
            </div>
            <div>
              <Label className="mb-1.5 text-[12px] font-medium text-[var(--fg-muted)]">
                Type <span className="font-mono text-[var(--fg)]">{user.email}</span> to
                confirm
              </Label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={user.email}
                className="font-mono"
              />
            </div>
          </div>
        )}

        <DialogFooter className="-mx-4 -mb-4 mt-2 border-t bg-[var(--surface-muted)]">
          <button type="button" onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button
            type="button"
            disabled={!canDelete || deleteMut.isPending}
            onClick={onConfirm}
            className={cn(
              "inline-flex h-9 items-center justify-center gap-2 rounded-[var(--radius-btn)] bg-[var(--destructive)] px-3.5 text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            {deleteMut.isPending && <Loader2 className="size-4 animate-spin" />}
            Delete user
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
      {error && (
        <p className="mt-1 text-[12px] text-[var(--destructive)]">{error}</p>
      )}
    </div>
  );
}
