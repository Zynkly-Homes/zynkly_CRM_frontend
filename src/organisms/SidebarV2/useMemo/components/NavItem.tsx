import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronDown } from "lucide-react";
import { NavItemProps } from "../../types";
import { emitNavStart } from "../../../../atoms/NavigationProgress";

// ── Icon — muted gray, does not inherit text color so it stays subtle
// even when the label is dark/active. Matches Dunwork's icon treatment.
const NavIcon: React.FC<{ Icon: React.ComponentType<{ className?: string }>; isActive: boolean }> = ({ Icon, isActive }) => (
  <span
    style={{
      width: 18,
      height: 18,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      color: isActive ? "var(--sb-text)" : "var(--sb-text-dim)",
      transition: "color 140ms ease",
    }}
  >
    <Icon className="w-[14px] h-[14px]" />
  </span>
);

const itemStyle = (isActive: boolean, level: number): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  width: "100%",
  padding: level > 0 ? "3px 6px 3px 4px" : "4px 8px",
  gap: 6,
  borderRadius: 5,
  fontSize: 13,
  fontWeight: 400,
  cursor: "pointer",
  transition: "background 120ms ease",
  background: isActive ? "var(--sb-active)" : "transparent",
  color: isActive ? "var(--sb-text-active)" : "var(--sb-text)",
  border: "none",
  textDecoration: "none",
  boxSizing: "border-box",
  lineHeight: 1.3,
});

// ── NavLinkItem ────────────────────────────────────────────────────────────
const NavLinkItem: React.FC<NavItemProps> = ({ item, isCollapsed, isActive, level = 0, onClick }) => (
  <Link
    to={item.href!}
    onClick={() => { emitNavStart(); onClick?.(); }}
    title={isCollapsed ? item.name : undefined}
    style={{
      ...itemStyle(!!isActive, level),
      justifyContent: isCollapsed ? "center" : "flex-start",
    }}
    onMouseEnter={e => {
      if (!isActive) {
        (e.currentTarget as HTMLElement).style.background = "var(--sb-hover)";
      }
    }}
    onMouseLeave={e => {
      if (!isActive) {
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }
    }}
  >
    {item.icon && <NavIcon Icon={item.icon} isActive={!!isActive} />}
    {!isCollapsed && (
      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {item.name}
      </span>
    )}
  </Link>
);

// ── NavButtonItem — for items with children (accordion) ───────────────────
const NavButtonItem: React.FC<NavItemProps> = ({ item, isCollapsed, level = 0, isOpen, onToggle }) => (
  <button
    onClick={onToggle}
    title={isCollapsed ? item.name : undefined}
    style={{
      ...itemStyle(false, level),
      justifyContent: isCollapsed ? "center" : "flex-start",
    }}
    aria-expanded={isOpen}
    onMouseEnter={e => {
      e.currentTarget.style.background = "var(--sb-hover)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = "transparent";
    }}
  >
    {item.icon && <NavIcon Icon={item.icon} isActive={false} />}
    {!isCollapsed && (
      <>
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "left" }}>
          {item.name}
        </span>
        {!!item.children?.length && (
          isOpen
            ? <ChevronDown className="w-[14px] h-[14px] flex-shrink-0" style={{ color: "var(--sb-text-dim)" }} />
            : <ChevronRight className="w-[14px] h-[14px] flex-shrink-0" style={{ color: "var(--sb-text-dim)" }} />
        )}
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
