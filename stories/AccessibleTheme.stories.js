import { expect } from '@storybook/test';

// A contract story with no component of its own: it guards the accessible theme's
// promise (#12) — every colour it ships clears WCAG AAA (≥7:1) against the page
// background, and the ink on every variant block clears it against that block. Tokens
// are resolved inside a [data-theme="accessible"] subtree; ink pairs are read off
// rendered variant buttons, so they follow whatever pairing the seam declares.
const AAA = 7;

// Colours drawn ON the page background.
const ON_BG = [
  'cf-fg', 'cf-fg-dim', 'cf-border',
  'cf-link', 'cf-link-hover', 'cf-link-visited',
  'cf-accent', 'cf-accent-2', 'cf-info', 'cf-warning', 'cf-danger', 'cf-success',
  'cf-variant-red', 'cf-variant-green', 'cf-variant-yellow',
  'cf-variant-blue', 'cf-variant-magenta', 'cf-variant-cyan',
];
const VARIANTS = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan'];

// WCAG 2.x relative luminance and contrast ratio.
const channel = (c) => (c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
const luminance = (rgb) => {
  const [r, g, b] = rgb.match(/\d+/g).map(Number).map(channel);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// Resolve a token to its rendered rgb() inside the themed subtree.
const resolve = (root, token) => {
  const probe = document.createElement('span');
  probe.style.color = `var(--${token})`;
  root.append(probe);
  const rgb = getComputedStyle(probe).color;
  probe.remove();
  return rgb;
};

// The ink and fill of a rendered variant button — the seam's pairing, as painted.
const block = (root, variant) => {
  const btn = document.createElement('button');
  btn.className = 'cf-btn';
  btn.dataset.variant = variant;
  root.append(btn);
  const { color: fg, backgroundColor: bg } = getComputedStyle(btn);
  btn.remove();
  return { label: `ink on data-variant="${variant}"`, fg, bg };
};

// { label, fg, bg, ratio } for every pair the theme promises.
const measure = (root) => {
  const bg = resolve(root, 'cf-bg');
  return [
    ...ON_BG.map((t) => ({ label: `--${t} on --cf-bg`, fg: resolve(root, t), bg })),
    ...VARIANTS.map((v) => block(root, v)),
  ].map((row) => ({ ...row, ratio: contrast(row.fg, row.bg) }));
};

export default { title: 'Foundations/Accessible theme' };

// One story (ADR-0006): the canvas shows the live table play() asserts, plus the
// danger/success pair side by side for a deuteranopia-simulation review.
export const Contrast = {
  name: 'AAA contrast',
  render: () => {
    const el = document.createElement('div');
    el.dataset.theme = 'accessible';
    el.className = 'cf-page';
    el.style.cssText = 'padding:1em;font-size:14px';

    const pair = document.createElement('p');
    pair.innerHTML =
      '<span style="background:var(--cf-danger);color:var(--cf-bg);padding:.4em 2ch">DANGER</span> ' +
      '<span style="background:var(--cf-success);color:var(--cf-bg);padding:.4em 2ch">SUCCESS</span>';
    const status = document.createElement('p');
    const list = document.createElement('ul');
    el.append(pair, status, list);

    // Measure once attached, so the subtree's custom properties resolve.
    requestAnimationFrame(() => {
      const rows = measure(el);
      const fails = rows.filter((r) => r.ratio < AAA).length;
      status.style.color = fails ? '#f00' : '#0f0';
      status.textContent = fails
        ? `FAIL — ${fails} pair(s) below ${AAA}:1`
        : `PASS — all ${rows.length} pairs ≥ ${AAA}:1`;
      for (const { label, fg, bg, ratio } of rows) {
        const li = document.createElement('li');
        li.textContent = `${label}: ${fg} / ${bg} = ${ratio.toFixed(2)}:1 ${ratio >= AAA ? '✓' : '✗'}`;
        list.append(li);
      }
    });
    return el;
  },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[data-theme="accessible"]');
    for (const { label, fg, bg, ratio } of measure(root)) {
      await expect(ratio, `${label}: ${fg} / ${bg}`).toBeGreaterThanOrEqual(AAA);
    }
  },
};
