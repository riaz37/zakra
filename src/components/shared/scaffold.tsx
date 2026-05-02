import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

// ── Container sizes ───────────────────────────────────────────────────────────

type ScaffoldSize = "default" | "small" | "large" | "full";

const CONTAINER_SIZE: Record<ScaffoldSize, string> = {
  default: "max-w-[1200px]",
  small: "max-w-[768px]",
  large: "max-w-[1600px]",
  full: "max-w-none",
};

// ── ScaffoldContainer ─────────────────────────────────────────────────────────

interface ScaffoldContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: ScaffoldSize;
  bottomPadding?: boolean;
}

/**
 * Top-level page container. Sets max-width, responsive padding, and a `@container`
 * context so children can react to the container's width independently of the
 * viewport.
 */
export function ScaffoldContainer({
  size = "default",
  bottomPadding = true,
  className,
  children,
  ...rest
}: ScaffoldContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full @container",
        CONTAINER_SIZE[size],
        "px-4 @lg:px-6 @xl:px-10",
        bottomPadding && "pb-16",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

// ── ScaffoldHeader ────────────────────────────────────────────────────────────

interface ScaffoldHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export function ScaffoldHeader({
  className,
  children,
  ...rest
}: ScaffoldHeaderProps) {
  return (
    <header
      className={cn("flex w-full flex-col gap-3 py-6", className)}
      {...rest}
    >
      {children}
    </header>
  );
}

// ── ScaffoldTitle / ScaffoldDescription ───────────────────────────────────────

interface ScaffoldTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export function ScaffoldTitle({
  className,
  children,
  ...rest
}: ScaffoldTitleProps) {
  return (
    <h1
      className={cn(
        "font-sans text-display font-medium tracking-[-0.01em] text-foreground",
        className,
      )}
      {...rest}
    >
      {children}
    </h1>
  );
}

interface ScaffoldDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export function ScaffoldDescription({
  className,
  children,
  ...rest
}: ScaffoldDescriptionProps) {
  return (
    <p className={cn("font-sans text-body text-fg-muted", className)} {...rest}>
      {children}
    </p>
  );
}

// ── ScaffoldSection (two-column grid) ────────────────────────────────────────

interface ScaffoldSectionProps extends HTMLAttributes<HTMLElement> {
  /**
   * Override the default top-padding behavior. By default the first section
   * after a header gets `pt-12` to create breathing room, all others use `py-6`.
   */
  isFirst?: boolean;
}

export function ScaffoldSection({
  className,
  children,
  isFirst,
  ...rest
}: ScaffoldSectionProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-6 py-6 @md:grid @md:grid-cols-12 @md:gap-8",
        isFirst && "pt-12",
        !isFirst && "first:pt-12",
        className,
      )}
      {...rest}
    >
      {children}
    </section>
  );
}

interface ScaffoldSectionDetailProps extends HTMLAttributes<HTMLDivElement> {}

export function ScaffoldSectionDetail({
  className,
  children,
  ...rest
}: ScaffoldSectionDetailProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 @md:col-span-4 @xl:col-span-5",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

interface ScaffoldSectionContentProps extends HTMLAttributes<HTMLDivElement> {}

export function ScaffoldSectionContent({
  className,
  children,
  ...rest
}: ScaffoldSectionContentProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 @md:col-span-8 @xl:col-span-7",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

// ── Section title / description (h3 inside a section) ────────────────────────

interface ScaffoldSectionTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h2" | "h3";
}

export function ScaffoldSectionTitle({
  className,
  children,
  as: Tag = "h3",
  ...rest
}: ScaffoldSectionTitleProps) {
  return (
    <Tag
      className={cn(
        "font-sans text-heading font-medium tracking-[-0.01em] text-foreground",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

interface ScaffoldSectionDescriptionProps
  extends HTMLAttributes<HTMLParagraphElement> {}

export function ScaffoldSectionDescription({
  className,
  children,
  ...rest
}: ScaffoldSectionDescriptionProps) {
  return (
    <p className={cn("font-sans text-body text-fg-muted", className)} {...rest}>
      {children}
    </p>
  );
}

// ── ScaffoldDivider ──────────────────────────────────────────────────────────

export function ScaffoldDivider({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="presentation"
      className={cn("h-px w-full shrink-0 bg-border", className)}
      {...rest}
    />
  );
}

// ── ScaffoldFilterAndContent ─────────────────────────────────────────────────

interface ScaffoldFilterAndContentProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Wrapper for list-style pages: a row of filters/actions on top followed by
 * the data table or content grid below.
 */
export function ScaffoldFilterAndContent({
  className,
  children,
  ...rest
}: ScaffoldFilterAndContentProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)} {...rest}>
      {children}
    </div>
  );
}

// ── ScaffoldActionsContainer / Group ─────────────────────────────────────────

interface ScaffoldActionsContainerProps extends HTMLAttributes<HTMLDivElement> {}

export function ScaffoldActionsContainer({
  className,
  children,
  ...rest
}: ScaffoldActionsContainerProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-3 @md:flex-row @md:items-center @md:justify-between",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

interface ScaffoldActionsGroupProps extends HTMLAttributes<HTMLDivElement> {}

export function ScaffoldActionsGroup({
  className,
  children,
  ...rest
}: ScaffoldActionsGroupProps) {
  return (
    <div
      className={cn("flex flex-row items-center gap-3", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

// ── Re-exports for convenience / type ─────────────────────────────────────────

export type { ScaffoldSize };

export type ScaffoldHeaderChildren = ReactNode;
