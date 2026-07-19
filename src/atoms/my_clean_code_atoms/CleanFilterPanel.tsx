import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { CleanInput } from "./CleanInput";
import { CleanAsyncSelect, staticOptionsFetchPage, type AsyncSelectFetchParams, type AsyncSelectPage } from "./CleanAsyncSelect";
import { CleanButton } from "./CleanButton";
import type { SelectOption } from "./CleanSelect";

// ── Field config ─────────────────────────────────────────────────────────────

export type FilterFieldConfig =
  | { type: "text"; key: string; label: string; placeholder?: string }
  | { type: "select"; key: string; label: string; options: SelectOption[]; placeholder?: string }
  | {
      type: "async-select"; key: string; label: string;
      fetchPage: (params: AsyncSelectFetchParams) => Promise<AsyncSelectPage>;
      placeholder?: string; searchPlaceholder?: string;
    }
  | { type: "boolean"; key: string; label: string; trueLabel?: string; falseLabel?: string }
  | { type: "date"; key: string; label: string }
  | { type: "date-range"; fromKey: string; toKey: string; label: string };

export interface CleanFilterPanelProps {
  isOpen:       boolean;
  onClose:      () => void;
  fields:       FilterFieldConfig[];
  values:       Record<string, string>;
  onChange:     (key: string, value: string, option?: SelectOption | null) => void;
  onClear:      () => void;
  activeCount:  number;
  minWidth?:    number;
  zIndex?:      number;
  title?:       string;
  /** "dropdown" (default) anchors under the trigger button, like a select menu.
   *  "drawer" slides in from the right edge of the screen with a backdrop —
   *  better for a long list of fields. */
  variant?:     "dropdown" | "drawer";
  /** Ref to the button that opens this panel — clicks on it are excluded from
   *  the outside-click close, so the trigger's own toggle isn't fought by the
   *  panel closing itself first on the same click. Only used by "dropdown". */
  triggerRef?:  React.RefObject<HTMLElement>;
}

// ── Component ──────────────────────────────────────────────────────────────

export const CleanFilterPanel: React.FC<CleanFilterPanelProps> = ({
  isOpen, onClose, fields, values, onChange, onClear, activeCount,
  minWidth = 260, zIndex = 50, title = "Filters", variant = "dropdown", triggerRef,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (variant !== "dropdown" || !isOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (triggerRef?.current?.contains(target)) return;
      onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [variant, isOpen, onClose, triggerRef]);

  // Esc closes the drawer variant
  useEffect(() => {
    if (variant !== "drawer" || !isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [variant, isOpen, onClose]);

  if (!isOpen) return null;

  const fieldNodes = fields.map((f) => {
        if (f.type === "text") {
          return (
            <CleanInput
              key={f.key}
              label={f.label}
              value={values[f.key] ?? ""}
              placeholder={f.placeholder}
              onChange={(e) => onChange(f.key, e.target.value)}
            />
          );
        }
        if (f.type === "select") {
          return (
            <CleanAsyncSelect
              key={f.key}
              label={f.label}
              value={values[f.key] ?? ""}
              fetchPage={staticOptionsFetchPage(f.options)}
              placeholder={f.placeholder ?? "Any"}
              clearable
              onChange={(value, option) => onChange(f.key, value, option)}
            />
          );
        }
        if (f.type === "async-select") {
          return (
            <CleanAsyncSelect
              key={f.key}
              label={f.label}
              value={values[f.key] ?? ""}
              fetchPage={f.fetchPage}
              placeholder={f.placeholder}
              searchPlaceholder={f.searchPlaceholder}
              clearable
              onChange={(value, option) => onChange(f.key, value, option)}
            />
          );
        }
        if (f.type === "boolean") {
          return (
            <CleanAsyncSelect
              key={f.key}
              label={f.label}
              value={values[f.key] ?? ""}
              fetchPage={async ({ search }: AsyncSelectFetchParams) => {
                const opts: SelectOption[] = [
                  { value: "true",  label: f.trueLabel  ?? "Yes" },
                  { value: "false", label: f.falseLabel ?? "No"  },
                ];
                const term = search.trim().toLowerCase();
                return { options: term ? opts.filter((o) => o.label.toLowerCase().includes(term)) : opts, hasMore: false };
              }}
              placeholder="Any"
              clearable
              onChange={(value) => onChange(f.key, value)}
            />
          );
        }
        if (f.type === "date") {
          return (
            <CleanInput
              key={f.key}
              label={f.label}
              type="date"
              value={values[f.key] ?? ""}
              onChange={(e) => onChange(f.key, e.target.value)}
            />
          );
        }
        // date-range
        return (
          <div key={`${f.fromKey}-${f.toKey}`} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: "var(--fi-label)" }}>{f.label}</label>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <CleanInput type="date" value={values[f.fromKey] ?? ""} onChange={(e) => onChange(f.fromKey, e.target.value)} />
              <span style={{ fontSize: 12, color: "var(--fi-muted)" }}>–</span>
              <CleanInput type="date" value={values[f.toKey] ?? ""} onChange={(e) => onChange(f.toKey, e.target.value)} />
            </div>
          </div>
        );
  });

  const clearButton = activeCount > 0 && (
    <CleanButton variant="danger" size="xs" onClick={onClear} style={{ width: "100%" }}>
      Clear filters
    </CleanButton>
  );

  if (variant === "drawer") {
    return (
      <>
        <div
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, zIndex,
            background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)",
          }}
        />
        <div
          style={{
            position: "fixed", top: 0, right: 0, bottom: 0, zIndex: zIndex + 1,
            width: "min(360px, 100vw)", background: "var(--fi-bg-panel)",
            borderLeft: "1px solid var(--fi-border)", boxShadow: "-8px 0 24px rgba(0,0,0,0.18)",
            display: "flex", flexDirection: "column",
          }}
        >
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 16px", borderBottom: "1px solid var(--fi-border)", flexShrink: 0,
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--fi-text)" }}>{title}</span>
            <button
              type="button" onClick={onClose} title="Close"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 6, border: "none", background: "transparent", color: "var(--fi-muted)", cursor: "pointer" }}
            >
              <X style={{ width: 15, height: 15 }} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            {fieldNodes}
          </div>

          {activeCount > 0 && (
            <div style={{ padding: 16, borderTop: "1px solid var(--fi-border)", flexShrink: 0 }}>
              {clearButton}
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <div
      ref={panelRef}
      style={{
        position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex,
        background: "var(--fi-bg-panel)", border: "1px solid var(--fi-border)",
        borderRadius: "var(--fi-radius)", boxShadow: "0 4px 20px rgba(0,0,0,0.10)", padding: 12,
        minWidth, maxHeight: "70vh", overflowY: "auto",
        display: "flex", flexDirection: "column", gap: 10,
      }}
    >
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--fi-muted)" }}>
        {title}
      </span>
      {fieldNodes}
      {clearButton}
    </div>
  );
};

export default CleanFilterPanel;
