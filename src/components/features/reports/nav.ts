import type { NavigationItem } from "@/components/ui/nav-menu";

/**
 * Build the shared report-section tab nav for the current pathname.
 * Used by `/reports/history`, `/reports/templates`, and `/reports/ai-generate`.
 *
 * Order: History (browse) → Generate (act) → Templates (configure).
 * History is the canonical landing page for the Reports section.
 */
export function reportNavigationItems(pathname: string): NavigationItem[] {
  return [
    {
      label: "History",
      href: "/reports/history",
      active: pathname.startsWith("/reports/history"),
    },
    {
      label: "Generate",
      href: "/reports/ai-generate",
      active: pathname === "/reports/ai-generate",
    },
    {
      label: "Templates",
      href: "/reports/templates",
      active: pathname.startsWith("/reports/templates"),
    },
  ];
}
