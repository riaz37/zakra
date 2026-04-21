"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table as TableIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRegisterTable } from "@/hooks/useTableAccess";

interface RegisterTableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string | undefined;
  onRegistered: () => void;
}

export function RegisterTableDialog({
  open,
  onOpenChange,
  companyId,
  onRegistered,
}: RegisterTableDialogProps) {
  const [schemaName, setSchemaName] = useState("public");
  const [tableName, setTableName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");

  const register = useRegisterTable();

  const reset = () => {
    setSchemaName("public");
    setTableName("");
    setDisplayName("");
    setDescription("");
  };

  const close = (next: boolean) => {
    onOpenChange(next);
    if (!next) setTimeout(reset, 200);
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tableName.trim()) {
      toast.error("Table name is required");
      return;
    }
    try {
      await register.mutateAsync({
        data: {
          schema_name: schemaName.trim() || "public",
          table_name: tableName.trim(),
          display_name: displayName.trim() || undefined,
          description: description.trim() || undefined,
          company_id: companyId,
        },
        companyId,
      });
      toast.success("Table registered", {
        description: `${schemaName}.${tableName} is now managed.`,
      });
      onRegistered();
      close(false);
    } catch (err) {
      toast.error("Could not register table", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="w-[calc(100%-2rem)] gap-0 p-0 sm:max-w-[480px]" showCloseButton={false}>
        <form onSubmit={submit}>
          <header className="flex items-start gap-3 border-b border-[var(--border)] px-6 py-5">
            <span className="mt-0.5 inline-flex size-9 items-center justify-center rounded-[10px] bg-[var(--primary-soft)] text-[var(--primary)]">
              <TableIcon className="size-[18px]" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 grow">
              <DialogTitle className="font-display text-[18px] font-semibold leading-[24px] -tracking-[0.01em]">
                Register a table
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-[13px] text-[var(--fg-subtle)]">
                Bring a table under access control. You can grant per-column permissions afterwards.
              </DialogDescription>
            </div>
          </header>

          <div className="flex flex-col gap-4 px-6 py-6">
            <div className="grid grid-cols-[1fr_2fr] gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-[13px] font-medium text-[var(--fg-muted)]">
                  Schema
                </Label>
                <Input
                  className="font-mono"
                  value={schemaName}
                  onChange={(e) => setSchemaName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-[13px] font-medium text-[var(--fg-muted)]">
                  Table name
                </Label>
                <Input
                  className="font-mono"
                  placeholder="accounts"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-[13px] font-medium text-[var(--fg-muted)]">
                Display name <span className="text-[var(--fg-subtle)]">(optional)</span>
              </Label>
              <Input
                placeholder="Accounts"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-[13px] font-medium text-[var(--fg-muted)]">
                Description <span className="text-[var(--fg-subtle)]">(optional)</span>
              </Label>
              <Input
                placeholder="Customer accounts and their status"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <footer className="flex items-center gap-2 border-t border-[var(--border)] bg-[var(--surface-muted)]/40 px-6 py-4">
            <Button type="button" variant="ghost" onClick={() => close(false)}>
              Cancel
            </Button>
            <div className="grow" />
            <Button type="submit" disabled={register.isPending}>
              {register.isPending && (
                <Loader2 className="size-3.5 animate-spin" strokeWidth={1.75} />
              )}
              Register table
            </Button>
          </footer>
        </form>
      </DialogContent>
    </Dialog>
  );
}
