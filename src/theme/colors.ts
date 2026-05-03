export const COLORS = {
  primary: {
    DEFAULT: '#4550E6',
    hover: '#4550E6CC',
    active: '#3a44d4',
  },

  /**
   * Succesly dark-mode palette.
   * Single source of truth — edit here to change every dark surface globally.
   * Mirror values are exposed as CSS variables (--sc-dark-*) in index.css.
   */
  dark: {
    bgPrimary:  '#2f2f2f', // floating panels, toolbar headers, toggle pill
    bgSidebar:  '#1e1e1e', // sidebar, deepest background layer
    bgElevated: '#252526', // dropdowns, popovers, modals
    bgSunken:   '#0f0f0f', // table thead, recessed surfaces
    bgHover:    '#1a1a1a', // row hover, list item hover
    border:     'rgba(255, 255, 255, 0.07)', // subtle dividers
  },
};
 