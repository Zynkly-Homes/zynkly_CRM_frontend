import React from "react";
import { useLocation } from "react-router-dom";
import { NavListProps, NavItemType } from "../../types";
import NavItem from "./NavItem";

// ── GroupHeader — bold uppercase section label (Dunwork style) ─────────────
const GroupHeader: React.FC<{ name: string; isCollapsed: boolean }> = ({ name, isCollapsed }) => {
  if (isCollapsed) {
    return (
      <li style={{ listStyle: "none", padding: "4px 0 2px" }}>
        <div style={{ height: 1, background: "var(--sb-border)", margin: "0 6px" }} />
      </li>
    );
  }
  return (
    <li style={{ listStyle: "none", padding: "6px 8px 2px" }}>
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--sb-text-dim)",
          userSelect: "none",
        }}
      >
        {name}
      </span>
    </li>
  );
};

// ── NavList ────────────────────────────────────────────────────────────────
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
      {items.map((item: NavItemType, index: number) => {
        // Group header — render as section label, not a nav link
        if (item.kind === "group") {
          return <GroupHeader key={`group-${item.name}-${index}`} name={item.name} isCollapsed={isCollapsed} />;
        }

        const isActive = item.href ? location.pathname.startsWith(item.href) : false;
        const isOpen   = openItems.has(item.name);

        return (
          <li key={item.name} style={{ listStyle: "none" }}>
            <NavItem
              item={item}
              isCollapsed={isCollapsed}
              isActive={isActive}
              level={level}
              isOpen={isOpen}
              onClick={onNavClick}
              onToggle={() => onToggle(item.name)}
            />

            {/* Children — indented, no left-border line (Dunwork style) */}
            {item.children && isOpen && !isCollapsed && (
              <ul
                style={{
                  listStyle: "none",
                  margin: "1px 0 1px 10px",
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 0,
                }}
              >
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
