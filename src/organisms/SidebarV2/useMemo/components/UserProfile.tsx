import React from "react";
import { ChevronDown, Sun, Moon, User, LogOut } from "lucide-react";
import { UserProfileProps } from "../../types";

const getInitials = (name: string): string =>
  name.split(" ").map((w) => w.charAt(0)).join("").toUpperCase().slice(0, 2);

// ── Avatar ─────────────────────────────────────────────────────────────────
const Avatar: React.FC<{ name: string }> = ({ name }) => (
  <div style={{ position: "relative", flexShrink: 0 }}>
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--sb-text-active)",
        color: "var(--sb-bg)",
        fontSize: 12,
        fontWeight: 600,
        userSelect: "none",
      }}
    >
      {getInitials(name)}
    </div>
    <div
      style={{
        position: "absolute",
        bottom: -1,
        right: -1,
        width: 9,
        height: 9,
        borderRadius: "50%",
        background: "#22c55e",
        border: "2px solid var(--sb-bg)",
      }}
    />
  </div>
);

// ── ThemeToggle ────────────────────────────────────────────────────────────
const ThemeToggle: React.FC<{ isDarkMode: boolean; onToggle: () => void }> = ({ isDarkMode, onToggle }) => (
  <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--sb-border)" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      {/* Icon + label */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {isDarkMode
          ? <Moon style={{ width: 14, height: 14, color: "#a5b4fc", flexShrink: 0 }} />
          : <Sun  style={{ width: 14, height: 14, color: "#ca8a04", flexShrink: 0 }} />
        }
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--sb-text-active)", margin: "0 0 2px" }}>Theme</p>
          <p style={{ fontSize: 11, color: "var(--sb-text-dim)", margin: 0 }}>{isDarkMode ? "Dark mode" : "Light mode"}</p>
        </div>
      </div>
      {/* Clean pill toggle — no track icons, no overlap */}
      <button
        onClick={onToggle}
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, flexShrink: 0 }}
      >
        <div
          style={{
            position:   "relative",
            width:      36,
            height:     20,
            borderRadius: 10,
            background: isDarkMode ? "#4b5563" : "#d1d5db",
            transition: "background 200ms ease",
          }}
        >
          <div
            style={{
              position:   "absolute",
              top:        "50%",
              transform:  "translateY(-50%)",
              left:       isDarkMode ? 17 : 2,
              width:      16,
              height:     16,
              borderRadius: "50%",
              background: "#ffffff",
              boxShadow:  "0 1px 3px rgba(0,0,0,0.30)",
              transition: "left 200ms ease",
            }}
          />
        </div>
      </button>
    </div>
  </div>
);

// ── ProfileDropdown ────────────────────────────────────────────────────────
const ProfileDropdown: React.FC<{
  userName: string;
  userEmail: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onProfileClick: () => void;
  onLogoutClick: () => void;
}> = ({ userName, userEmail, isDarkMode, onToggleDarkMode, onProfileClick, onLogoutClick }) => (
  <div
    style={{
      position: "absolute",
      bottom: "100%",
      left: 8,
      right: 8,
      marginBottom: 6,
      background: "var(--sb-elevated)",
      borderRadius: 8,
      boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
      border: "1px solid var(--sb-border)",
      overflow: "hidden",
      zIndex: 50,
    }}
  >
    {/* User info */}
    <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--sb-border)" }}>
      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--sb-text-active)", margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userName}</p>
      <p style={{ fontSize: 11, color: "var(--sb-text-dim)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userEmail}</p>
    </div>

    <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleDarkMode} />

    {/* Profile */}
    <button
      onClick={onProfileClick}
      style={{ display: "flex", alignItems: "center", width: "100%", padding: "9px 12px", fontSize: 13, color: "var(--sb-text)", background: "transparent", border: "none", cursor: "pointer", transition: "background 150ms ease", boxSizing: "border-box" }}
      onMouseEnter={e => { e.currentTarget.style.background = "var(--sb-hover)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
    >
      <User style={{ width: 14, height: 14, marginRight: 10, flexShrink: 0 }} />
      My Profile
    </button>

    {/* Logout */}
    <div style={{ borderTop: "1px solid var(--sb-border)" }}>
      <button
        onClick={onLogoutClick}
        style={{ display: "flex", alignItems: "center", width: "100%", padding: "9px 12px", fontSize: 13, color: "#ef4444", background: "transparent", border: "none", cursor: "pointer", transition: "background 150ms ease", boxSizing: "border-box" }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
      >
        <LogOut style={{ width: 14, height: 14, marginRight: 10, flexShrink: 0 }} />
        Sign out
      </button>
    </div>
  </div>
);

// ── UserProfile ────────────────────────────────────────────────────────────
const UserProfile: React.FC<UserProfileProps> = ({
  isCollapsed = false,
  userName,
  userEmail,
  isDarkMode,
  profileDropdownOpen,
  onToggleDropdown,
  onToggleDarkMode,
  onProfileClick,
  onLogoutClick,
}) => (
  <div style={{ position: "relative", borderTop: "1px solid var(--sb-border)", padding: "6px" }}>
    <button
      onClick={onToggleDropdown}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: isCollapsed ? "center" : "flex-start",
        width: "100%",
        minHeight: 38,
        padding: isCollapsed ? "4px 0" : "4px 8px",
        gap: 10,
        borderRadius: 8,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        transition: "background 140ms ease",
        boxSizing: "border-box",
      }}
      onMouseEnter={e => { e.currentTarget.style.background = "var(--sb-hover)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
    >
      <Avatar name={userName} />
      {!isCollapsed && (
        <>
          <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "var(--sb-text-active)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.3 }}>
              {userName}
            </p>
          </div>
          <ChevronDown
            style={{
              width: 14,
              height: 14,
              color: "var(--sb-text-dim)",
              flexShrink: 0,
              transition: "transform 200ms ease",
              transform: profileDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </>
      )}
    </button>

    {profileDropdownOpen && !isCollapsed && (
      <ProfileDropdown
        userName={userName}
        userEmail={userEmail}
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
        onProfileClick={onProfileClick}
        onLogoutClick={onLogoutClick}
      />
    )}
  </div>
);

export default UserProfile;
