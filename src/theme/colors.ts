/**
 * Platform design token system — single source of truth.
 *
 * CSS variables (src/index.css) are the primary source for all components.
 * This JS object mirrors them for contexts that can't use CSS vars
 * (e.g. charting libraries, canvas rendering, server-side code).
 *
 * Changing a value here does NOT auto-update CSS vars — update both files.
 * Changing index.css updates every component that reads var(--*) automatically.
 */

export const TOKENS = {
  /* ── Shell ──────────────────────────────────────────────────────────── */
  shell: {
    light: { bg: "#f0f0f0", card: "#ffffff", surface: "#f7f7f8", border: "#e4e4e7" },
    dark:  { bg: "#0f0f10", card: "#1a1a1b", surface: "#141415", border: "rgba(255,255,255,0.07)" },
  },

  /* ── Sidebar ─────────────────────────────────────────────────────────── */
  sidebar: {
    light: {
      bg:          "#f7f7f8",
      elevated:    "#ffffff",
      hover:       "#e8e8e8",
      active:      "#dedee0",
      text:        "#1a1a1a",
      textDim:     "#8a8a8a",
      textActive:  "#0d0d0d",
      border:      "#e5e5e5",
    },
    dark: {
      bg:          "#131314",
      elevated:    "#1c1c1e",
      hover:       "#202022",
      active:      "#252527",
      text:        "#d1d1d1",
      textDim:     "#6b6b6b",
      textActive:  "#f0f0f0",
      border:      "rgba(255,255,255,0.06)",
    },
  },

  /* ── DataTable ───────────────────────────────────────────────────────── */
  table: {
    light: {
      bg:          "#ffffff",
      header:      "#f8f8f8",
      hover:       "#f3f3f3",
      border:      "#e8e8e8",
      text:        "#1f1f1f",
      dim:         "#555555",
      muted:       "#9e9e9e",
    },
    dark: {
      bg:          "#1e1e1e",
      header:      "#252526",
      hover:       "#2a2d2e",
      border:      "#3d3d3d",
      text:        "#d4d4d4",
      dim:         "#9d9d9d",
      muted:       "#6b6b6b",
    },
  },
} as const;

// Kept for legacy imports (buttons, loaders, forms).
// Primary blue is intentional for interactive action elements — not the sidebar nav.
export const COLORS = {
  primary: {
    DEFAULT: "#4550E6",   // action buttons, form focus rings, progress indicators
    hover:   "#4550E6CC",
    active:  "#3a44d4",
  },
  dark: {
    bgPrimary:  TOKENS.sidebar.dark.elevated,
    bgSidebar:  TOKENS.sidebar.dark.bg,
    bgElevated: TOKENS.sidebar.dark.elevated,
    bgSunken:   TOKENS.shell.dark.surface,
    bgHover:    TOKENS.sidebar.dark.hover,
    border:     TOKENS.sidebar.dark.border,
  },
};
