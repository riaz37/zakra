"use client";

import { useEffect, useState } from "react";
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
import { useDeleteUser } from "@/hooks/useUsers";
import { cn } from "@/lib/utils";
import { displayName } from "@/utils/user-display";
import type { User } from "@/types";

interface DeleteUserDialogProps {
  user: User | null;
  onClose: () => void;
}

export function DeleteUserDialog({ user, onClose }: DeleteUserDialogProps) {
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
      toast.success("User deleted", {
        description: `${user.email} has been removed.`,
      });
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
