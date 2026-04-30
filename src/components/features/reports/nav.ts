import type { NavigationItem } from "@/components/ui/nav-menu";

/**
 * Build the shared report-section tab nav for the current pathname.
 * Used by `/reports/ai-generate`, `/reports/history`, and `/reports/templates`.
 *
 * Order: Generate (act) → History (review) → Templates (configure).
 * The persistent left sidebar (`ReportHistorySidebar`) shows only the
 * 10 most-recent generations; the History tab is the full searchable list.
 */
export function reportNavigationItems(pathname: string): NavigationItem[] {
  return [
    {
      label: "Generate",
      href: "/reports/ai-generate",
      active: pathname === "/reports/ai-generate",
    },
    {
      label: "History",
      href: "/reports/history",
      active: pathname.startsWith("/reports/history"),
    },
    {
      label: "Templates",
      href: "/reports/templates",
      active: pathname.startsWith("/reports/templates"),
    },
  ];
}
