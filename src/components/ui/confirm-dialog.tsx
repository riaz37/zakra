"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type ConfirmVariant = "destructive" | "warning" | "default"

const CONFIRM_BUTTON_VARIANT: Record<ConfirmVariant, "destructive-hard" | "warning" | "default"> = {
  destructive: "destructive-hard",
  warning: "warning",
  default: "default",
}

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  /** Controls the confirm button visual + role weight. */
  variant?: ConfirmVariant
  /** Forwarded to the confirm button. Disables both buttons while pending. */
  isLoading?: boolean
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
}

/**
 * Reusable confirmation dialog for destructive or otherwise high-stakes
 * actions. Matches the dark-enterprise card pattern (no nested cards, no
 * shadows beyond the dialog surround, plain footer alignment).
 *
 * Usage:
 *
 * ```tsx
 * <ConfirmDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Delete connection"
 *   description="This will permanently remove the database connection..."
 *   confirmLabel="Delete permanently"
 *   variant="destructive"
 *   isLoading={isPending}
 *   onConfirm={handleDelete}
 * />
 * ```
 */
function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [internalPending, setInternalPending] = React.useState(false)
  const pending = isLoading || internalPending
  const confirmVariant = CONFIRM_BUTTON_VARIANT[variant]

  async function handleConfirm() {
    if (pending) return
    try {
      setInternalPending(true)
      await onConfirm()
    } finally {
      setInternalPending(false)
    }
  }

  function handleCancel() {
    if (pending) return
    onCancel?.()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return
        onOpenChange(next)
      }}
    >
      <DialogContent
        showCloseButton={false}
        className={cn(
          "max-w-[420px] gap-0 rounded-xl border-border bg-surface-200 p-6",
        )}
        role={variant === "destructive" ? "alertdialog" : "dialog"}
      >
        <DialogHeader className="gap-2">
          <DialogTitle className="font-sans text-title font-semibold tracking-[-0.11px] text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="font-sans text-body leading-[1.5] text-muted">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6 mx-0 mb-0 flex justify-end gap-2 rounded-none border-t-0 bg-transparent p-0 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={pending}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            onClick={handleConfirm}
            isLoading={pending}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { ConfirmDialog, type ConfirmDialogProps }
