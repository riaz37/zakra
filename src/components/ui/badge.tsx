import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  cn(
    "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1.5",
    "overflow-hidden rounded-[4px] border whitespace-nowrap",
    "font-sans font-medium leading-none",
    "transition-colors duration-[120ms]",
    "focus-visible:ring-2 focus-visible:ring-ring",
    "[&>svg]:pointer-events-none [&>svg]:size-3",
  ),
  {
    variants: {
      variant: {
        // Semantic, dark-enterprise palette
        default:
          "border-border bg-surface-300 text-muted-strong",
        success:
          "border-accent-border bg-accent-bg text-accent",
        warning:
          "border-warning-border bg-warning-bg text-warning",
        error:
          "border-error-border bg-error-bg text-error",
        info:
          "border-info/20 bg-info-soft text-info",
        outline:
          "border-border bg-transparent text-muted",
        processing:
          "border-thinking/25 bg-thinking/12 text-thinking",

        // Legacy aliases — map to semantic variants so existing consumers
        // (reports/[reportId], etc.) keep working without churn.
        // `secondary` → info (running/pending state in reports table)
        // `destructive` → error
        secondary:
          "border-info/20 bg-info-soft text-info",
        destructive:
          "border-error-border bg-error-bg text-error",
      },
      size: {
        sm: "h-5 px-1.5 text-micro",
        md: "h-6 px-2 text-caption",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  },
)

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>

const DOT_COLOR: Record<BadgeVariant, string> = {
  default: "bg-muted",
  success: "bg-accent",
  warning: "bg-warning",
  error: "bg-error",
  info: "bg-info",
  outline: "bg-muted",
  processing: "bg-thinking",
  secondary: "bg-info",
  destructive: "bg-error",
}

interface BadgeProps
  extends Omit<useRender.ComponentProps<"span">, "render">,
    VariantProps<typeof badgeVariants> {
  /** Render a 6px coloured dot before the label. */
  dot?: boolean
  render?: useRender.ComponentProps<"span">["render"]
}

function Badge({
  className,
  variant = "default",
  size = "sm",
  dot = false,
  children,
  render,
  ...props
}: BadgeProps) {
  const resolvedVariant: BadgeVariant = variant ?? "default"

  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant, size }), className),
        children: (
          <>
            {dot ? (
              <span
                aria-hidden
                className={cn(
                  "inline-block size-1.5 rounded-full",
                  DOT_COLOR[resolvedVariant],
                )}
              />
            ) : null}
            {children}
          </>
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant: resolvedVariant,
    },
  })
}

// ── StatusBadge ────────────────────────────────────────────────────────────

const STATUS_VARIANT_MAP: Record<string, BadgeVariant> = {
  // success
  completed: "success",
  active: "success",
  online: "success",
  connected: "success",
  succeeded: "success",
  ready: "success",

  // warning
  pending: "warning",
  running: "warning",
  queued: "warning",

  // processing (AI pipeline)
  processing: "processing",
  thinking: "processing",

  // error
  failed: "error",
  error: "error",
  offline: "error",
  disconnected: "error",
  cancelled: "error",
  suspended: "error",

  // info
  info: "info",
  draft: "info",
  scheduled: "info",
}

function statusToVariant(status: string): BadgeVariant {
  return STATUS_VARIANT_MAP[status.toLowerCase()] ?? "default"
}

function toLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
}

interface StatusBadgeProps
  extends Omit<BadgeProps, "variant" | "children"> {
  status: string
  /** Override the rendered label. Defaults to a capitalized status value. */
  label?: string
}

/**
 * Convenience badge that maps a free-form status string to a semantic colour
 * variant. Use this anywhere the platform shows job/connection/report state
 * so the colour story stays consistent.
 */
function StatusBadge({
  status,
  label,
  size = "sm",
  dot = true,
  className,
  ...props
}: StatusBadgeProps) {
  const variant = statusToVariant(status)
  const display = label ?? toLabel(status)

  return (
    <Badge
      variant={variant}
      size={size}
      dot={dot}
      aria-label={`Status: ${status}`}
      className={className}
      {...props}
    >
      {display}
    </Badge>
  )
}

export {
  Badge,
  StatusBadge,
  badgeVariants,
  statusToVariant,
  type BadgeProps,
  type BadgeVariant,
  type StatusBadgeProps,
}
