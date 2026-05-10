import React, { useState } from "react";
import { Search, X } from "lucide-react";

export interface CleanSearchBarProps {
  value?:       string;
  onChange?:    (value: string) => void;
  placeholder?: string;
  width?:       number | string;
  disabled?:    boolean;
  onClear?:     () => void;
  style?:       React.CSSProperties;
  autoFocus?:   boolean;
}

export const CleanSearchBar: React.FC<CleanSearchBarProps> = ({
  value       = "",
  onChange,
  placeholder = "Search…",
  width       = 220,
  disabled    = false,
  onClear,
  style,
  autoFocus,
}) => {
  const [focused, setFocused] = useState(false);

  const hasValue = value.length > 0;

  const wrapStyle: React.CSSProperties = {
    position:     "relative",
    display:      "inline-flex",
    alignItems:   "center",
    width,
    height:       "var(--fi-height)",
    background:   "var(--fi-bg)",
    border:       `1px solid ${focused ? "var(--fi-border-focus)" : "var(--fi-border)"}`,
    borderRadius: "var(--fi-radius)",
    boxShadow:    focused ? "var(--fi-shadow-focus)" : "none",
    transition:   "border-color 140ms ease, box-shadow 140ms ease",
    opacity:      disabled ? 0.5 : 1,
    boxSizing:    "border-box",
    ...style,
  };

  return (
    <div style={wrapStyle}>
      <span style={{ display: "flex", alignItems: "center", paddingLeft: 8, color: focused ? "var(--fi-border-focus)" : "var(--fi-muted)", flexShrink: 0, transition: "color 140ms ease" }}>
        <Search style={{ width: 13, height: 13 }} />
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        style={{
          flex:       1,
          minWidth:   0,
          height:     "100%",
          padding:    "0 6px",
          background: "transparent",
          border:     "none",
          outline:    "none",
          fontSize:   "var(--fi-font-size)",
          color:      "var(--fi-text)",
        }}
      />
      {hasValue && (
        <button
          type="button"
          onClick={() => { onChange?.(""); onClear?.(); }}
          style={{
            display:    "flex",
            alignItems: "center",
            justifyContent: "center",
            padding:    "0 7px",
            height:     "100%",
            background: "transparent",
            border:     "none",
            cursor:     "pointer",
            color:      "var(--fi-muted)",
            flexShrink: 0,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--fi-text)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--fi-muted)"; }}
        >
          <X style={{ width: 12, height: 12 }} />
        </button>
      )}
    </div>
  );
};

export default CleanSearchBar;
