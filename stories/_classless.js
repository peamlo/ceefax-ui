import { expect } from 'storybook/test';

// EXPERIMENTAL (#26) — shared checks for the classless spike: each component's
// stylesheet pairs its class with the bare element inside .cf-root.
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
  // No shared id, and no shared radio group: a checked twin would uncheck the original.
  twin.removeAttribute('id');
  twin.removeAttribute('name');
  for (const [k, v] of Object.entries(twinAttrs)) twin.setAttribute(k, v);
  // In a display: contents box, so layout is shared but sibling rules (cf-reveal + cf-reveal)
  // don't treat the twin as the original's neighbour.
  const holder = document.createElement('div');
  holder.style.display = 'contents';
  holder.append(twin);
  bare.after(holder);
  try {
    for (const attrs of cases) {
      for (const el of [bare, twin]) for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
      await expect(pick(bare, props), JSON.stringify(attrs)).toEqual(pick(twin, props));
      await expect(pick(bare, CARET, '::before')).toEqual(pick(twin, CARET, '::before'));
      for (const el of [bare, twin]) for (const k of Object.keys(attrs)) el.removeAttribute(k);
    }
  } finally {
    holder.remove();
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

// The look of a box-shaped component, for the components whose class and bare element share
// every rule (form controls, table, dialog, reveal, popover): a pairing mistake shows here.
export const BOX_PROPS = [
  'display',
  'boxSizing',
  'appearance',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'lineHeight',
  'color',
  'backgroundColor',
  'borderTopWidth',
  'borderTopStyle',
  'borderTopColor',
  'borderTopLeftRadius',
  'paddingTop',
  'paddingLeft',
  'marginTop',
  'maxInlineSize',
];

export const CLASSLESS_ARG = {
  control: 'boolean',
  description: 'EXPERIMENTAL (#26): the same markup without the component class, inside a `.cf-root` container',
};

// The classless form of rendered markup: the component class removed, inside a .cf-root.
export const classlessOf = (el, className) => {
  for (const c of [el, ...el.querySelectorAll(`.${className}`)]) {
    c.classList.remove(className);
    if (!c.classList.length) c.removeAttribute('class');
  }
  return root(el);
};

// A component render that honours the `classless` control.
export const withClassless = (render, className) => (args, ctx) => {
  const el = render(args, ctx);
  return args.classless ? classlessOf(el, className) : el;
};
