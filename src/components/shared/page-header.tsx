'use client';

import Link from "next/link";
import { Building2 } from "lucide-react";
import React from "react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { NavMenuList, type NavigationItem } from "@/components/ui/nav-menu";
import { cn } from "@/lib/utils";
import { fadeUp, fadeIn, staggerContainer, staggerItem, slideInRight } from "@/lib/motion";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BreadcrumbCrumb {
  label?: string;
  href?: string;
  /** Override rendering of this crumb entirely (e.g. with an icon). */
  element?: ReactNode;
}

export interface PageHeaderProps {
  title: ReactNode;
  /** Subtitle / description shown below the title. */
  subtitle?: ReactNode;
  /** Optional leading icon shown alongside the title. */
  icon?: ReactNode;
  /** Crumb list rendered above the title. The last crumb is rendered as the current page. */
  breadcrumbs?: BreadcrumbCrumb[];
  /**
   * Right-aligned primary actions slot (typically the main page CTA).
   * Caller styles the buttons.
   */
  primaryActions?: ReactNode;
  /** Right-aligned secondary actions slot (rendered before primaryActions). */
  secondaryActions?: ReactNode;
  /**
   * Backward-compat alias for `primaryActions`. Existing call sites use `action`.
   */
  action?: ReactNode;
  /** Scope pill rendered next to the title (legacy). */
  scopeLabel?: string;
  /**
   * Renders a horizontal NavMenu (border-bottom tabs) below the header.
   */
  navigationItems?: NavigationItem[];
  /** Reduce vertical padding for tighter layouts. */
  isCompact?: boolean;
  className?: string;
}

// ── Crumb renderer ────────────────────────────────────────────────────────────

function renderCrumb(crumb: BreadcrumbCrumb, isLast: boolean) {
  if (crumb.element) {
    return crumb.element;
  }
  if (isLast || !crumb.href) {
    return <BreadcrumbPage>{crumb.label}</BreadcrumbPage>;
  }
  return (
    <BreadcrumbLink render={<Link href={crumb.href} />}>
      {crumb.label}
    </BreadcrumbLink>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Canonical page header. Renders the single `<h1>` for the route alongside
 * optional breadcrumbs, descriptive subtitle, primary/secondary actions, and
 * a horizontal navigation menu underneath.
 */
export function PageHeader({
  title,
  subtitle,
  icon,
  breadcrumbs,
  primaryActions,
  secondaryActions,
  action,
  scopeLabel,
  navigationItems,
  isCompact,
  className,
}: PageHeaderProps) {
  const resolvedPrimary = primaryActions ?? action;
  const hasActions = Boolean(resolvedPrimary || secondaryActions);
  const hasBreadcrumbs = !!breadcrumbs && breadcrumbs.length > 0;
  const hasNav = !!navigationItems && navigationItems.length > 0;
  const reduced = useReducedMotion();

  return (
    <motion.div
      variants={staggerContainer}
      initial={reduced ? 'visible' : 'hidden'}
      animate="visible"
      className={cn(
        "flex w-full flex-col",
        isCompact ? "gap-2 py-3" : "gap-4 py-6",
        className,
      )}
    >
      {hasBreadcrumbs ? (
        <motion.div variants={staggerItem}>
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs!.map((crumb, idx) => {
                const isLast = idx === breadcrumbs!.length - 1;
                return (
                  <React.Fragment key={`${crumb.label ?? "crumb"}-${idx}`}>
                    <BreadcrumbItem>
                      {renderCrumb(crumb, isLast)}
                    </BreadcrumbItem>
                    {!isLast ? <BreadcrumbSeparator /> : null}
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </motion.div>
      ) : null}

      <div
        className={cn(
          "flex flex-col items-start gap-3",
          "sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        )}
      >
        <motion.div variants={staggerItem} className="flex min-w-0 items-center gap-3">
          {icon ? (
            <span
              aria-hidden
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-200 text-foreground"
            >
              {icon}
            </span>
          ) : null}
          <div className="flex min-w-0 flex-col gap-1">
            <h1
              className={cn(
                "font-sans font-semibold tracking-[-0.03em] text-foreground",
                isCompact ? "text-heading" : "text-display",
              )}
            >
              {title}
              {scopeLabel ? (
                <span
                  className="ml-3 inline-flex items-center gap-1 rounded-full bg-surface-300 px-2 py-0.5 align-middle font-sans text-micro font-medium text-muted-strong"
                  aria-label={`Scope: ${scopeLabel}`}
                >
                  <Building2 aria-hidden className="size-3" />
                  {scopeLabel}
                </span>
              ) : null}
            </h1>
            {subtitle ? (
              <p className="font-sans text-body text-fg-muted">{subtitle}</p>
            ) : null}
          </div>
        </motion.div>

        {hasActions ? (
          <motion.div
            variants={slideInRight}
            className="flex shrink-0 items-center gap-2"
          >
            {secondaryActions}
            {resolvedPrimary}
          </motion.div>
        ) : null}
      </div>

      {hasNav ? (
        <motion.div variants={staggerItem} className="pt-1">
          <NavMenuList items={navigationItems!} />
        </motion.div>
      ) : null}
    </motion.div>
  );
}
