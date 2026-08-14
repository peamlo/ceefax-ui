import { css, page, heading, resolveColor } from './_tokens.js';
import { expect } from '@storybook/test';
import { CEEFAX_PALETTE } from '../../src/tokens/palette.js';

export default { title: 'Foundations/Colors' };

const BASE = [
  'ceefax-black', 'ceefax-red', 'ceefax-green', 'ceefax-yellow',
  'ceefax-blue', 'ceefax-magenta', 'ceefax-cyan', 'ceefax-white',
];
const SEMANTIC = [
  'cf-bg', 'cf-fg', 'cf-fg-dim', 'cf-link', 'cf-link-hover', 'cf-link-visited',
  'cf-accent', 'cf-accent-2', 'cf-border', 'cf-info', 'cf-warning', 'cf-danger', 'cf-success',
];

// Light values need black text to stay legible on the swatch.
const isLight = (rgb) => {
  const m = rgb.match(/\d+/g);
  if (!m) return false;
  const [r, g, b] = m.map(Number);
  return (0.299 * r + 0.587 * g + 0.114 * b) > 140;
};

const swatchGrid = (names) => {
  const grid = document.createElement('div');
  grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:0';
  names.forEach((name) => {
    const raw = css('--' + name);
    const resolved = resolveColor(raw);
    const fg = isLight(resolved) ? '#000' : '#fff';
    const sw = document.createElement('div');
    sw.style.cssText = 'width:132px;height:120px;background:' + raw + ';color:' + fg +
      ';display:flex;flex-direction:column;justify-content:flex-end;padding:8px;' +
      'font-size:11px;text-transform:uppercase;box-shadow:inset 0 0 0 1px #333';
    const alias = raw !== resolved
      ? '<span style="opacity:.75">' + resolved + '</span>' : '';
    sw.innerHTML = '<strong>' + name + '</strong><span>' + raw + '</span>' + alias;
    grid.appendChild(sw);
  });
  return grid;
};

export const Palette = () => {
  const d = page();
  d.appendChild(heading('Base palette · never remapped'));
  d.appendChild(swatchGrid(BASE));
  return d;
};
// Palette-drift guard: the JS mirror (palette.js) must match the CSS tokens
// (colors.css). Fails the build if the hand-synced pair diverges. Tagged
// `contract` so CI's scoped run includes it (see .github/workflows).
Palette.tags = ['contract'];
Palette.play = async () => {
  for (const { name, hex } of CEEFAX_PALETTE) {
    await expect(css('--ceefax-' + name).toLowerCase()).toBe(hex.toLowerCase());
  }
};

export const SemanticAliases = () => {
  const d = page(
    '<p style="max-width:60ch;color:#b3ffb3">The only layer components reference. ' +
    'A future accessible theme remaps <em>only</em> these aliases, leaving the base palette untouched.</p>'
  );
  d.appendChild(swatchGrid(SEMANTIC));
  return d;
};
