import { expect } from 'storybook/test';
import { page } from './_tokens.js';
// <cf-loader> is registered globally by the import in .storybook/preview.js.

export default { title: 'Foundations/Brand', tags: ['contract'] };

// ---------------------------------------------------------------------------
// Wordmark — the name in the display face on a colour block. There is no logo; do not
// invent one (see the design system README, Iconography).
// ---------------------------------------------------------------------------
export const Wordmark = () => {
  const d = page(
    '<p style="max-width:60ch;color:var(--cf-fg-dim)">No logo or mark exists. ' +
      'The brand is the name set in the display face on a flat colour block. ' +
      'The favicon (<code>public/favicon.svg</code>) is its initial: a pixel C.</p>',
  );
  const block = document.createElement('div');
  block.style.cssText =
    'display:inline-block;background:var(--cf-accent);color:var(--cf-on-variant);padding:8px 16px;' +
    'font-family:var(--cf-font-display);font-size:64px;line-height:1;letter-spacing:.02em';
  block.textContent = 'CEEFAX-UI';
  d.appendChild(block);
  return d;
};

// ---------------------------------------------------------------------------
// Loading caret — the ONLY sanctioned motion in the system: a hard on/off
// block-cursor blink (steps(1)), gated behind prefers-reduced-motion. Never
// use eased fades or slides anywhere else.
// ---------------------------------------------------------------------------
const loaderDemo = ({ fg }) => {
  const d = page(
    '<p style="max-width:60ch;color:var(--cf-fg-dim)">The one sanctioned animation. ' +
      'Hard <code>steps(1)</code> blink — no easing — for a "loading page…" state. ' +
      'Respects <code>prefers-reduced-motion</code>.</p>',
  );
  const demo = document.createElement('div');
  demo.style.cssText = 'font-size:24px;margin-top:8px';
  demo.innerHTML = '<cf-loader>LOADING PAGE 102…</cf-loader>';
  if (fg) d.style.setProperty('--cf-fg', fg); // the fg control: the loader follows the token
  d.appendChild(demo);
  return d;
};

// The loader reads --cf-fg and --cf-font-mono through its shadow root (#73). The accessible
// theme leaves --cf-fg white, so the proof is the ancestor override: a hardcoded colour fails it.
export const LoadingCaret = {
  render: loaderDemo,
  args: { fg: '' },
  argTypes: { fg: { control: 'color', description: 'Overrides `--cf-fg` around the loader' } },
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('cf-loader');
    const host = el.parentElement;
    const probe = document.createElement('span');
    probe.style.cssText = 'color:var(--cf-fg);font-family:var(--cf-font-mono)';
    host.appendChild(probe);
    const follows = async () => {
      await expect(getComputedStyle(el).color).toBe(getComputedStyle(probe).color);
      await expect(getComputedStyle(el).fontFamily).toBe(getComputedStyle(probe).fontFamily);
    };
    try {
      await follows();
      host.dataset.theme = 'accessible';
      await follows();
      delete host.dataset.theme;
      host.style.setProperty('--cf-fg', 'rgb(1, 2, 3)');
      host.style.setProperty('--cf-font-mono', 'serif');
      await expect(getComputedStyle(el).color).toBe('rgb(1, 2, 3)');
      await follows();
    } finally {
      probe.remove();
      host.style.removeProperty('--cf-fg');
      host.style.removeProperty('--cf-font-mono');
      delete host.dataset.theme;
    }
  },
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
  const d = page(
    '<p style="max-width:60ch;color:var(--cf-fg-dim)">No icon set. ' +
      'Wayfinding uses plain block/arrow glyphs and colour-coded fastext blocks. ' +
      '<strong style="color:var(--cf-danger)">No emoji.</strong></p>',
  );
  GLYPHS.forEach(([glyph, note]) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:16px;border-bottom:1px solid #222;padding:10px 0';
    row.innerHTML =
      '<span style="min-width:48px;font-size:32px;color:var(--cf-accent)">' +
      glyph +
      '</span>' +
      '<code style="min-width:80px;color:var(--cf-info);font-size:13px">U+' +
      glyph.codePointAt(0).toString(16).toUpperCase().padStart(4, '0') +
      '</code>' +
      '<span style="color:#888;font-size:13px">' +
      note +
      '</span>';
    d.appendChild(row);
  });
  return d;
};
