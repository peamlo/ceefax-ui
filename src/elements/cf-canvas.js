// <cf-canvas alt="palm tree">..gg.\n.gyg.\n..r..</cf-canvas>
// The second interactive custom element: a render-only pixel-art canvas in the
// teletext style. Framework-agnostic, shipped under the opt-in ./elements export.
//
// The artwork is the element's TEXT CONTENT — newline-separated rows of single-char
// palette codes. Free per-pixel colour from the eight authentic broadcast colours
// (ADR-0004). Parsing is isolated behind a source adapter (parseCharGrid) so future
// PNG/JSON sources can produce the same normalised Pixel grid without touching the
// renderer.

// --- Palette -----------------------------------------------------------------
// Index 0 is transparent; codes map to indices 1..8. The adapter is colour-agnostic
// (it emits indices); the renderer resolves index -> authentic colour.
const PALETTE_CODES = ['k', 'r', 'g', 'y', 'b', 'm', 'c', 'w'];
const CODE_TO_CEEFAX = {
  k: 'black', r: 'red', g: 'green', y: 'yellow',
  b: 'blue', m: 'magenta', c: 'cyan', w: 'white',
};
// Fixed authentic hex, mirroring src/tokens/colors.css --ceefax-*. Used as the
// SSR / no-stylesheet fallback; the live values are read from the tokens at render.
const CEEFAX_HEX = {
  black: '#000000', red: '#ff0000', green: '#00ff00', yellow: '#ffff00',
  blue: '#0000ff', magenta: '#ff00ff', cyan: '#00ffff', white: '#ffffff',
};
const TRANSPARENT = 0;
const CODE_TO_INDEX = PALETTE_CODES.reduce((m, code, i) => ((m[code] = i + 1), m), {});

// --- Source adapter ----------------------------------------------------------
// Text char-grid -> normalised Pixel grid: { width, height, cells, transparent }.
// `cells` is a Uint8Array of palette indices (row-major). This is the ONLY shape the
// renderer understands; a future PNG/JSON adapter must return the same shape.
export function parseCharGrid(text) {
  const raw = String(text ?? '').replace(/\r\n?/g, '\n').split('\n');

  // Drop leading/trailing blank lines (from HTML formatting around the content);
  // interior blank lines are kept as intentional all-transparent rows.
  let start = 0;
  let end = raw.length;
  while (start < end && raw[start].trim() === '') start++;
  while (end > start && raw[end - 1].trim() === '') end--;
  const lines = raw.slice(start, end);

  if (lines.length === 0) return { width: 0, height: 0, cells: new Uint8Array(0), transparent: TRANSPARENT };

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

  if (unknown.size) {
    console.warn(
      `cf-canvas: unknown palette code(s) ${[...unknown].map((c) => `'${c}'`).join(', ')} ` +
        `— treated as transparent. Known codes: ${PALETTE_CODES.join(' ')} and '.'`,
    );
  }

  return { width, height, cells, transparent: TRANSPARENT };
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
               the fluid fallback (100% / content-max cap) is used instead. */
            --_scale-w:calc(var(--cf-pixels-scale) * var(--cf-canvas-cols,0) * 1px);
            width:var(--_scale-w, 100%);
            max-width:var(--_scale-w, var(--cf-content-max, 40ch));
            height:auto;
            image-rendering:crisp-edges;  /* Firefox fallback */
            image-rendering:pixelated;    /* preferred where supported (wins) */
            border-radius:0; /* teletext is square */
          }
          /* Fluid size tiers (ADR-0003 idiom: enumerated data-* + var escape hatch). */
          :host([data-size="sm"]) canvas{max-width:var(--_scale-w, 16ch)}
          :host([data-size="md"]) canvas{max-width:var(--_scale-w, 24ch)}
          :host([data-size="lg"]) canvas{max-width:var(--_scale-w, var(--cf-content-max, 40ch))}
          :host([data-size="full"]) canvas{max-width:var(--_scale-w, var(--cf-layout-max, 82ch))}
        </style>
        <canvas></canvas>`;
      this._canvas = root.querySelector('canvas');
    }

    // Redraw when the char-grid text content changes (hand-edits, future painter).
    if (!this._observer) {
      this._observer = new MutationObserver(() => this.render());
      this._observer.observe(this, { childList: true, characterData: true, subtree: true });
    }

    this._updateA11y();
    this.render();
  }

  disconnectedCallback() {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
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
    const canvas = this._canvas;

    // Backing store = logical resolution; CSS scales it up crisply.
    canvas.width = grid.width || 1;
    canvas.height = grid.height || 1;
    // Expose column count so the --cf-pixels-scale escape hatch can size in CSS.
    this.style.setProperty('--cf-canvas-cols', String(grid.width || 0));

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // transparent = page bg shows through
    if (!grid.width || !grid.height) return;

    const colors = this._resolvePalette();
    let last = -1;
    const { width, height, cells } = grid;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = cells[y * width + x];
        if (idx === TRANSPARENT) continue;
        if (idx !== last) {
          ctx.fillStyle = colors[idx];
          last = idx;
        }
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  // index (1..8) -> concrete colour, read live from the authentic --ceefax-* tokens
  // (never remapped) with the fixed hex as fallback when no stylesheet is present.
  _resolvePalette() {
    const cs = getComputedStyle(document.documentElement);
    const colors = [null];
    for (const code of PALETTE_CODES) {
      const name = CODE_TO_CEEFAX[code];
      const token = cs.getPropertyValue(`--ceefax-${name}`).trim();
      colors.push(token || CEEFAX_HEX[name]);
    }
    return colors;
  }
}

if (!customElements.get('cf-canvas')) customElements.define('cf-canvas', CfCanvas);
export { CfCanvas };
