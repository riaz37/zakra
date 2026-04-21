"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Users as UsersIcon, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  useAddUserToCompany,
  useCompanyUsers,
  useRemoveUserFromCompany,
} from "@/hooks/useCompanies";
import { cn } from "@/lib/utils";
import type { Company } from "@/types";
import type { User } from "@/types/user";
import { UserPicker } from "../user-picker";

interface MembersTabProps {
  company: Company;
}

export function MembersTab({ company }: MembersTabProps) {
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
