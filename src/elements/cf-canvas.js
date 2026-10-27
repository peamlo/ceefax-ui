// <cf-canvas alt="palm tree">..gg.\n.gyg.\n..r..</cf-canvas>
// The second interactive custom element: a render-only pixel-art canvas in the
// teletext style. Framework-agnostic, shipped under the opt-in ./elements export.
//
// The artwork is the element's TEXT CONTENT — newline-separated rows of single-char
// palette codes. Free per-pixel colour from the eight teletext colours (ADR-0004),
// which follow the active theme like data-variant blocks do (ADR-0011). Parsing is isolated behind a source adapter (parseCharGrid) so future
// PNG/JSON sources can produce the same normalised Pixel grid without touching the
// renderer.

import { CEEFAX_PALETTE } from '../tokens/palette.js';

// --- Palette -----------------------------------------------------------------
// The colour names and fallback hexes come from the shared palette (src/tokens/palette.js) — the
// single JS source of truth. Here we only add the canvas convention: index 0 is
// transparent, codes map to indices 1..8. The adapter is colour-agnostic (it emits
// indices); the renderer resolves index -> hex.
const TRANSPARENT = 0;
const CODE_TO_INDEX = CEEFAX_PALETTE.reduce((m, p, i) => ((m[p.code] = i + 1), m), {});
const PALETTE_CODES = CEEFAX_PALETTE.map((p) => p.code); // for the unknown-code warning

// --- Source adapter ----------------------------------------------------------
// Text char-grid -> Pixel grid. The renderer contract is { width, height, cells }
// (`cells` a Uint8Array of palette indices, row-major); `unknown` is optional
// char-grid diagnostics (codes that weren't recognised, rendered transparent) that
// other adapters may omit. Pure — no side effects (the caller decides whether to
// warn), so it's safe for the future painter to reuse.
// Transparent pixels: '.' is the explicit code; leading whitespace is treated as source
// indentation and stripped, so use '.' for intentional left-edge transparency.
export function parseCharGrid(text) {
  const raw = String(text ?? '').replace(/\r\n?/g, '\n').split('\n');

  // Drop leading/trailing blank lines (from HTML formatting around the content);
  // interior blank lines are kept as intentional all-transparent rows.
  let start = 0;
  let end = raw.length;
  while (start < end && raw[start].trim() === '') start++;
  while (end > start && raw[end - 1].trim() === '') end--;
  const lines = raw.slice(start, end);

  if (lines.length === 0) {
    return { width: 0, height: 0, cells: new Uint8Array(0), unknown: [] };
  }

  // Strip the common leading whitespace (HTML source indentation).
  let indent = Infinity;
  for (const line of lines) {
    if (line.trim() === '') continue;
    indent = Math.min(indent, line.length - line.replace(/^\s+/, '').length);
  }
  if (!Number.isFinite(indent)) indent = 0;
  const rows = lines.map((line) => line.slice(indent));

  const width = rows.reduce((w, r) => Math.max(w, r.length), 0);
  const height = rows.length;
  const cells = new Uint8Array(width * height); // 0 = transparent everywhere by default
  const unknown = new Set();

  for (let y = 0; y < height; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue; // explicit / implicit transparent
      const idx = CODE_TO_INDEX[ch];
      if (idx === undefined) {
        unknown.add(ch);
        continue; // unknown -> transparent
      }
      cells[y * width + x] = idx;
    }
  }

  return { width, height, cells, unknown: [...unknown] };
}

// --- Element -----------------------------------------------------------------
class CfCanvas extends HTMLElement {
  static get observedAttributes() {
    return ['alt'];
  }

  connectedCallback() {
    if (!this.shadowRoot) {
      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML = `
        <style>
          :host{display:block}
          canvas{
            display:block;
            /* Escape hatch: --cf-pixels-scale sets an exact N px per logical pixel.
               When unset, --_scale-w resolves to the guaranteed-invalid value and
               the fluid fallback (100% / --_page-w cap) is used instead. */
            --_scale-w:calc(var(--cf-pixels-scale) * var(--cf-canvas-cols,0) * 1px);
            /* One teletext page, not --cf-content-max, so pixel art doesn't stretch to the prose measure. */
            --_page-w:40ch;
            width:var(--_scale-w, 100%);
            max-width:var(--_scale-w, var(--_page-w));
            height:auto;
            image-rendering:crisp-edges;  /* Firefox fallback */
            image-rendering:pixelated;    /* preferred where supported (wins) */
            border-radius:0; /* teletext is square */
          }
          /* Fluid size tiers: enumerated data-* presets + a --cf-* escape-hatch var. */
          :host([data-size="sm"]) canvas{max-width:var(--_scale-w, 16ch)}
          :host([data-size="md"]) canvas{max-width:var(--_scale-w, 24ch)}
          :host([data-size="lg"]) canvas{max-width:var(--_scale-w, var(--_page-w))}
          :host([data-size="full"]) canvas{max-width:var(--_scale-w, var(--cf-layout-max, 82ch))}
        </style>
        <canvas></canvas>`;
      this._canvas = root.querySelector('canvas');
      this._ctx = this._canvas.getContext('2d'); // stable for the canvas's lifetime
    }

    // Redraw when the char-grid text content changes (hand-edits, future painter).
    if (!this._observer) {
      this._observer = new MutationObserver(() => this.render());
      this._observer.observe(this, { childList: true, characterData: true, subtree: true });
    }
    // Redraw when a theme is switched on <html> or any ancestor: canvas pixels don't
    // follow the cascade by themselves, so the palette must be resolved again.
    // One observer per canvas over the whole document, filtered to data-theme: cheap.
    if (!this._themeObserver) {
      this._themeObserver = new MutationObserver(() => this.render());
      this._themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
        subtree: true,
      });
    }

    this._updateA11y();
    this.render();
  }

  disconnectedCallback() {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
    if (this._themeObserver) {
      this._themeObserver.disconnect();
      this._themeObserver = null;
    }
  }

  attributeChangedCallback(name) {
    if (name === 'alt') this._updateA11y();
  }

  _updateA11y() {
    const alt = this.getAttribute('alt');
    if (alt !== null && alt !== '') {
      this.setAttribute('role', 'img');
      this.setAttribute('aria-label', alt);
      this.removeAttribute('aria-hidden');
    } else {
      // No description -> decorative: hide from assistive tech.
      this.setAttribute('aria-hidden', 'true');
      this.removeAttribute('role');
      this.removeAttribute('aria-label');
    }
  }

  render() {
    if (!this._canvas) return;
    const grid = parseCharGrid(this.textContent);
    this._warnUnknown(grid.unknown || []);
    const canvas = this._canvas;

    // Backing store = logical resolution; CSS scales it up crisply. Assigning
    // canvas.width/height resets the whole backing buffer, so only touch it on change.
    const w = grid.width || 1;
    const h = grid.height || 1;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    // Expose column count so the --cf-pixels-scale escape hatch can size in CSS.
    this.style.setProperty('--cf-canvas-cols', String(grid.width || 0));

    const ctx = this._ctx;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // transparent = page bg shows through
    if (!grid.width || !grid.height) return;

    // Draw contiguous same-colour runs as a single fillRect (pixel art is mostly runs).
    const colors = this._resolvePalette();
    const { width, height, cells } = grid;
    for (let y = 0; y < height; y++) {
      let x = 0;
      while (x < width) {
        const idx = cells[y * width + x];
        if (idx === TRANSPARENT) {
          x++;
          continue;
        }
        let run = 1;
        while (x + run < width && cells[y * width + x + run] === idx) run++;
        ctx.fillStyle = colors[idx];
        ctx.fillRect(x, y, run, 1);
        x += run;
      }
    }
  }

  // Warn once per distinct set of unknown codes (re-renders with the same typo stay quiet).
  _warnUnknown(unknown) {
    const codes = [...unknown].sort(); // order-stable signature
    const sig = codes.join('');
    if (sig === this._lastUnknownSig) return;
    this._lastUnknownSig = sig;
    if (codes.length) {
      console.warn(
        `cf-canvas: unknown palette code(s) ${codes.map((c) => `'${c}'`).join(', ')} ` +
          `— treated as transparent. Known codes: ${PALETTE_CODES.join(' ')} and '.'`,
      );
    }
  }

  // index (1..8) -> concrete colour, read live from the --cf-variant-* tier — the same
  // remappable colours data-variant blocks use, so a theme recolours pixel art too.
  // Black and white have no variant token and read --cf-base-*. Resolved from `this` so
  // a theme set on any ancestor applies; the fixed hex covers a page with no stylesheet.
  _resolvePalette() {
    const cs = getComputedStyle(this);
    const colors = [null];
    for (const p of CEEFAX_PALETTE) {
      const token =
        cs.getPropertyValue(`--cf-variant-${p.name}`).trim() ||
        cs.getPropertyValue(`--cf-base-${p.name}`).trim();
      colors.push(token || p.hex);
    }
    return colors;
  }
}

if (!customElements.get('cf-canvas')) customElements.define('cf-canvas', CfCanvas);
export { CfCanvas };
