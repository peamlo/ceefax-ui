// Registers <cf-canvas> for these stories (and via the ./elements barrel in real use).
import '../src/elements/cf-canvas.js';
import { parseCharGrid } from '../src/elements/cf-canvas.js';
import { pixelText, masthead } from './_pixel-text.js';
import { expect } from '@storybook/test';

// A stylised CEEFAX-holidays palm: blue sky (b), green fronds (g), red trunk (r),
// yellow sand (y). Free per-pixel colour — no authentic one-colour-per-cell limit.
const PALM = `
bbbbggbbbbggbbbbbbbb
bbggggggggggggbbbbbb
bgggggggggggggggbbbb
bbbgggggrgggggbbbbbb
bbbbbggrgggbbbbbbbbb
bbbbbbbrbbbbbbbbbbbb
bbbbbbbrbbbbbbbbbbbb
bbbbbbbrbbbbbbbbbbbb
bbbbbbrrbbbbbbbbbbbb
bbbbbbrbbbbbbbbbbbbb
bbbbbrrbbbbbbbbbbbbb
yyyyyyyyyyyyyyyyyyyy
yyyyyyyyyyyyyyyyyyyy
yyyyyyyyyyyyyyyyyyyy`;

// A small decorative logo on a transparent background (page bg shows through).
const HEART = `
.rr.rr.
rrrrrrr
rrrrrrr
.rrrrr.
..rrr..
...r...`;

// Every authentic colour at once, proving free per-pixel colouring.
const SWATCH = `
krgybmcw
krgybmcw
krgybmcw`;

/** Build a <cf-canvas> with the given art and attributes/styles. */
function pixels(art, { style, ...attrs } = {}) {
  const el = document.createElement('cf-canvas');
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  if (style) el.style.cssText = style;
  el.textContent = art;
  return el;
}

/** A width-constrained teletext page so fluid sizing is visible. */
function stage(child, width = '480px') {
  const box = document.createElement('div');
  box.className = 'cf-page';
  box.style.cssText = `max-width:${width};padding:16px`;
  if (Array.isArray(child)) child.forEach((c) => box.appendChild(c));
  else box.appendChild(child);
  return box;
}

function label(text) {
  const p = document.createElement('p');
  p.style.cssText = 'color:#00ffff;font-family:Space Mono,monospace;font-size:13px;margin:16px 0 4px';
  p.textContent = text;
  return p;
}

export default {
  title: 'Components/Pixel canvas',
  tags: ['autodocs'],
};

// Pixel-art header text built from a tiny 5x5 font — the classic teletext masthead:
// yellow ink, black drop shadow, blue band, just like the Ceefax P100 header.
export const HeaderText = {
  render: () =>
    stage(
      pixels(masthead('CEEFAX-UI'), { alt: 'ceefax-ui', 'data-size': 'full' }),
      '720px',
    ),
};

// The same word with just a drop shadow on the transparent page (no band) —
// useful over the flat-black canvas.
export const HeaderShadowOnly = {
  render: () =>
    stage(
      pixels(pixelText('CEEFAX-UI', { ink: 'y', shadow: 'r', dx: 1, dy: 1 }), {
        alt: 'ceefax-ui',
        'data-size': 'full',
      }),
      '720px',
    ),
};

// A meaningful, labelled scene — exposes role="img" + aria-label to assistive tech.
export const PalmScene = {
  render: () => stage(pixels(PALM, { alt: 'CEEFAX holidays — palm tree on a beach', 'data-size': 'md' })),
  // Contract: alt present => role="img" + aria-label carrying the description.
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('cf-canvas');
    await expect(el).toHaveAttribute('role', 'img');
    await expect(el.getAttribute('aria-label')).toContain('palm tree'); // == the alt text
    await expect(el).not.toHaveAttribute('aria-hidden');
  },
};

// A small decorative logo on a transparent background (no alt -> aria-hidden).
export const DecorativeLogo = {
  render: () => stage(pixels(HEART, { 'data-size': 'sm' }), '240px'),
  // Contract: alt absent => decorative, hidden from assistive tech, no role.
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('cf-canvas');
    await expect(el).toHaveAttribute('aria-hidden', 'true');
    await expect(el).not.toHaveAttribute('role');
    await expect(el).not.toHaveAttribute('aria-label');
  },
};

// The enumerated fluid size tiers (data-* presets + a --cf-* escape-hatch var).
export const Sizes = {
  render: () =>
    stage(
      ['sm', 'md', 'lg', 'full'].flatMap((size) => [
        label(`data-size="${size}"`),
        pixels(PALM, { alt: `palm at ${size}`, 'data-size': size }),
      ]),
      '640px',
    ),
};

// The --cf-pixels-scale escape hatch: exact N CSS px per logical pixel, crisp.
export const ScaleEscapeHatch = {
  render: () =>
    stage(
      [4, 8, 12].flatMap((scale) => [
        label(`--cf-pixels-scale: ${scale}`),
        pixels(HEART, { alt: `heart x${scale}`, style: `--cf-pixels-scale:${scale}` }),
      ]),
      '640px',
    ),
};

// Proof of free per-pixel colour across all eight authentic colours.
export const AllColours = {
  render: () => stage(pixels(SWATCH, { alt: 'the eight authentic teletext colours', 'data-size': 'sm' }), '320px'),
};

// Unknown codes render transparent and log a single console.warn (see the console).
export const UnknownCodes = {
  render: () =>
    stage(pixels('.rXr.\nrZZZr\n.rrr.', { alt: 'heart with unknown codes X and Z' }), '240px'),
  // parseCharGrid self-check (the pure source adapter). Run here rather than in node
  // because importing cf-canvas.js registers a custom element (needs a DOM).
  play: async () => {
    // Known code -> palette index (r = red = index 2); '.' and unknown -> 0 (transparent).
    const g = parseCharGrid('.rXr.\nrZZZr\n.rrr.');
    await expect({ width: g.width, height: g.height }).toEqual({ width: 5, height: 3 });
    await expect(Array.from(g.cells)).toEqual([
      0, 2, 0, 2, 0, // .rXr.  (X unknown -> 0)
      2, 0, 0, 0, 2, // rZZZr  (Z unknown -> 0)
      0, 2, 2, 2, 0, // .rrr.
    ]);
    await expect(g.unknown.sort()).toEqual(['X', 'Z']);
    // Leading source indentation is stripped; interior blank rows are kept.
    const indented = parseCharGrid('  rr\n  \n  rr');
    await expect({ width: indented.width, height: indented.height }).toEqual({ width: 2, height: 3 });
    await expect(Array.from(indented.cells)).toEqual([2, 2, 0, 0, 2, 2]);
  },
};
