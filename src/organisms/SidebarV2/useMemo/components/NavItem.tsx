import React from "react";
import { Link, useLocation } from "react-router-dom";
import { clsx } from "clsx";
import { NavItemProps } from "../../types";

const PRIMARY = "#4550E6";
const PRIMARY_BG_LIGHT = "rgba(69,80,230,0.08)";

// ── Icon always in a fixed-width container → same X position collapsed or expanded
const NavIcon: React.FC<{
  Icon: React.ComponentType<{ className?: string }>;
}> = ({ Icon }) => (
  <span className="w-10 flex items-center justify-center flex-shrink-0">
    <Icon className="h-5 w-5" />
  </span>
);

// ── NavChevron ─────────────────────────────────────────────────────────────
const NavChevron: React.FC<{ isOpen?: boolean }> = ({ isOpen }) => (
  <span className={clsx("ml-auto text-xs transition-transform duration-200", isOpen && "rotate-180")}>
    ▼
  </span>
);

// ── Shared wrapper class — px-3 always so icon X position never changes ───
const itemClass = (isActive: boolean, level: number) =>
  clsx(
    "flex items-center w-full px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150",
    isActive
      ? "dark:text-[#a5abf8]"
      : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800/70 hover:text-gray-900 dark:hover:text-slate-200",
    level > 0 && "pl-3"
  );

// ── NavLinkItem ────────────────────────────────────────────────────────────
const NavLinkItem: React.FC<NavItemProps> = ({ item, isCollapsed, isActive, level = 0, onClick }) => (
  <Link
    to={item.href!}
    onClick={onClick}
    title={isCollapsed ? item.name : undefined}
    className={itemClass(isActive, level)}
    style={isActive ? { backgroundColor: PRIMARY_BG_LIGHT, color: PRIMARY } : undefined}
  >
    <NavIcon Icon={item.icon} />
    {!isCollapsed && (
      <span className="flex-1 truncate text-left leading-none">{item.name}</span>
    )}
  </Link>
);

// ── NavButtonItem ──────────────────────────────────────────────────────────
const NavButtonItem: React.FC<NavItemProps> = ({ item, isCollapsed, level = 0, isOpen, onToggle }) => (
  <button
    onClick={onToggle}
    title={isCollapsed ? item.name : undefined}
    className={itemClass(false, level)}
    aria-expanded={isOpen}
  >
    <NavIcon Icon={item.icon} />
    {!isCollapsed && (
      <>
        <span className="flex-1 truncate text-left leading-none">{item.name}</span>
        {!!item.children?.length && <NavChevron isOpen={isOpen} />}
      </>
    )}
  </button>
);

// ── NavItem ────────────────────────────────────────────────────────────────
const NavItem: React.FC<NavItemProps> = (props) => {
  if (props.item.href) return <NavLinkItem {...props} />;
  return <NavButtonItem {...props} />;
};

export default NavItem;
