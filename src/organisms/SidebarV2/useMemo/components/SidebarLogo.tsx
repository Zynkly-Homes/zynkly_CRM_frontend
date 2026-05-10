import React from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

interface SidebarLogoProps {
  isCollapsed: boolean;
  isHovered?: boolean;
  onCollapse: () => void;
  onExpand: () => void;
}

const logoBox: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 7,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--sb-text-active)",
  color: "var(--sb-bg)",
  fontWeight: 800,
  fontSize: 14,
  userSelect: "none",
  flexShrink: 0,
  letterSpacing: "-0.02em",
};

const iconBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 28,
  height: 28,
  borderRadius: 6,
  border: "1px solid var(--sb-border)",
  background: "transparent",
  cursor: "pointer",
  color: "var(--sb-text-dim)",
  transition: "background 140ms ease, color 140ms ease, border-color 140ms ease",
  flexShrink: 0,
};

const SidebarLogo: React.FC<SidebarLogoProps> = ({ isCollapsed, isHovered, onCollapse, onExpand }) => {
  if (isCollapsed) {
    return (
      <div style={{ padding: "10px 0 9px", display: "flex", justifyContent: "center", borderBottom: "1px solid var(--sb-border)" }}>
        <button
          onClick={onExpand}
          aria-label="Expand sidebar"
          style={{ ...iconBtn, width: 32, height: 32, borderRadius: 8, border: "none" }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--sb-hover)"; e.currentTarget.style.color = "var(--sb-text-active)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--sb-text-dim)"; }}
        >
          {isHovered
            ? <PanelLeftOpen style={{ width: 16, height: 16 }} />
            : <span style={logoBox}>N</span>
          }
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 10px 9px",
        borderBottom: "1px solid var(--sb-border)",
      }}
    >
      {/* Logo mark + brand name */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden", minWidth: 0 }}>
        <span style={logoBox}>N</span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "var(--sb-text-active)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            letterSpacing: "-0.01em",
          }}
        >
          Zynkly
        </span>
      </div>

      {/* Collapse button — styled like Dunwork's [<] button */}
      <button
        onClick={onCollapse}
        aria-label="Collapse sidebar"
        style={iconBtn}
        onMouseEnter={e => { e.currentTarget.style.background = "var(--sb-hover)"; e.currentTarget.style.color = "var(--sb-text)"; e.currentTarget.style.borderColor = "var(--sb-text-dim)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--sb-text-dim)"; e.currentTarget.style.borderColor = "var(--sb-border)"; }}
      >
        <PanelLeftClose style={{ width: 14, height: 14 }} />
      </button>
    </div>
  );
};

export default SidebarLogo;
