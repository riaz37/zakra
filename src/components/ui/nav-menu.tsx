"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef, HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NavigationItem {
  label: string;
  href?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  active?: boolean;
  onClick?: () => void;
}

// ── Root ──────────────────────────────────────────────────────────────────────

interface NavMenuProps extends HTMLAttributes<HTMLElement> {
  ariaLabel?: string;
}

export function NavMenu({
  className,
  ariaLabel = "Page navigation",
  children,
  ...rest
}: NavMenuProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cn("border-b border-border", className)}
      {...rest}
    >
      <ul className="flex flex-wrap items-center gap-5">{children}</ul>
    </nav>
  );
}

// ── Item ──────────────────────────────────────────────────────────────────────

interface NavMenuItemProps {
  item: NavigationItem;
  className?: string;
}

const ITEM_BASE =
  "inline-flex items-center gap-2 py-2 -mb-px border-b-2 border-transparent " +
  "font-sans text-body text-muted transition-colors duration-[120ms] " +
  "hover:text-foreground focus-visible:text-foreground focus-visible:outline-none";

const ITEM_ACTIVE = "border-foreground text-foreground";

export function NavMenuItem({ item, className }: NavMenuItemProps) {
  const state = item.active ? "active" : "inactive";
  const content = (
    <>
      {item.icon ? (
        <span aria-hidden className="inline-flex shrink-0 items-center">
          {item.icon}
        </span>
      ) : null}
      <span>{item.label}</span>
      {item.badge ? (
        <span className="inline-flex items-center rounded-full bg-surface-300 px-1.5 py-0.5 font-mono text-mono-sm text-muted">
          {item.badge}
        </span>
      ) : null}
    </>
  );

  return (
    <li
      data-state={state}
      className={cn(
        ITEM_BASE,
        item.active && ITEM_ACTIVE,
        className,
      )}
    >
      {item.href ? (
        <Link
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className="inline-flex items-center gap-2"
          onClick={item.onClick}
        >
          {content}
        </Link>
      ) : (
        <button
          type="button"
          aria-current={item.active ? "page" : undefined}
          onClick={item.onClick}
          className="inline-flex items-center gap-2 cursor-pointer"
        >
          {content}
        </button>
      )}
    </li>
  );
}

// ── List helper ───────────────────────────────────────────────────────────────

interface NavMenuListProps extends ComponentPropsWithoutRef<typeof NavMenu> {
  items: NavigationItem[];
}

/**
 * Convenience wrapper that renders a NavMenu directly from a list of items.
 */
export function NavMenuList({ items, ...rest }: NavMenuListProps) {
  return (
    <NavMenu {...rest}>
      {items.map((item) => (
        <NavMenuItem key={`${item.label}-${item.href ?? ""}`} item={item} />
      ))}
    </NavMenu>
  );
}
