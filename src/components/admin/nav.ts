import {
  LayoutGrid,
  Database,
  Table,
  Terminal,
  MessageSquare,
  FileText,
  Users,
  ShieldCheck,
  Building,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "OVERVIEW",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
    ],
  },
  {
    label: "DATA",
    items: [
      { id: "connections", label: "DB Connections", href: "/connections", icon: Database },
      { id: "table-access", label: "Table Access", href: "/table-access", icon: Table },
      { id: "query", label: "Query Runner", href: "/query", icon: Terminal },
    ],
  },
  {
    label: "CONTENT",
    items: [
      { id: "chat", label: "Chat", href: "/chat", icon: MessageSquare },
      { id: "reports", label: "Reports", href: "/reports", icon: FileText },
    ],
  },
  {
    label: "ADMIN",
    items: [
      { id: "users", label: "Users", href: "/users", icon: Users },
      { id: "roles", label: "Roles", href: "/roles", icon: ShieldCheck },
      { id: "companies", label: "Companies", href: "/companies", icon: Building },
    ],
  },
];

export const SETTINGS_ITEM: NavItem = {
  id: "settings",
  label: "Settings",
  href: "/settings",
  icon: Settings,
};

export const ROUTE_LABEL: Record<string, string> = {
  dashboard: "Dashboard",
  connections: "DB Connections",
  "table-access": "Table Access",
  query: "Query Runner",
  chat: "Chat",
  reports: "Reports",
  users: "Users",
  roles: "Roles",
  companies: "Companies",
  settings: "Settings",
};
