import { expect } from 'storybook/test';

// EXPERIMENTAL (#26) — shared checks for the classless spike (src/components/classless.css).
// A component's Classless stories render only the classless markup; these helpers hold the
// two gates, asserted on rendered output only (ADR-0006):
//  1. Equivalence — the bare element computes the same styles as its class form.
//  2. No leak — the same bare markup outside .cf-root stays browser-default.

export const BTN_PROPS = [
  'fontFamily',
  'fontSize',
  'fontWeight',
  'letterSpacing',
  'textTransform',
  'lineHeight',
  'paddingTop',
  'paddingLeft',
  'borderTopWidth',
  'borderTopStyle',
  'borderTopColor',
  'borderTopLeftRadius',
  'backgroundColor',
  'color',
  'cursor',
  'display',
  'opacity',
  'boxSizing',
];
export const LINK_PROPS = [
  'fontFamily',
  'fontWeight',
  'letterSpacing',
  'textTransform',
  'color',
  'backgroundColor',
  'textDecorationLine',
  'textUnderlineOffset',
  'display',
  'alignItems',
  'columnGap',
  'boxSizing',
];
// A nav list is laid out like cf-cluster; the list chrome reset is its own.
export const CLUSTER_PROPS = ['display', 'flexWrap', 'columnGap', 'rowGap', 'alignItems', 'boxSizing'];
export const LIST_PROPS = [...CLUSTER_PROPS, 'listStyleType', 'marginTop', 'marginLeft', 'paddingTop', 'paddingLeft'];
const CARET = ['content', 'color'];

const pick = (el, props, pseudo) => {
  const cs = getComputedStyle(el, pseudo);
  return Object.fromEntries(props.map((p) => [p, cs[p]]));
};

export const root = (...children) => {
  const div = document.createElement('div');
  div.className = 'cf-root';
  div.append(...children);
  return div;
};

// Gate 1. For each attribute case, set it on the bare element and on a class-form twin placed
// beside it, and compare their computed styles (and ::before, for the aria-current caret). The
// twin is removed afterwards, so the story still shows — and Tab still reaches — one element.
// twinAttrs go on the twin only: what the bare form gets from structure, e.g. the nav variant.
export async function expectSameAsClassForm(bare, className, props, cases = [{}], twinAttrs = {}) {
  const twin = bare.cloneNode(true);
  twin.className = className;
  for (const [k, v] of Object.entries(twinAttrs)) twin.setAttribute(k, v);
  bare.after(twin);
  try {
    for (const attrs of cases) {
      for (const el of [bare, twin]) for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
      await expect(pick(bare, props), JSON.stringify(attrs)).toEqual(pick(twin, props));
      await expect(pick(bare, CARET, '::before')).toEqual(pick(twin, CARET, '::before'));
      for (const el of [bare, twin]) for (const k of Object.keys(attrs)) el.removeAttribute(k);
    }
  } finally {
    twin.remove();
  }
}

// Gate 2. Renders the markup outside .cf-root, beside a copy inside a shadow root (which
// document stylesheets cannot reach), so any difference is a library rule leaking out.
export const outsideRoot = (markup) => {
  const light = document.createElement('div');
  light.append(markup('Outside root'));
  const host = document.createElement('div');
  host.attachShadow({ mode: 'open' }).append(markup('Reference'));
  const wrap = document.createElement('div');
  // Light ground and line spacing so the browser-default look passes axe (contrast, target size).
  wrap.style.cssText = 'background:#fff;color:#000;padding:1em;line-height:2';
  wrap.append(light, host);
  return wrap;
};

export async function expectNoLeak(canvasElement, checks) {
  const [light, host] = canvasElement.firstElementChild.children;
  for (const [sel, props] of checks) {
    await expect(pick(light.querySelector(sel), props), sel).toEqual(pick(host.shadowRoot.querySelector(sel), props));
  }
}
