import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  /**
   * Renders the input with an error border. Pair with an aria-described error
   * message below the field. Also flips internal focus colour to error tone.
   */
  error?: boolean
  /**
   * Renders the input value in JetBrains Mono. Use for slugs, IDs, hostnames,
   * tokens, or any technical identifier — never for prose or display names.
   */
  mono?: boolean
}

/**
 * Shared text input for the dark enterprise system.
 *
 * - Default surface: `bg-surface-200`, `border-border` — matches form pattern
 *   established in the login + select-company screens.
 * - Focus: green accent border + 2px ring at 40% opacity.
 * - Error: switches border + focus tone to `--color-error`.
 *
 * For ID-shaped values use `mono` or import `MonoInput`.
 */
function Input({
  className,
  type,
  error = false,
  mono = false,
  ...props
}: InputProps) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      aria-invalid={error || undefined}
      className={cn(
        // Layout
        "block w-full rounded-lg px-3 py-2.5",
        // Surface + border
        "border bg-surface-200 text-foreground",
        // Type
        mono ? "font-mono text-button" : "font-sans text-button",
        "placeholder:text-foreground/35",
        // Motion
        "transition-colors duration-150",
        // Default state
        !error && "border-border focus:border-accent",
        // Focus ring (always shown on keyboard focus)
        "outline-none focus-visible:ring-2 focus-visible:ring-ring",
        // Error state — overrides default border + focus colour
        error &&
          "border-error focus:border-error focus-visible:ring-error/30",
        // Disabled
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        // File input
        "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className,
      )}
      {...props}
    />
  )
}

/**
 * Convenience wrapper that locks the input into JetBrains Mono. Identical to
 * `<Input mono />` — exists so `MonoInput` reads as a distinct field type at
 * the call site (slugs, IDs, hostnames).
 */
function MonoInput(props: Omit<InputProps, "mono">) {
  return <Input {...props} mono />
}

export { Input, MonoInput, type InputProps }
