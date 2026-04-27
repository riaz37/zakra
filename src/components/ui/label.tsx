"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Form label for the dark enterprise system.
 *
 * Defaults to the form pattern established across login, select-company, and
 * the create-company forms: 12px caption, muted tone, 6px bottom margin.
 *
 * `FieldLabel` (in `ui/field.tsx`) wraps this with its own layout overrides,
 * so changes here only affect raw `<Label>` consumers.
 */
function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "mb-1.5 block font-sans text-caption font-medium text-muted select-none",
        "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

export { Label }
