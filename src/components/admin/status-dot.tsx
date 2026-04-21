import { cn } from "@/lib/utils";

type Status = "live" | "connected" | "idle" | "failed" | "default";

interface StatusDotProps {
  status?: Status;
  className?: string;
}

export function StatusDot({ status = "default", className }: StatusDotProps) {
  const cls =
    status === "live" || status === "connected"
      ? "status-dot-live"
      : status === "idle"
        ? "status-dot-idle"
        : status === "failed"
          ? "status-dot-failed"
          : "";
  return <span className={cn("status-dot", cls, className)} aria-hidden="true" />;
}
