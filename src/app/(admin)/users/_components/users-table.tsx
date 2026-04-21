"use client";

import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@/types";
import { UserRow } from "./user-row";

interface UsersTableProps {
  isLoading: boolean;
  users: User[] | undefined;
  search: string;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onOpen: (id: string) => void;
  onDelete: (user: User) => void;
  onInvite: () => void;
  onPageChange: (next: number) => void;
}

export function UsersTable({
  isLoading,
  users,
  search,
  page,
  pageSize,
  total,
  totalPages,
  onOpen,
  onDelete,
  onInvite,
  onPageChange,
}: UsersTableProps) {
  return (
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
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-[var(--border)]">
                  <Td>
                    <div className="flex items-center gap-3">
                      <span className="skel size-8 rounded-full" />
                      <span className="skel h-3 w-36" />
                    </div>
                  </Td>
                  <Td><span className="skel h-3 w-44" /></Td>
                  <Td><span className="skel h-[22px] w-16" /></Td>
                  <Td><span className="skel h-3 w-20" /></Td>
                  <Td><span className="skel h-3 w-24" /></Td>
                  <Td>&nbsp;</Td>
                </tr>
              ))
            ) : users && users.length > 0 ? (
              users.map((u) => (
                <UserRow
                  key={u.id}
                  user={u}
                  onOpen={onOpen}
                  onDelete={onDelete}
                />
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
                      onClick={onInvite}
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

      {users && users.length > 0 && totalPages > 1 && (
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
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="btn btn-secondary btn-sm"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="btn btn-secondary btn-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
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
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("px-5 py-3 align-middle text-[14px]", className)}>
      {children}
    </td>
  );
}
