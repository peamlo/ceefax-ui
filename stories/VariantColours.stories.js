import { expect } from '@storybook/test';

// A contract story with no component of its own: it pins the computed colour a consumer
// sees for every (component × variant) pair, so the variant→colour mapping can move
// (issue #7) without any outcome drifting. Asserts the rendered result only — never the
// custom property that carries it. Kept out of Components/* so the axe pass in
// .storybook/test-runner.js doesn't run over a raw colour matrix.
//
// The pairs are generated, not listed: each theme says which colour every variant name
// resolves to, each component says which properties it paints with that colour. A new
// variant-aware component is one entry in COMPONENTS; a new theme is one in PALETTES.
const BLACK = 'rgb(0, 0, 0)';
const WHITE = 'rgb(255, 255, 255)';
const YELLOW = 'rgb(255, 255, 0)';
const TRANSPARENT = 'rgba(0, 0, 0, 0)';

// variant name → [the colour it resolves to, the ink drawn on top of it]
const PALETTES = {
  authentic: {
    red: ['rgb(255, 0, 0)', BLACK],
    green: ['rgb(0, 255, 0)', BLACK],
    yellow: [YELLOW, BLACK],
    blue: ['rgb(0, 0, 255)', WHITE],
    cyan: ['rgb(0, 255, 255)', BLACK],
    magenta: ['rgb(255, 0, 255)', BLACK],
  },
  // [data-theme="accessible"] (#12): every block colour is light, so the ink is
  // uniformly black — blue included.
  accessible: {
    red: ['rgb(255, 158, 77)', BLACK],
    green: ['rgb(51, 224, 192)', BLACK],
    yellow: [YELLOW, BLACK],
    blue: ['rgb(102, 179, 255)', BLACK],
    cyan: ['rgb(153, 230, 255)', BLACK],
    magenta: ['rgb(224, 160, 208)', BLACK],
  },
};

// A name the seam deliberately does not map — a consumer typo. It must fall through to
// the component's own default, not to the empty value of an unresolved custom property.
const UNMAPPED = 'RED';
// The untouched border a fallback has to preserve: an unresolved var() in the `border`
// SHORTHAND would reset every longhand, leaving a border-less button.
const BORDER = { borderTopColor: WHITE, borderTopWidth: '2px', borderTopStyle: 'solid' };

// How each component looks with no variant (base), with a palette variant (paint), and
// with any variant of its own that is not a palette colour (extra).
// `bar` is the class of the container the component only works inside.
const COMPONENTS = {
  btn: {
    tag: 'button',
    className: 'cf-btn',
    base: { backgroundColor: BLACK, color: WHITE, ...BORDER },
    paint: (colour, ink) => ({ backgroundColor: colour, color: ink, borderTopColor: colour }),
    extra: {
      ghost: (p) => ({ backgroundColor: TRANSPARENT, color: p.cyan[0], borderTopColor: TRANSPARENT }),
    },
  },
  card: {
    tag: 'article',
    className: 'cf-card',
    base: { borderTopColor: WHITE },
    paint: (colour) => ({ borderTopColor: colour }),
  },
  key: {
    tag: 'a',
    className: 'cf-fastext__key',
    // A key takes its font from the bar, as in real markup; bare, it falls back to serif.
    bar: 'cf-fastext',
    base: { backgroundColor: TRANSPARENT, color: BLACK },
    paint: (colour, ink) => ({ backgroundColor: colour, color: ink }),
  },
};

// The computed values a consumer sees for one pair under one palette.
const look = (kind, variant, palette) => {
  const c = COMPONENTS[kind];
  if (c.extra?.[variant]) return c.extra[variant](palette);
  return palette[variant] ? c.paint(...palette[variant]) : c.base;
};

// Every component × (no variant, a typo, each palette colour, its own extras).
const pairs = (palette) =>
  Object.entries(COMPONENTS).flatMap(([kind, c]) =>
    ['', UNMAPPED, ...Object.keys(palette), ...Object.keys(c.extra ?? {})].map((v) => [kind, v]),
  );

// --_variant inherits, so a variant ancestor must not colour a descendant that did not
// ask for one. Rendered inside a red card.
const NESTED = [['btn', ''], ['btn', 'ghost'], ['card', '']];

const build = ([kind, variant], i) => {
  const c = COMPONENTS[kind];
  const n = document.createElement(c.tag);
  n.className = c.className;
  if (c.tag === 'a') n.href = '#';
  if (variant) n.dataset.variant = variant;
  n.dataset.case = String(i);
  n.textContent = (variant || 'default').toUpperCase();
  if (!c.bar) return n;
  const bar = document.createElement('div');
  bar.className = c.bar;
  bar.appendChild(n);
  return bar;
};

const assertCases = async (cases, palette, canvasElement, offset) => {
  for (const [i, [kind, variant]] of cases.entries()) {
    const cs = getComputedStyle(canvasElement.querySelector(`[data-case="${offset + i}"]`));
    const label = `${kind}[data-variant="${variant}"]`;
    for (const [prop, value] of Object.entries(look(kind, variant, palette))) {
      // Labelled so a failure names the pair that drifted, not just two colours.
      await expect(`${label} ${prop} ${cs[prop]}`).toBe(`${label} ${prop} ${value}`);
    }
  }
};

// [theme, palette, pairs, optional variant host] in render order; data-case indices run across all.
const GROUPS = [
  ['authentic', PALETTES.authentic, pairs(PALETTES.authentic)],
  ['authentic', PALETTES.authentic, NESTED, { className: 'cf-card', variant: 'red' }],
  ...Object.entries(PALETTES)
    .filter(([theme]) => theme !== 'authentic')
    .map(([theme, palette]) => [theme, palette, pairs(palette)]),
];

const row = 'display:flex;flex-wrap:wrap;align-items:flex-start;gap:1ch;width:100%';

export default { title: 'Foundations/Variant colours' };

// Deliberately ONE story: a Foundations file with more than one story reproducibly hangs
// the test-runner for 60s with a "navigation" error on CI (ADR-0006), which is why the
// Layout documentation stories are out of the gate. The nested cases ride along here.
export const Matrix = {
  name: 'Every component × variant',
  render: () => {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-direction:column;gap:2ch';
    let i = 0;
    for (const [theme, , cases, host] of GROUPS) {
      const group = document.createElement(host ? 'article' : 'div');
      group.style.cssText = row;
      if (host) {
        group.className = host.className;
        group.dataset.variant = host.variant;
      }
      // Scoped to a subtree on purpose: the theme must work below <html>, not only on it.
      if (theme !== 'authentic') group.dataset.theme = theme;
      for (const c of cases) group.appendChild(build(c, i++));
      wrap.appendChild(group);
    }
    return wrap;
  },
  play: async ({ canvasElement }) => {
    let offset = 0;
    for (const [, palette, cases] of GROUPS) {
      await assertCases(cases, palette, canvasElement, offset);
      offset += cases.length;
    }
  },
};
