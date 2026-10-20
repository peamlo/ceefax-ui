import { expect } from '@storybook/test';

// A contract story with no component of its own: it pins the computed colour a consumer
// sees for every (component × variant) pair, so the variant→colour mapping can move
// (issue #7) without any outcome drifting. Asserts the rendered result only — never the
// custom property that carries it. Kept out of Components/* so the axe pass in
// .storybook/test-runner.js doesn't run over a raw colour matrix.
const BLACK = 'rgb(0, 0, 0)';
const WHITE = 'rgb(255, 255, 255)';
const RED = 'rgb(255, 0, 0)';
const GREEN = 'rgb(0, 255, 0)';
const YELLOW = 'rgb(255, 255, 0)';
const BLUE = 'rgb(0, 0, 255)';
const CYAN = 'rgb(0, 255, 255)';
const MAGENTA = 'rgb(255, 0, 255)';
const TRANSPARENT = 'rgba(0, 0, 0, 0)';

// A name the seam deliberately does not map — a consumer typo. It must fall through to
// the component's own default, not to the empty value of an unresolved custom property.
const UNMAPPED = 'RED';
// The untouched border a fallback has to preserve: an unresolved var() in the `border`
// SHORTHAND would reset every longhand, leaving a border-less button.
const BORDER = { borderTopColor: WHITE, borderTopWidth: '2px', borderTopStyle: 'solid' };

// [component, data-variant, the computed values a consumer sees]
const CASES = [
  ['btn', '', { backgroundColor: BLACK, color: WHITE, ...BORDER }],
  ['btn', UNMAPPED, { backgroundColor: BLACK, color: WHITE, ...BORDER }],
  ['btn', 'red', { backgroundColor: RED, color: BLACK, borderTopColor: RED }],
  ['btn', 'green', { backgroundColor: GREEN, color: BLACK, borderTopColor: GREEN }],
  ['btn', 'yellow', { backgroundColor: YELLOW, color: BLACK, borderTopColor: YELLOW }],
  ['btn', 'blue', { backgroundColor: BLUE, color: WHITE, borderTopColor: BLUE }],
  ['btn', 'cyan', { backgroundColor: CYAN, color: BLACK, borderTopColor: CYAN }],
  ['btn', 'magenta', { backgroundColor: MAGENTA, color: BLACK, borderTopColor: MAGENTA }],
  ['btn', 'ghost', { backgroundColor: TRANSPARENT, color: CYAN, borderTopColor: TRANSPARENT }],
  ['card', '', { borderTopColor: WHITE }],
  ['card', UNMAPPED, { borderTopColor: WHITE }],
  ['card', 'red', { borderTopColor: RED }],
  ['card', 'green', { borderTopColor: GREEN }],
  ['card', 'yellow', { borderTopColor: YELLOW }],
  ['card', 'blue', { borderTopColor: BLUE }],
  ['card', 'cyan', { borderTopColor: CYAN }],
  ['card', 'magenta', { borderTopColor: MAGENTA }],
  ['key', '', { backgroundColor: TRANSPARENT, color: BLACK }],
  ['key', UNMAPPED, { backgroundColor: TRANSPARENT, color: BLACK }],
  ['key', 'red', { backgroundColor: RED, color: BLACK }],
  ['key', 'green', { backgroundColor: GREEN, color: BLACK }],
  ['key', 'yellow', { backgroundColor: YELLOW, color: BLACK }],
  ['key', 'blue', { backgroundColor: BLUE, color: WHITE }],
  ['key', 'cyan', { backgroundColor: CYAN, color: BLACK }],
  ['key', 'magenta', { backgroundColor: MAGENTA, color: BLACK }],
];

// --_variant inherits, so a variant ancestor must not colour a descendant that did not
// ask for one. [child component, its own variant, expected] — rendered inside a red card.
const NESTED = [
  ['btn', '', { backgroundColor: BLACK, color: WHITE, ...BORDER }],
  ['btn', 'ghost', { backgroundColor: TRANSPARENT, color: CYAN, borderTopColor: TRANSPARENT }],
  ['card', '', { borderTopColor: WHITE }],
];

// The same pairs under [data-theme="accessible"] (#12): every block colour is light, so
// the ink is uniformly black — blue included.
const AMBER = 'rgb(255, 158, 77)';
const TEAL = 'rgb(51, 224, 192)';
const SKY = 'rgb(102, 179, 255)';
const ORCHID = 'rgb(224, 160, 208)';
const ICE = 'rgb(153, 230, 255)';
const ACCESSIBLE = [
  ['btn', '', { backgroundColor: BLACK, color: WHITE, ...BORDER }],
  ['btn', UNMAPPED, { backgroundColor: BLACK, color: WHITE, ...BORDER }],
  ['btn', 'red', { backgroundColor: AMBER, color: BLACK, borderTopColor: AMBER }],
  ['btn', 'green', { backgroundColor: TEAL, color: BLACK, borderTopColor: TEAL }],
  ['btn', 'yellow', { backgroundColor: YELLOW, color: BLACK, borderTopColor: YELLOW }],
  ['btn', 'blue', { backgroundColor: SKY, color: BLACK, borderTopColor: SKY }],
  ['btn', 'cyan', { backgroundColor: ICE, color: BLACK, borderTopColor: ICE }],
  ['btn', 'magenta', { backgroundColor: ORCHID, color: BLACK, borderTopColor: ORCHID }],
  ['btn', 'ghost', { backgroundColor: TRANSPARENT, color: ICE, borderTopColor: TRANSPARENT }],
  ['card', '', { borderTopColor: WHITE }],
  ['card', 'red', { borderTopColor: AMBER }],
  ['card', 'green', { borderTopColor: TEAL }],
  ['card', 'yellow', { borderTopColor: YELLOW }],
  ['card', 'blue', { borderTopColor: SKY }],
  ['card', 'cyan', { borderTopColor: ICE }],
  ['card', 'magenta', { borderTopColor: ORCHID }],
  ['key', '', { backgroundColor: TRANSPARENT, color: BLACK }],
  ['key', 'red', { backgroundColor: AMBER, color: BLACK }],
  ['key', 'green', { backgroundColor: TEAL, color: BLACK }],
  ['key', 'yellow', { backgroundColor: YELLOW, color: BLACK }],
  ['key', 'blue', { backgroundColor: SKY, color: BLACK }],
  ['key', 'cyan', { backgroundColor: ICE, color: BLACK }],
  ['key', 'magenta', { backgroundColor: ORCHID, color: BLACK }],
];

const TAG = { btn: 'button', card: 'article', key: 'a' };
const CLASS = { btn: 'cf-btn', card: 'cf-card', key: 'cf-fastext__key' };

const build = ([kind, variant], i) => {
  const n = document.createElement(TAG[kind]);
  n.className = CLASS[kind];
  if (kind === 'key') n.href = '#';
  if (variant) n.dataset.variant = variant;
  n.dataset.case = String(i);
  n.textContent = (variant || 'default').toUpperCase();
  return n;
};

const assertCases = async (cases, canvasElement, offset = 0) => {
  for (const [i, [kind, variant, want]] of cases.entries()) {
    const cs = getComputedStyle(canvasElement.querySelector(`[data-case="${offset + i}"]`));
    const label = `${kind}[data-variant="${variant}"]`;
    for (const [prop, value] of Object.entries(want)) {
      // Labelled so a failure names the pair that drifted, not just two colours.
      await expect(`${label} ${prop} ${cs[prop]}`).toBe(`${label} ${prop} ${value}`);
    }
  }
};

export default { title: 'Foundations/Variant colours' };

// Deliberately ONE story: a Foundations file with more than one story reproducibly hangs
// the test-runner for 60s with a "navigation" error on CI (ADR-0006), which is why the
// Layout documentation stories are out of the gate. The nested cases ride along here.
export const Matrix = {
  name: 'Every component × variant',
  render: () => {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-wrap:wrap;align-items:flex-start;gap:1ch';
    CASES.forEach((c, i) => wrap.appendChild(build(c, i)));

    const host = document.createElement('article');
    host.className = 'cf-card';
    host.dataset.variant = 'red';
    host.style.cssText = 'display:flex;flex-wrap:wrap;align-items:flex-start;gap:1ch';
    NESTED.forEach((c, i) => host.appendChild(build(c, CASES.length + i)));
    wrap.appendChild(host);

    // Scoped to a subtree on purpose: the theme must work below <html>, not only on it.
    const themed = document.createElement('div');
    themed.dataset.theme = 'accessible';
    themed.style.cssText = 'display:flex;flex-wrap:wrap;align-items:flex-start;gap:1ch;width:100%';
    const offset = CASES.length + NESTED.length;
    ACCESSIBLE.forEach((c, i) => themed.appendChild(build(c, offset + i)));
    wrap.appendChild(themed);
    return wrap;
  },
  play: async ({ canvasElement }) => {
    await assertCases(CASES, canvasElement);
    await assertCases(NESTED, canvasElement, CASES.length);
    await assertCases(ACCESSIBLE, canvasElement, CASES.length + NESTED.length);
  },
};
