// Story-only band samples (#98): the band stories style a plain element with the same
// opt-in a text-part component adds (ADR-0017; cf-header-row's parts are the first) — its
// own [data-variant] text colour, then the [data-band] rule after it. Both read through
// a fallback (ADR-0007 rule 2), so an unknown band renders unbanded.
export const COLOURS = ['red', 'green', 'yellow', 'blue', 'cyan', 'magenta'];

const CSS = `
.band-sample { color: var(--cf-fg); font-family: var(--cf-font-mono); padding: 0 1ch; }
.band-sample[data-variant] { color: var(--_variant, var(--cf-fg)); }
.band-sample[data-band] {
  background: var(--_band, transparent);
  color: var(--_band-ink, var(--_variant, var(--cf-fg)));
}`;

// The sample rule lives once in <head>, whichever band story renders first.
const ensureStyle = () => {
  if (document.getElementById('band-sample-css')) return;
  const style = document.createElement('style');
  style.id = 'band-sample-css';
  style.textContent = CSS;
  document.head.append(style);
};

// A <span class="band-sample" data-band data-variant>; empty values are left off.
// `className` swaps the sample for a real opted-in part, e.g. cf-header-row__page.
export const bandSample = (band, ink, text = 'TELETEXT', className = 'band-sample') => {
  ensureStyle();
  const el = document.createElement('span');
  el.className = className;
  if (band) el.dataset.band = band;
  if (ink) el.dataset.variant = ink;
  el.textContent = text;
  return el;
};

// WCAG 2.x relative luminance and contrast ratio of two computed rgb() strings.
const channel = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = (rgb) => {
  const [r, g, b] = rgb.match(/\d+/g).map(Number).map(channel);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// Resolve a token to its rendered rgb() inside `root`.
export const resolve = (root, token) => {
  const probe = document.createElement('span');
  probe.style.color = `var(--${token})`;
  root.append(probe);
  const rgb = getComputedStyle(probe).color;
  probe.remove();
  return rgb;
};

// The painted ink and band of a sample rendered inside `root`, and their ratio.
export const measureBand = (root, band, ink) => {
  const el = bandSample(band, ink);
  root.append(el);
  const { color: fg, backgroundColor: bg } = getComputedStyle(el);
  el.remove();
  return { fg, bg, ratio: contrast(fg, bg) };
};
