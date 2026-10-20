import { page } from './_tokens.js';
// <cf-loader> is registered globally by the import in .storybook/preview.js.

export default { title: 'Foundations/Brand' };

// ---------------------------------------------------------------------------
// Wordmark — the name in VT323 on a colour block. There is no logo; do not
// invent one (see the design system README, Iconography).
// ---------------------------------------------------------------------------
export const Wordmark = () => {
  const d = page('<p style="max-width:60ch;color:var(--cf-fg-dim)">No logo or mark exists. ' +
    'The brand is the name set in VT323 on a flat colour block.</p>');
  const block = document.createElement('div');
  block.style.cssText = 'display:inline-block;background:var(--cf-accent);color:var(--cf-on-variant);padding:8px 16px;' +
    'font-family:VT323,monospace;font-size:64px;line-height:1;letter-spacing:.02em';
  block.textContent = 'PAGE100';
  d.appendChild(block);
  return d;
};

// ---------------------------------------------------------------------------
// Loading caret — the ONLY sanctioned motion in the system: a hard on/off
// block-cursor blink (steps(1)), gated behind prefers-reduced-motion. Never
// use eased fades or slides anywhere else.
// ---------------------------------------------------------------------------
export const LoadingCaret = () => {
  const d = page('<p style="max-width:60ch;color:var(--cf-fg-dim)">The one sanctioned animation. ' +
    'Hard <code>steps(1)</code> blink — no easing — for a "loading page…" state. ' +
    'Respects <code>prefers-reduced-motion</code>.</p>');
  const demo = document.createElement('div');
  demo.style.cssText = 'font-size:24px;margin-top:8px';
  demo.innerHTML = '<cf-loader>LOADING PAGE 102…</cf-loader>';
  d.appendChild(demo);
  return d;
};

// ---------------------------------------------------------------------------
// Wayfinding glyphs — teletext had no icons. Use these plain Unicode block/
// arrow glyphs (already in the type tokens) instead of an icon library.
// No emoji, ever.
// ---------------------------------------------------------------------------
const GLYPHS = [
  ['▸', 'caret — current page / list marker'],
  ['▶', 'play / forward'],
  ['■', 'filled block'],
  ['▪', 'small block — bullet'],
];

export const Glyphs = () => {
  const d = page('<p style="max-width:60ch;color:var(--cf-fg-dim)">No icon set. ' +
    'Wayfinding uses plain block/arrow glyphs and colour-coded fastext blocks. ' +
    '<strong style="color:var(--cf-danger)">No emoji.</strong></p>');
  GLYPHS.forEach(([glyph, note]) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:16px;border-bottom:1px solid #222;padding:10px 0';
    row.innerHTML =
      '<span style="min-width:48px;font-size:32px;color:var(--cf-accent)">' + glyph + '</span>' +
      '<code style="min-width:80px;color:var(--cf-info);font-size:13px">U+' +
        glyph.codePointAt(0).toString(16).toUpperCase().padStart(4, '0') + '</code>' +
      '<span style="color:#888;font-size:13px">' + note + '</span>';
    d.appendChild(row);
  });
  return d;
};
