import React, { useState } from "react";

export interface CleanTextareaProps {
  label?:       string;
  placeholder?: string;
  value?:       string;
  defaultValue?: string;
  onChange?:    (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?:      (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  error?:       string;
  hint?:        string;
  disabled?:    boolean;
  required?:    boolean;
  readOnly?:    boolean;
  rows?:        number;
  resize?:      "none" | "vertical" | "horizontal" | "both";
  fontMono?:    boolean;
  style?:       React.CSSProperties;
  textareaStyle?: React.CSSProperties;
  name?:        string;
  id?:          string;
}

export const CleanTextarea: React.FC<CleanTextareaProps> = ({
  label,
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  error,
  hint,
  disabled  = false,
  required  = false,
  readOnly  = false,
  rows      = 4,
  resize    = "vertical",
  fontMono  = false,
  style,
  textareaStyle,
  name,
  id,
}) => {
  const [focused, setFocused] = useState(false);

  const textareaBaseStyle: React.CSSProperties = {
    width:        "100%",
    padding:      "8px 10px",
    background:   "var(--fi-bg)",
    border:       `1px solid ${error ? "var(--fi-border-error)" : focused ? "var(--fi-border-focus)" : "var(--fi-border)"}`,
    borderRadius: "var(--fi-radius)",
    boxShadow:    focused && !error ? "var(--fi-shadow-focus)" : "none",
    fontSize:     fontMono ? 12 : "var(--fi-font-size)",
    fontFamily:   fontMono ? "ui-monospace, 'Cascadia Code', Menlo, monospace" : "inherit",
    color:        "var(--fi-text)",
    outline:      "none",
    resize,
    transition:   "border-color 140ms ease, box-shadow 140ms ease",
    opacity:      disabled ? 0.5 : 1,
    boxSizing:    "border-box",
    cursor:       readOnly ? "default" : "text",
    lineHeight:   1.5,
    ...textareaStyle,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, ...style }}>
      {label && (
        <label
          htmlFor={id}
          style={{ fontSize: 12, fontWeight: 500, color: "var(--fi-label)", userSelect: "none" }}
        >
          {label}
          {required && <span style={{ color: "var(--fi-border-error)", marginLeft: 2 }}>*</span>}
        </label>
      )}

      <textarea
        id={id}
        name={name}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        onFocus={() => setFocused(true)}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        rows={rows}
        style={textareaBaseStyle}
      />

      {error && (
        <span style={{ fontSize: 11, color: "var(--fi-border-error)" }}>{error}</span>
      )}
      {!error && hint && (
        <span style={{ fontSize: 11, color: "var(--fi-muted)" }}>{hint}</span>
      )}
    </div>
  );
};

export default CleanTextarea;
