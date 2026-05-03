import React from "react";
import { PanelLeftOpen } from "lucide-react";
import { Z_INDEX, TRANSITIONS } from "../../constants";
import { COLORS } from "../../../../theme/colors";

interface SidebarToggleProps {
  collapsed: boolean;
  isDarkMode: boolean;
  onExpand: () => void;
}

// ── Shared icon button style ───────────────────────────────────────────────
const iconBtnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 32,
  height: 32,
  borderRadius: "9999px",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  transition: TRANSITIONS.BACKGROUND,
};

// ── IconButton ─────────────────────────────────────────────────────────────
const IconButton: React.FC<{
  label: string;
  hoverBg: string;
  onClick?: () => void;
  children: React.ReactNode;
}> = ({ label, hoverBg, onClick, children }) => (
  <button
    onClick={onClick}
    aria-label={label}
    style={iconBtnStyle}
    onMouseEnter={(e) => (e.currentTarget.style.background = hoverBg)}
    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
  >
    {children}
  </button>
);

// ── SidebarToggle ──────────────────────────────────────────────────────────
const SidebarToggle: React.FC<SidebarToggleProps> = ({
  collapsed,
  isDarkMode,
  onExpand,
}) => {
  const iconColor = isDarkMode ? "#e5e7eb" : "#374151";
  const hoverBg = isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";

  return (
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
        backgroundColor: isDarkMode ? COLORS.dark.bgPrimary : "#ffffff",
        padding: "6px 8px",
        boxShadow: isDarkMode
          ? "0 2px 8px rgba(0,0,0,0.45)"
          : "0 2px 8px rgba(0,0,0,0.12)",
      }}
    >
      {/* Expand sidebar */}
      <IconButton label="Expand sidebar" hoverBg={hoverBg} onClick={onExpand}>
        <PanelLeftOpen className="w-5 h-5" style={{ color: iconColor }} />
      </IconButton>

      {/* Divider */}
      <div
        style={{
          width: 1,
          height: 20,
          background: isDarkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)",
          margin: "0 4px",
        }}
      />

      {/* New / compose */}
      <IconButton label="New conversation" hoverBg={hoverBg}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
          style={{ color: iconColor }}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      </IconButton>
    </div>
  );
};

export default SidebarToggle;