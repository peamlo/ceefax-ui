import { expect } from '@storybook/test';

// EXPERIMENTAL (#26) — the classless spike. Inside an opt-in .cf-root, a bare <button>,
// <a href> and <nav><ul><li><a> get the same look as cf-btn / cf-link / a nav-variant
// cluster. Not a supported API yet: not in the README, the glossary or an ADR.
// Two gates, both asserted on rendered output only (ADR-0006):
//  1. Equivalence — each bare element computes the same styles as its class form.
//     play() covers the static cases; .storybook/test-runner.js covers focus and hover,
//     which need real input.
//  2. No leak — the same bare elements outside .cf-root stay browser-default.

const BTN_PROPS = [
  'fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'textTransform', 'lineHeight',
  'paddingTop', 'paddingLeft', 'borderTopWidth', 'borderTopStyle', 'borderTopColor',
  'borderTopLeftRadius', 'backgroundColor', 'color', 'cursor', 'display', 'opacity',
];
const LINK_PROPS = [
  'fontFamily', 'fontWeight', 'letterSpacing', 'textTransform', 'color', 'backgroundColor',
  'textDecorationLine', 'textUnderlineOffset', 'display', 'alignItems', 'columnGap',
];
const LIST_PROPS = [
  'display', 'flexWrap', 'columnGap', 'rowGap', 'alignItems', 'listStyleType',
  'marginTop', 'marginLeft', 'paddingTop', 'paddingLeft',
];
const pick = (el, props, pseudo) => {
  const cs = getComputedStyle(el, pseudo);
  return Object.fromEntries(props.map((p) => [p, cs[p]]));
};

const h = (tag, attrs = {}, ...children) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== false) el.setAttribute(k, v === true ? '' : v);
  el.append(...children);
  return el;
};
const root = (...children) => h('div', { class: 'cf-root' }, ...children);

// Nav bar markup, bare or in its class form ([class form] = a cluster list with the
// chrome reset, and nav-variant links). Same items either way.
const ITEMS = [['HOME', true], ['NEWS', false], ['SPORT', false]];
const navBar = (classForm, label = classForm ? 'Class form' : 'Classless') =>
  h('nav', { 'aria-label': label },
    h('ul', classForm ? { class: 'cf-cluster', style: 'list-style:none;margin:0;padding:0' } : {},
      ...ITEMS.map(([label, current]) => h('li', {},
        h('a', { href: '#', 'aria-current': current && 'page', ...(classForm && { class: 'cf-link', 'data-variant': 'nav' }) }, label)))));

export default {
  title: 'Components/Classless (experimental)',
  parameters: {
    docs: {
      description: {
        component:
          'Spike for #26 — **experimental, not a supported API.** Inside `.cf-root`, bare `button`, `a[href]` and `nav > ul > li > a` look the same as `cf-btn` / `cf-link` / a nav row, with no class. Outside `.cf-root` nothing is styled.',
      },
    },
  },
};

// The real-input stories: bare element first, class form second, so the test-runner can
// Tab / hover each and compare them (see assertClasslessPair in .storybook/test-runner.js).
export const Button = {
  render: () => root(h('button', {}, 'READ MORE'), ' ', h('button', { class: 'cf-btn' }, 'READ MORE')),
};
export const DisabledButton = {
  name: 'Button (disabled)',
  render: () => root(h('button', { disabled: true }, 'OFF AIR'), ' ', h('button', { class: 'cf-btn', disabled: true }, 'OFF AIR')),
};
export const Link = {
  render: () => root(h('a', { href: '#' }, 'why I stopped using frameworks'), ' ', h('a', { class: 'cf-link', href: '#' }, 'why I stopped using frameworks')),
};

export const Nav = {
  render: () => root(navBar(false), navBar(true)),
  play: async ({ canvasElement }) => {
    const [bare, cls] = canvasElement.querySelectorAll('nav');
    await expect(pick(bare.querySelector('ul'), LIST_PROPS)).toEqual(pick(cls.querySelector('ul'), LIST_PROPS));
    const [bareLinks, clsLinks] = [bare, cls].map((n) => n.querySelectorAll('a'));
    for (const i of [0, 1]) await expect(pick(bareLinks[i], LINK_PROPS)).toEqual(pick(clsLinks[i], LINK_PROPS));
    // aria-current="page" → the persistent ▸ caret, same as the class form.
    const caret = pick(bareLinks[0], ['content', 'color'], '::before');
    await expect(caret.content).toContain(String.fromCharCode(0x25b8));
    await expect(caret).toEqual(pick(clsLinks[0], ['content', 'color'], '::before'));
  },
};

// Every static button/link case side by side: [bare, class form].
const BTN_CASES = [{}, { 'data-size': 'sm' }, { 'data-size': 'lg' }, { disabled: true },
  ...['red', 'green', 'yellow', 'blue', 'cyan', 'magenta', 'ghost', 'RED'].map((v) => ({ 'data-variant': v }))];
const LINK_CASES = [{}, { 'aria-current': 'page' }, { 'data-variant': 'nav' }];

export const Equivalence = {
  name: 'Equivalence (every variant)',
  render: () =>
    root(
      ...BTN_CASES.map((a) => h('p', {}, h('button', a, 'KEY'), ' ', h('button', { ...a, class: 'cf-btn' }, 'KEY'))),
      ...LINK_CASES.map((a) => h('p', {}, h('a', { ...a, href: '#' }, 'LINK'), ' ', h('a', { ...a, href: '#', class: 'cf-link' }, 'LINK'))),
    ),
  play: async ({ canvasElement }) => {
    for (const p of canvasElement.querySelectorAll('p')) {
      const [bare, cls] = p.children;
      const props = bare.tagName === 'BUTTON' ? BTN_PROPS : LINK_PROPS;
      await expect(pick(bare, props)).toEqual(pick(cls, props));
      await expect(pick(bare, ['content', 'color'], '::before')).toEqual(pick(cls, ['content', 'color'], '::before'));
    }
  },
};

// Gate 2: outside .cf-root the bare elements stay browser-default. The reference is the
// same markup inside a shadow root, which document stylesheets cannot reach — so any
// difference is a library rule leaking out of the scope.
export const NoLeak = {
  name: 'No leak outside .cf-root',
  render: () => {
    // Landmarks must stay unique for axe, hence the per-copy nav label.
    const markup = (label) => [h('button', {}, 'READ MORE'), h('a', { href: '#' }, 'LINK'), navBar(false, label)];
    const host = h('div');
    host.attachShadow({ mode: 'open' }).append(...markup('Reference'));
    // Light ground so the browser-default colours stay legible for the axe pass.
    return h('div', { style: 'background:#fff;color:#000;padding:1em' }, h('div', { class: 'light' }, ...markup('Outside root')), host);
  },
  play: async ({ canvasElement }) => {
    const light = canvasElement.querySelector('.light');
    const shadow = canvasElement.querySelector('.light + div').shadowRoot;
    for (const [sel, props] of [['button', BTN_PROPS], ['a', LINK_PROPS], ['ul', LIST_PROPS], ['nav a', LINK_PROPS]]) {
      await expect(pick(light.querySelector(sel), props)).toEqual(pick(shadow.querySelector(sel), props));
    }
  },
};

// Bonus (not a gate): a consumer's own class beats the scoped styles without !important.
export const ConsumerOverride = {
  name: 'Consumer class overrides',
  render: () =>
    h('div', {},
      h('style', {}, '.my-btn{background:rgb(0, 0, 255);color:rgb(255, 255, 255)}'),
      root(h('button', { class: 'my-btn' }, 'MINE'))),
  play: async ({ canvasElement }) => {
    await expect(pick(canvasElement.querySelector('.my-btn'), ['backgroundColor', 'textTransform']))
      .toEqual({ backgroundColor: 'rgb(0, 0, 255)', textTransform: 'uppercase' });
  },
};
