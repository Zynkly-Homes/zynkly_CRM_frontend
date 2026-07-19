import React from "react";
import { X } from "lucide-react";
import type { FilterFieldConfig } from "./CleanFilterPanel";

export interface CleanFilterChipsProps {
  fields:          FilterFieldConfig[];
  values:          Record<string, string>;
  onRemove:        (keys: string[]) => void;
  onClearAll:      () => void;
  /** Override the displayed text for a field's value (e.g. an id → the
   *  human name the user actually picked in an async-select). */
  displayValues?:  Record<string, string>;
}

interface Chip {
  keys: string[];
  text: string;
}

function buildChips(
  fields: FilterFieldConfig[],
  values: Record<string, string>,
  displayValues?: Record<string, string>,
): Chip[] {
  const chips: Chip[] = [];

  for (const f of fields) {
    if (f.type === "date-range") {
      const from = values[f.fromKey];
      const to   = values[f.toKey];
      if (from || to) chips.push({ keys: [f.fromKey, f.toKey], text: `${f.label}: ${from || "…"} – ${to || "…"}` });
      continue;
    }

    const raw = values[f.key];
    if (!raw) continue;

    let display = displayValues?.[f.key] ?? raw;
    if (f.type === "select") display = f.options.find((o) => o.value === raw)?.label ?? display;
    if (f.type === "boolean") display = raw === "true" ? (f.trueLabel ?? "Yes") : (f.falseLabel ?? "No");

    chips.push({ keys: [f.key], text: `${f.label}: ${display}` });
  }

  return chips;
}

export const CleanFilterChips: React.FC<CleanFilterChipsProps> = ({ fields, values, onRemove, onClearAll, displayValues }) => {
  const chips = buildChips(fields, values, displayValues);
  if (chips.length === 0) return null;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
      {chips.map((c) => (
        <span
          key={c.keys.join("|")}
          style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 6px 3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 500,
            background: "var(--sb-hover)", border: "1px solid var(--fi-border)", color: "var(--fi-text)",
          }}
        >
          {c.text}
          <button
            type="button"
            onClick={() => onRemove(c.keys)}
            title="Remove filter"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 16, height: 16, borderRadius: "50%", border: "none",
              background: "transparent", color: "var(--fi-muted)", cursor: "pointer", padding: 0,
            }}
          >
            <X style={{ width: 11, height: 11 }} />
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={onClearAll}
        style={{
          fontSize: 12, fontWeight: 500, color: "var(--btn-primary-bg)",
          background: "transparent", border: "none", cursor: "pointer", padding: "3px 4px",
        }}
      >
        Clear all
      </button>
    </div>
  );
};

export default CleanFilterChips;
