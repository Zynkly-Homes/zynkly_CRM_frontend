import React from "react";
import { PanelLeftOpen } from "lucide-react";
import { Z_INDEX, TRANSITIONS } from "../../constants";

interface SidebarToggleProps {
  collapsed: boolean;
  isDarkMode: boolean;
  onExpand: () => void;
}

const iconBtnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 30,
  height: 30,
  borderRadius: "50%",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  transition: TRANSITIONS.BACKGROUND,
  color: "var(--sb-text)",
};

const IconButton: React.FC<{ label: string; onClick?: () => void; children: React.ReactNode }> = ({ label, onClick, children }) => (
  <button
    onClick={onClick}
    aria-label={label}
    style={iconBtnStyle}
    onMouseEnter={e => { e.currentTarget.style.background = "var(--sb-hover)"; }}
    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
  >
    {children}
  </button>
);

const SidebarToggle: React.FC<SidebarToggleProps> = ({ collapsed, onExpand }) => (
  <div
    style={{
      position: "fixed",
      top: "0.75rem",
      left: "1rem",
      zIndex: Z_INDEX.TOGGLE,
      opacity: collapsed ? 1 : 0,
      pointerEvents: collapsed ? "auto" : "none",
      transition: TRANSITIONS.OPACITY,
      display: "flex",
      alignItems: "center",
      borderRadius: "9999px",
      backgroundColor: "var(--sb-elevated)",
      border: "1px solid var(--sb-border)",
      padding: "4px 6px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    }}
  >
    <IconButton label="Expand sidebar" onClick={onExpand}>
      <PanelLeftOpen style={{ width: 16, height: 16 }} />
    </IconButton>
  </div>
);

export default SidebarToggle;
