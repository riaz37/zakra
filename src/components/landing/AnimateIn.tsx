"use client";

import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

interface AnimateInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li";
}

export function AnimateIn({ children, className, delay = 0, as: Tag = "div" }: AnimateInProps) {
  const { ref, inView } = useInView();

  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn(
        "transition-[opacity,transform] will-change-[opacity,transform]",
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[10px]",
        className
      )}
      style={{
        transitionDuration: "400ms",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        transitionDelay: inView ? `${delay}ms` : "0ms",
      }}
    >
      {children}
    </Tag>
  );
}
