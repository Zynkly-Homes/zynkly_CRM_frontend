import { useMemo } from "react";
import {
  LayoutDashboard,
  Settings,
  Users,
  Key,
  BookOpen,
  MessageSquare,
} from "lucide-react";

import { NavItemType } from "../types";

// ── Permission helpers ─────────────────────────────────────────────────────
const canView   = (a: Record<string, any> | null, key: string) => Boolean(a?.[key]?.view);
const canAccess = (a: Record<string, any> | null, key: string) => Boolean(a?.[key]?.view || a?.[key]?.edit);

// ── Hook ──────────────────────────────────────────────────────────────────
export const useNavigation = (accessData: Record<string, any> | null): NavItemType[] => {
  return useMemo(() => {
    const has       = (key: string) => canView(accessData, key);
    const hasAccess = (key: string) => canAccess(accessData, key);

    // Show URM Management if user has access to the group key OR any individual sub-module
    const hasUrm =
      hasAccess("urm_management") ||
      hasAccess("user_management") ||
      hasAccess("role_management") ||
      hasAccess("module_management");

    const settingsChildren: NavItemType[] = [
      ...(hasUrm
        ? [{ name: "URM Management", href: "/setting-config/user-management", icon: Users }]
        : []),
      ...(hasAccess("api_key_management")
        ? [{ name: "API Key Management", href: "/setting-config/api-key-management", icon: Key }]
        : []),
    ];

    const items: NavItemType[] = [
      // Dashboards — role-based, only one will show per user
      ...(has("data-dashboard")           ? [{ name: "Dashboard", href: "/dashboard-admin",          icon: LayoutDashboard }] : []),
      ...(has("dashboard-tso")            ? [{ name: "Dashboard", href: "/dashboard-tso",            icon: LayoutDashboard }] : []),
      ...(has("dashboard-manager")        ? [{ name: "Dashboard", href: "/dashboard-manager",        icon: LayoutDashboard }] : []),
      ...(has("dashboard-branch-manager") ? [{ name: "Dashboard", href: "/dashboard-branch-manager", icon: LayoutDashboard }] : []),
      ...(has("dashboard-team-leader")    ? [{ name: "Dashboard", href: "/dashboard-team-leader",    icon: LayoutDashboard }] : []),

      // Main modules — permission-gated
      ...(hasAccess("booking_management")
        ? [{ name: "Booking Management", href: "/booking-management", icon: BookOpen }]
        : []),

      // Always visible
      { name: "Help Chat", href: "/help-chat", icon: MessageSquare },

      // Settings & Config group — renders only if at least one child is accessible
      ...(settingsChildren.length > 0
        ? [{ name: "Settings & Config", icon: Settings, children: settingsChildren }]
        : []),
    ];

    return items;
  }, [accessData]);
};
