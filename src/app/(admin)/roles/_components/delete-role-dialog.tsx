"use client";

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
import { useDeleteRole } from "@/hooks/useRoles";
import type { Role } from "@/types";

interface DeleteRoleDialogProps {
  role: Role | null;
  onClose: () => void;
  onDeleted: (id: string) => void;
}

export function DeleteRoleDialog({
  role,
  onClose,
  onDeleted,
}: DeleteRoleDialogProps) {
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
