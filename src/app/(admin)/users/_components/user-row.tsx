"use client";

import { MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  displayName,
  formatRelative,
  initialsFor,
} from "@/utils/user-display";
import type { User } from "@/types";
import { StatusLabel, UserTypeBadge } from "./users-badges";

interface UserRowProps {
  user: User;
  onOpen: (id: string) => void;
  onDelete: (user: User) => void;
}

export function UserRow({ user, onOpen, onDelete }: UserRowProps) {
  return (
    <tr
      onClick={() => onOpen(user.id)}
      className="cursor-pointer border-b border-[var(--border)] transition-colors hover:bg-[var(--surface-muted)]"
      style={{ height: "var(--row-h)" }}
    >
      <Td>
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] font-display text-[12px] font-semibold text-[var(--primary)]"
          >
            {initialsFor(user)}
          </span>
          <div className="min-w-0">
            <div className="truncate text-[14px] font-medium text-[var(--fg)]">
              {displayName(user)}
            </div>
            {user.phone && (
              <div className="truncate text-[12px] text-[var(--fg-subtle)]">
                {user.phone}
              </div>
            )}
          </div>
        </div>
      </Td>
      <Td>
        <span className="font-mono text-[12px] text-[var(--fg-muted)]">
          {user.email}
        </span>
      </Td>
      <Td>
        <UserTypeBadge type={user.user_type} />
      </Td>
      <Td>
        <StatusLabel status={user.status} />
      </Td>
      <Td>
        <span className="text-[13px] text-[var(--fg-muted)]">
          {formatRelative(user.last_login_at)}
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
            <DropdownMenuItem onClick={() => onOpen(user.id)}>
              View profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(user)}
            >
              <Trash2 className="size-3.5" strokeWidth={1.75} />
              Delete user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Td>
    </tr>
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
