// ── Storage ────────────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  SIDEBAR_COLLAPSED: "uttm_sidebar_collapsed_v4",
  DARK_MODE: "darkMode",
  COUNTDOWN_START: "countdownStartTime",
  AUTH_USER: "auth_user_storage",
  TOGGLE_TIMESTAMP: "uttm_toggle_sidebar_timestamp",
} as const;

export const COOKIE_KEYS = ["t", "uid", "auth_user", "role_id"] as const;

// ── Events ─────────────────────────────────────────────────────────────────
export const SIDEBAR_EVENTS = {
  TOGGLE: "uttm-toggle-sidebar",
  TOGGLE_MOBILE: "toggleSidebarMobile",
} as const;

// ── Breakpoints ────────────────────────────────────────────────────────────
export const BREAKPOINTS = {
  MOBILE: 1024,
} as const;

// ── Z-index ────────────────────────────────────────────────────────────────
export const Z_INDEX = {
  BACKDROP: 99980,
  SIDEBAR: 99990,
  TOGGLE: 99999,
} as const;

// ── Animation ──────────────────────────────────────────────────────────────
export const ANIMATION = {
  EASE: "cubic-bezier(0.4, 0, 0.2, 1)",
  DURATION: "200ms",
} as const;

export const TRANSITIONS = {
  SIDEBAR: `transform ${ANIMATION.DURATION} ${ANIMATION.EASE}, opacity ${ANIMATION.DURATION} ${ANIMATION.EASE}`,
  MOBILE: `transform ${ANIMATION.DURATION} ${ANIMATION.EASE}`,
  OPACITY: `opacity ${ANIMATION.DURATION} ${ANIMATION.EASE}`,
  BACKGROUND: `background ${ANIMATION.DURATION} ${ANIMATION.EASE}`,
} as const;

// ── Layout ─────────────────────────────────────────────────────────────────
export const SIDEBAR_WIDTH = {
  OPEN: "256px",
  CLOSED: "0px",
} as const;

// ── CSS Variables ──────────────────────────────────────────────────────────
export const CSS_VARS = {
  SIDEBAR_WIDTH: "--sidebar-width",
} as const;