import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-[6px] border border-border bg-surface-200 px-3 py-2.5 font-sans text-body text-foreground transition-colors outline-none placeholder:text-fg-subtle focus:border-accent focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-error aria-invalid:focus:border-error aria-invalid:ring-2 aria-invalid:ring-error/30 duration-[120ms]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
