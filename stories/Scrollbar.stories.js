import { expect } from 'storybook/test';
import { contrast, resolve } from './_bands.js';

// A contract story for the page-shell scrollbars (#107, ADR-0019). Browsers don't expose
// the computed style of ::-webkit-scrollbar-*, so it asserts the inherited --_sb-*
// properties those pseudo-elements read: the resolved contract, not markup internals.
// Pinned: each variant's resolution, nearest-attribute-wins, contrast in both themes,
// and scope (nothing set outside .cf-page).
const MIN = 3; // WCAG 1.4.11, non-text contrast

// Per variant, each colour slot lists the aliases its value is built from. The first is the
// dominant colour: what a flat slot equals, what Firefox gets, what contrast is measured on.
const VARIANTS = {
  block: {
    thumb: ['cf-fg'],
    hot: ['cf-accent'],
    track: ['cf-bg'],
    props: { size: '0.75em', btn: 'none', 'ff-width': 'auto' },
  },
  fastext: {
    thumb: ['cf-accent'],
    hot: ['cf-fg'],
    track: ['cf-bg-2'],
    btn: ['cf-info'],
    btnHot: ['cf-fg'],
    props: { size: '1em', btn: 'block', 'ff-width': 'auto' },
  },
  mosaic: {
    thumb: ['cf-info', 'cf-bg'],
    hot: ['cf-accent', 'cf-bg'],
    track: ['cf-bg', 'cf-fg-dim'],
    props: { size: '0.75em', btn: 'none', 'ff-width': 'auto' },
  },
  thin: {
    thumb: ['cf-fg'],
    hot: ['cf-accent'],
    track: ['cf-bg'],
    props: { size: '0.5em', btn: 'none', 'ff-width': 'thin' },
  },
};
const SLOTS = { thumb: 'thumb', hot: 'thumb-hot', track: 'track', btn: 'btn-bg', btnHot: 'btn-hot' };
const PROPS = [
  'size',
  'thumb',
  'thumb-hot',
  'track',
  'rule',
  'btn',
  'btn-bg',
  'btn-hot',
  'ff-thumb',
  'ff-track',
  'ff-width',
];
const THEMES = ['', 'accessible'];

const prop = (el, name) => getComputedStyle(el).getPropertyValue(`--${name}`).trim();
// A length as number + unit, so the minified build's `.75em` matches the source's `0.75em`.
const norm = (v) => v.replace(/^(\d*\.?\d+)([a-z]+)$/, (_, n, u) => `${Number(n)}${u}`);

// [label, actual, expected] for everything a variant resolves to at `el`.
const resolution = (el, name) => {
  const v = VARIANTS[name];
  const rows = Object.entries(SLOTS)
    .filter(([slot]) => v[slot])
    .map(([slot, p]) => {
      const got = prop(el, `_sb-${p}`);
      const want = v[slot].map((a) => prop(el, a));
      // A flat slot is its alias; a pattern contains every alias it's built from.
      return [
        `--_sb-${p}`,
        want.length === 1 ? got : want.every((w) => got.includes(w)),
        want.length === 1 ? want[0] : true,
      ];
    });
  rows.push(['--_sb-ff-thumb', prop(el, '_sb-ff-thumb'), prop(el, v.thumb[0])]);
  rows.push(['--_sb-ff-track', prop(el, '_sb-ff-track'), prop(el, v.track[0])]);
  for (const [p, want] of Object.entries(v.props)) rows.push([`--_sb-${p}`, norm(prop(el, `_sb-${p}`)), norm(want)]);
  return rows;
};

// [label, ratio] for thumb and hot thumb on the track, dominant colours.
const ratios = (el, name) => {
  const v = VARIANTS[name];
  const track = resolve(el, v.track[0]);
  return ['thumb', 'hot'].map((slot) => [`${slot} on track`, contrast(resolve(el, v[slot][0]), track)]);
};

const scroller = (variant) => {
  const s = document.createElement('div');
  if (variant) s.dataset.scrollbar = variant;
  s.tabIndex = 0; // a scroll region keyboard users can reach
  s.style.cssText = 'overflow:auto;height:8em;width:14ch;border:1px solid var(--cf-border)';
  s.textContent = 'TELETEXT '.repeat(60);
  return s;
};

const page = (variant, theme) => {
  const p = document.createElement('section');
  p.className = 'cf-page';
  if (variant) p.dataset.scrollbar = variant;
  if (theme) p.dataset.theme = theme;
  p.style.cssText = 'padding:1ch';
  return p;
};

// [case, the variant it must resolve to]: nearest wins, a plain child inherits, an
// unknown value keeps what it inherited.
const NESTED = [
  ['thin in fastext', 'thin'],
  ['plain in fastext', 'fastext'],
  ['typo in mosaic', 'mosaic'],
  // An alias overridden on the [data-scrollbar] element, where the row resolves it.
  ['thin, --cf-accent overridden', 'thin'],
];
// Outside .cf-page nothing is set, data-scrollbar or not (the OS bar shows).
const OUTSIDE = ['outside .cf-page', 'data-scrollbar outside .cf-page'];
const tag = (el, c) => ((el.dataset.case = c), el);
// A captioned case, so every scroller on the canvas says what it proves.
const labelled = (text, el) => {
  const fig = document.createElement('div');
  const p = document.createElement('p');
  p.textContent = text;
  fig.append(p, tag(el, text));
  return fig;
};

export default { title: 'Foundations/Scrollbar' };

// One story (ADR-0006: a Foundations file with several stories hangs the test-runner).
export const Variants = {
  name: 'Variants, inheritance and scope',
  render: () => {
    const wrap = document.createElement('div');
    wrap.style.cssText =
      'display:flex;flex-direction:column;gap:2ch;font:14px var(--cf-font-mono);color:var(--cf-fg);background:var(--cf-bg)';

    // The four looks, in each theme. A plain scroller inherits its page's variant.
    for (const theme of THEMES) {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;flex-wrap:wrap;gap:1ch';
      for (const name of Object.keys(VARIANTS)) {
        const p = page(name === 'block' ? '' : name, theme);
        const label = document.createElement('p');
        label.textContent = `${name}${theme ? ` · ${theme}` : ''}`;
        const s = scroller();
        s.dataset.case = `${name}${theme}`;
        p.append(label, s);
        row.append(p);
      }
      wrap.append(row);
    }

    const fastext = page('fastext');
    fastext.append(labelled(NESTED[0][0], scroller('thin')), labelled(NESTED[1][0], scroller()));
    const mosaic = page('mosaic');
    // Hovered, this one's thumb is green: --cf-accent is overridden to --cf-success on it.
    const recoloured = scroller('thin');
    recoloured.style.setProperty('--cf-accent', 'var(--cf-success)');
    mosaic.append(labelled(NESTED[2][0], scroller('FASTEXT')), labelled(NESTED[3][0], recoloured));
    for (const p of [fastext, mosaic]) p.style.cssText = 'padding:1ch;display:flex;gap:1ch';
    const nested = document.createElement('div');
    nested.style.cssText = 'display:flex;flex-wrap:wrap;gap:1ch';
    nested.append(fastext, mosaic);

    const outside = document.createElement('div');
    outside.style.cssText = 'display:flex;gap:1ch';
    outside.append(labelled(OUTSIDE[0], scroller()), labelled(OUTSIDE[1], scroller('fastext')));

    const status = document.createElement('p');
    const list = document.createElement('ul');
    list.style.font = 'inherit'; // Storybook's own CSS sets a font on <ul>
    wrap.append(nested, outside, status, list);

    // Measure once attached, so the subtree's custom properties resolve.
    requestAnimationFrame(() => {
      const rows = [];
      for (const theme of THEMES) {
        for (const name of Object.keys(VARIANTS)) {
          const el = wrap.querySelector(`[data-case="${name}${theme}"]`);
          for (const [label, ratio] of ratios(el, name)) {
            rows.push([`${name}${theme ? ` (${theme})` : ''} ${label}: ${ratio.toFixed(2)}:1`, ratio >= MIN]);
          }
        }
      }
      const fails = rows.filter(([, ok]) => !ok).length;
      status.style.color = fails ? '#f00' : '#0f0';
      status.textContent = fails
        ? `FAIL — ${fails} pair(s) below ${MIN}:1`
        : `PASS — all ${rows.length} pairs ≥ ${MIN}:1`;
      for (const [text, ok] of rows) {
        const li = document.createElement('li');
        li.textContent = `${text} ${ok ? '✓' : '✗'}`;
        list.append(li);
      }
    });
    return wrap;
  },
  play: async ({ canvasElement }) => {
    const at = (c) => canvasElement.querySelector(`[data-case="${c}"]`);
    for (const theme of THEMES) {
      for (const name of Object.keys(VARIANTS)) {
        const el = at(`${name}${theme}`);
        const where = `${name}${theme ? ` (${theme})` : ''}`;
        for (const [label, got, want] of resolution(el, name)) {
          await expect(got, `${where} ${label}`).toBe(want);
        }
        for (const [label, ratio] of ratios(el, name)) {
          await expect(ratio, `${where} ${label}`).toBeGreaterThanOrEqual(MIN);
        }
      }
    }
    for (const [what, name] of NESTED) {
      for (const [label, got, want] of resolution(at(what), name)) {
        await expect(got, `${what}: ${label}`).toBe(want);
      }
    }
    for (const what of OUTSIDE) {
      for (const p of PROPS) await expect(prop(at(what), `_sb-${p}`), `${what}: --_sb-${p}`).toBe('');
    }
  },
};
