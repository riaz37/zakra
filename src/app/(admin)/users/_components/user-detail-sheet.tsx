"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useAssignUserRoles,
  useUser,
  useUserRoles,
} from "@/hooks/useUsers";
import { useRoles } from "@/hooks/useRoles";
import { cn } from "@/lib/utils";
import {
  displayName,
  formatRelative,
  initialsFor,
} from "@/utils/user-display";
import { StatusLabel, UserTypeBadge } from "./users-badges";

interface UserDetailSheetProps {
  userId: string | null;
  onClose: () => void;
}

export function UserDetailSheet({ userId, onClose }: UserDetailSheetProps) {
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
