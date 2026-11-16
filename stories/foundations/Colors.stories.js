import { css, page, heading, resolveColor } from './_tokens.js';
import { COLOURS, bandSample, measureBand } from '../_bands.js';

export default { title: 'Foundations/Colors' };

const BASE = [
  'cf-base-black',
  'cf-base-red',
  'cf-base-green',
  'cf-base-yellow',
  'cf-base-blue',
  'cf-base-magenta',
  'cf-base-cyan',
  'cf-base-white',
];
const SEMANTIC = [
  'cf-bg',
  'cf-bg-2',
  'cf-fg',
  'cf-fg-dim',
  'cf-link',
  'cf-link-hover',
  'cf-link-visited',
  'cf-accent',
  'cf-accent-2',
  'cf-border',
  'cf-info',
  'cf-warning',
  'cf-danger',
  'cf-success',
  'cf-on-variant',
  'cf-on-variant-dark',
  'cf-variant-red',
  'cf-variant-green',
  'cf-variant-yellow',
  'cf-variant-blue',
  'cf-variant-magenta',
  'cf-variant-cyan',
  'cf-ink-red',
  'cf-ink-green',
  'cf-ink-yellow',
  'cf-ink-blue',
  'cf-ink-magenta',
  'cf-ink-cyan',
];

// Light values need black text to stay legible on the swatch.
const isLight = (rgb) => {
  const m = rgb.match(/\d+/g);
  if (!m) return false;
  const [r, g, b] = m.map(Number);
  return 0.299 * r + 0.587 * g + 0.114 * b > 140;
};

const swatchGrid = (names) => {
  const grid = document.createElement('div');
  grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:0';
  names.forEach((name) => {
    const raw = css('--' + name);
    const resolved = resolveColor(raw);
    const fg = isLight(resolved) ? '#000' : '#fff';
    const sw = document.createElement('div');
    sw.style.cssText =
      'width:132px;height:120px;background:' +
      raw +
      ';color:' +
      fg +
      ';display:flex;flex-direction:column;justify-content:flex-end;padding:8px;' +
      'font-size:11px;text-transform:uppercase;box-shadow:inset 0 0 0 1px #333';
    const alias = raw !== resolved ? '<span style="opacity:.75">' + resolved + '</span>' : '';
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

// Every band × ink (#98, ADR-0017). A cell that passes AA shows the live banded text and
// its ratio; one that fails keeps the page colours (so axe stays green) and says so, over
// an aria-hidden strip of the band. Ratios come from the live colours, so the grid
// follows the toolbar theme — under Accessible every cell passes.
const AA = 4.5;
export const Bands = () => {
  const d = page(
    '<p style="max-width:60ch;color:var(--cf-fg-dim)"><code>data-band</code> names the background; ' +
      '<code>data-variant</code> on the same element names the ink, else the readable default is used. ' +
      'Default-theme contrast is yours to choose: pick a passing pair. A ✕ cell fails AA, so use the default ink there.</p>',
  );
  d.appendChild(heading('Bands · band × ink'));
  const table = document.createElement('table');
  table.style.cssText = 'border-collapse:collapse;font-size:13px;text-align:left';
  const th = (text, scope = 'col') => {
    const c = document.createElement('th');
    c.scope = scope;
    c.style.cssText = 'padding:6px 1ch;font-weight:normal;color:var(--cf-fg-dim)';
    c.textContent = text;
    return c;
  };
  const head = table.createTHead().insertRow();
  head.append(th('band ↓ · ink →'), ...['default', ...COLOURS].map((ink) => th(ink)));
  const body = table.createTBody();
  const cells = [];
  for (const band of COLOURS) {
    const tr = body.insertRow();
    tr.append(th(band, 'row'));
    for (const ink of ['', ...COLOURS]) {
      const td = tr.insertCell();
      td.style.cssText = 'padding:6px 1ch;vertical-align:top;white-space:nowrap';
      cells.push([td, band, ink]);
    }
  }
  d.appendChild(table);
  // Measure once attached, so the theme's custom properties resolve.
  requestAnimationFrame(() => {
    for (const [td, band, ink] of cells) {
      const { ratio } = measureBand(td, band, ink);
      const r = `${ratio.toFixed(1)}:1`;
      if (ratio >= AA) {
        td.append(bandSample(band, ink, `TELETEXT ${r}`));
        continue;
      }
      const strip = bandSample(band, '', '');
      strip.setAttribute('aria-hidden', 'true');
      strip.style.cssText = 'display:block;height:6px;margin-bottom:4px';
      const warn = document.createElement('span');
      warn.textContent = `✕ ${r}`;
      td.append(strip, warn);
    }
  });
  return d;
};

export const SemanticAliases = () => {
  const d = page(
    '<p style="max-width:60ch;color:var(--cf-fg-dim)">The only layer components reference. ' +
      'The accessible theme (<code>data-theme="accessible"</code>, toolbar → Theme) remaps <em>only</em> these aliases, ' +
      'leaving the base palette untouched.</p>',
  );
  d.appendChild(swatchGrid(SEMANTIC));
  return d;
};
