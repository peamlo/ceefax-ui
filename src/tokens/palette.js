// Authentic broadcast palette — the JS mirror of the eight `--cf-base-*` colours
// defined in colors.css (fixed, NEVER remapped). This is the single source of truth
// for JS consumers (custom elements, canvas rendering, future tooling): import it
// instead of re-declaring the colours anywhere else.
//
// Each entry carries the single-char `code` (used by <cf-canvas> char-grids), the
// `--cf-base-<name>` token name, and the fixed `hex`. At runtime, prefer resolving the
// live token value (`getComputedStyle(el).getPropertyValue('--cf-base-<name>')`); the
// `hex` here is the SSR / no-stylesheet fallback.
//
// Keep in sync with src/tokens/colors.css `--cf-base-*` (the CSS side is canonical for
// CSS consumers; these two are the same eight fixed values expressed for each world).
export const CEEFAX_PALETTE = [
  { code: 'k', name: 'black', hex: '#000000' },
  { code: 'r', name: 'red', hex: '#ff0000' },
  { code: 'g', name: 'green', hex: '#00ff00' },
  { code: 'y', name: 'yellow', hex: '#ffff00' },
  { code: 'b', name: 'blue', hex: '#0000ff' },
  { code: 'm', name: 'magenta', hex: '#ff00ff' },
  { code: 'c', name: 'cyan', hex: '#00ffff' },
  { code: 'w', name: 'white', hex: '#ffffff' },
];
