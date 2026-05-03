import React from "react";
import { useLocation } from "react-router-dom";
import { NavListProps, NavItemType } from "../../types";
import NavItem from "./NavItem";

// ── NavList ────────────────────────────────────────────────────────────────
// Replaces the `renderNav` function that was called inside JSX.
// As a proper component it benefits from React's reconciliation,
// is independently testable, and reads cleanly at the call site.

const NavList: React.FC<NavListProps> = ({
  items,
  isCollapsed,
  level = 0,
  openItems,
  onNavClick,
  onToggle,
}) => {
  const location = useLocation();

  return (
    <>
      {items.map((item: NavItemType) => {
        const isActive = item.href
          ? location.pathname.startsWith(item.href)
          : false;
        const isOpen = openItems.has(item.name);

        return (
          <li key={item.name}>
            <NavItem
              item={item}
              isCollapsed={isCollapsed}
              isActive={isActive}
              level={level}
              isOpen={isOpen}
              onClick={onNavClick}
              onToggle={() => onToggle(item.name)}
            />

            {/* Recursive children */}
            {item.children && isOpen && !isCollapsed && (
              <ul className="space-y-1 mt-1">
                <NavList
                  items={item.children}
                  isCollapsed={isCollapsed}
                  level={level + 1}
                  openItems={openItems}
                  onNavClick={onNavClick}
                  onToggle={onToggle}
                />
              </ul>
            )}
          </li>
        );
      })}
    </>
  );
};

export default NavList;