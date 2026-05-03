import React from "react";

// ── Nav ────────────────────────────────────────────────────────────────────
export interface NavItemType {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItemType[];
}

// ── Sidebar ────────────────────────────────────────────────────────────────
export interface SidebarProps {
  /** Controlled collapsed state from parent layout */
  collapsed?: boolean;
  /** Called whenever Sidebar internally changes collapsed state */
  onCollapsedChange?: (collapsed: boolean) => void;
}

// ── UserProfile ────────────────────────────────────────────────────────────
export interface UserProfileProps {
  isCollapsed?: boolean;
  userName: string;
  userEmail: string;
  isDarkMode: boolean;
  profileDropdownOpen: boolean;
  onToggleDropdown: () => void;
  onToggleDarkMode: () => void;
  onProfileClick: () => void;
  onLogoutClick: () => void;
}

// ── NavList ────────────────────────────────────────────────────────────────
export interface NavListProps {
  items: NavItemType[];
  isCollapsed: boolean;
  level?: number;
  openItems: Set<string>;
  onNavClick: () => void;
  onToggle: (name: string) => void;
}

// ── NavItem ────────────────────────────────────────────────────────────────
export interface NavItemProps {
  item: NavItemType;
  isCollapsed: boolean;
  isActive: boolean;
  level?: number;
  isOpen?: boolean;
  onClick?: () => void;
  onToggle?: () => void;
}