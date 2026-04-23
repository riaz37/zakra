"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Loader } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

export type ConfirmDialogVariant = "danger" | "default";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  /** External loading flag — the dialog also tracks its own internal pending state. */
  isLoading?: boolean;
  variant?: ConfirmDialogVariant;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  isLoading = false,
  variant = "default",
}: ConfirmDialogProps) {
  // Track async confirmations locally so callers that return a Promise
  // automatically get a spinner without wiring up isLoading themselves.
  const [internalPending, setInternalPending] = useState(false);
  const pending = isLoading || internalPending;

  async function handleConfirm() {
    try {
      setInternalPending(true);
      await onConfirm();
    } finally {
      setInternalPending(false);
    }
  }

  const isDanger = variant === "danger";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            "fixed inset-0 bg-foreground/10",
            "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
            "transition-opacity duration-200",
          )}
        />

        <Dialog.Popup
          role={isDanger ? "alertdialog" : "dialog"}
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[min(calc(100vw-2rem),28rem)]",
            "-translate-x-1/2 -translate-y-1/2",
            "rounded-xl border border-border bg-background p-6 shadow-elevated",
            "outline-none",
            "data-[starting-style]:opacity-0 data-[starting-style]:scale-[0.97]",
            "data-[ending-style]:opacity-0 data-[ending-style]:scale-[0.97]",
            "transition-[opacity,transform] duration-200",
          )}
        >
          <Dialog.Title className="font-sans text-[22px] font-normal leading-[1.3] tracking-[-0.11px] text-foreground">
            {title}
          </Dialog.Title>

          {description ? (
            <Dialog.Description className="mt-1 font-sans text-[15px] leading-[1.4] text-muted">
              {description}
            </Dialog.Description>
          ) : null}

          <div className="mt-6 flex items-center justify-end gap-2">
            <Dialog.Close
              disabled={pending}
              className={cn(
                "inline-flex items-center justify-center rounded-lg border border-border",
                "bg-surface-300 px-4 py-2 font-sans text-button text-foreground",
                "transition-colors hover:bg-surface-400",
                "focus-visible:border-border-medium focus-visible:outline-none",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              {cancelLabel}
            </Dialog.Close>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={pending}
              className={cn(
                "inline-flex min-w-[5rem] items-center justify-center gap-2 rounded-lg border border-border",
                "bg-surface-300 px-4 py-2 font-sans text-button",
                "transition-colors hover:bg-surface-400",
                "focus-visible:border-border-medium focus-visible:outline-none",
                "disabled:cursor-not-allowed disabled:opacity-50",
                isDanger ? "text-error" : "text-foreground",
              )}
            >
              {pending ? (
                <>
                  <Loader
                    aria-hidden="true"
                    className="size-3.5 animate-spin"
                  />
                  <span>{confirmLabel}</span>
                </>
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
