import { css, page, heading, resolveColor } from './_tokens.js';

export default { title: 'Foundations/Colors' };

const BASE = [
  'cf-base-black', 'cf-base-red', 'cf-base-green', 'cf-base-yellow',
  'cf-base-blue', 'cf-base-magenta', 'cf-base-cyan', 'cf-base-white',
];
const SEMANTIC = [
  'cf-bg', 'cf-fg', 'cf-fg-dim', 'cf-link', 'cf-link-hover', 'cf-link-visited',
  'cf-accent', 'cf-accent-2', 'cf-border', 'cf-info', 'cf-warning', 'cf-danger', 'cf-success',
  'cf-on-variant', 'cf-on-variant-dark',
  'cf-variant-red', 'cf-variant-green', 'cf-variant-yellow',
  'cf-variant-blue', 'cf-variant-magenta', 'cf-variant-cyan',
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

export const SemanticAliases = () => {
  const d = page(
    '<p style="max-width:60ch;color:#b3ffb3">The only layer components reference. ' +
    'The accessible theme (<code>data-theme="accessible"</code>, toolbar → Theme) remaps <em>only</em> these aliases, ' +
    'leaving the base palette untouched.</p>'
  );
  d.appendChild(swatchGrid(SEMANTIC));
  return d;
};
