import { useMemo } from "react";
import {
  LayoutDashboard,
  Settings,
  User as UserIcon,
  MessageSquare,
} from "lucide-react";

import { NavItemType } from "../types";

// ── Permission helper ──────────────────────────────────────────────────────
// Kept local to this hook — no other file needs to know about accessData shape
const canView = (accessData: Record<string, any> | null, key: string): boolean =>
  Boolean(accessData?.[key.toLowerCase()]?.view);

// ── Hook ──────────────────────────────────────────────────────────────────
export const useNavigation = (accessData: Record<string, any> | null): NavItemType[] => {
  return useMemo(() => {
    const has = (key: string) => canView(accessData, key);

    const items: NavItemType[] = [
      // Dashboards — role-based, only one will show per user
      ...(has("data-dashboard")          ? [{ name: "Dashboard", href: "/dashboard-admin",          icon: LayoutDashboard }] : []),
      ...(has("dashboard-tso")           ? [{ name: "Dashboard", href: "/dashboard-tso",            icon: LayoutDashboard }] : []),
      ...(has("dashboard-manager")       ? [{ name: "Dashboard", href: "/dashboard-manager",        icon: LayoutDashboard }] : []),
      ...(has("dashboard-branch-manager")? [{ name: "Dashboard", href: "/dashboard-branch-manager", icon: LayoutDashboard }] : []),
      ...(has("dashboard-team-leader")   ? [{ name: "Dashboard", href: "/dashboard-team-leader",    icon: LayoutDashboard }] : []),

      // Always visible
      { name: "Help Chat", href: "/help-chat", icon: MessageSquare },

      // Settings group
      {
        name: "Settings & Config",
        icon: Settings,
        children: [
          { name: "User Management", href: "/user-management", icon: UserIcon },
        ],
      },
    ];

    return items;
  }, [accessData]);
};