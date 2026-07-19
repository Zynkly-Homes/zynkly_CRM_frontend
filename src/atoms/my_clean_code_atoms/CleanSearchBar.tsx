import React, { useState } from "react";
import { Search, X } from "lucide-react";

export interface CleanSearchBarProps {
  value?:       string;
  onChange?:    (value: string) => void;
  /** Fires when Enter is pressed in the input — use for search-on-submit
   *  instead of live/debounced search (e.g. only calling the API on Enter). */
  onEnter?:     (value: string) => void;
  placeholder?: string;
  width?:       number | string;
  disabled?:    boolean;
  onClear?:     () => void;
  style?:       React.CSSProperties;
  autoFocus?:   boolean;
  /** Opt-in tinted "premium" look (accent border/icon) instead of the flat
   *  neutral default — doesn't change any existing usage unless passed. */
  accent?:      boolean;
}

export const CleanSearchBar: React.FC<CleanSearchBarProps> = ({
  value       = "",
  onChange,
  onEnter,
  placeholder = "Search…",
  width       = 220,
  disabled    = false,
  onClear,
  style,
  autoFocus,
  accent      = false,
}) => {
  const [focused, setFocused] = useState(false);

  const hasValue = value.length > 0;
  const highlighted = accent && (focused || hasValue);

  const wrapStyle: React.CSSProperties = {
    position:     "relative",
    display:      "inline-flex",
    alignItems:   "center",
    width,
    height:       "var(--fi-height)",
    background:   accent ? "var(--badge-blue-bg)" : "var(--fi-bg)",
    border:       `1px solid ${highlighted ? "var(--badge-blue-text)" : focused ? "var(--fi-border-focus)" : accent ? "transparent" : "var(--fi-border)"}`,
    borderRadius: "var(--fi-radius)",
    boxShadow:    focused ? (accent ? "0 0 0 3px rgba(59,130,246,0.15)" : "var(--fi-shadow-focus)") : "none",
    transition:   "border-color 140ms ease, box-shadow 140ms ease, background 140ms ease",
    opacity:      disabled ? 0.5 : 1,
    boxSizing:    "border-box",
    ...style,
  };

  return (
    <div style={wrapStyle}>
      <span style={{ display: "flex", alignItems: "center", paddingLeft: 8, color: highlighted ? "var(--badge-blue-text)" : focused ? "var(--fi-border-focus)" : "var(--fi-muted)", flexShrink: 0, transition: "color 140ms ease" }}>
        <Search style={{ width: 13, height: 13 }} />
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onEnter?.(value); }}
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
          onClick={() => { onChange?.(""); onEnter?.(""); onClear?.(); }}
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
