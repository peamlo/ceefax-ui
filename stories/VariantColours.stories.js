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

// [component, data-variant, the computed values a consumer sees]
const CASES = [
  ['btn', '', { backgroundColor: BLACK, color: WHITE, borderTopColor: WHITE }],
  ['btn', 'red', { backgroundColor: RED, color: BLACK, borderTopColor: RED }],
  ['btn', 'green', { backgroundColor: GREEN, color: BLACK, borderTopColor: GREEN }],
  ['btn', 'yellow', { backgroundColor: YELLOW, color: BLACK, borderTopColor: YELLOW }],
  ['btn', 'blue', { backgroundColor: BLUE, color: WHITE, borderTopColor: BLUE }],
  ['btn', 'ghost', { backgroundColor: TRANSPARENT, color: CYAN, borderTopColor: TRANSPARENT }],
  ['card', '', { borderTopColor: WHITE }],
  ['card', 'red', { borderTopColor: RED }],
  ['card', 'green', { borderTopColor: GREEN }],
  ['card', 'yellow', { borderTopColor: YELLOW }],
  ['card', 'blue', { borderTopColor: BLUE }],
  ['card', 'cyan', { borderTopColor: CYAN }],
  ['card', 'magenta', { borderTopColor: MAGENTA }],
  ['key', 'red', { backgroundColor: RED, color: BLACK }],
  ['key', 'green', { backgroundColor: GREEN, color: BLACK }],
  ['key', 'yellow', { backgroundColor: YELLOW, color: BLACK }],
  ['key', 'blue', { backgroundColor: BLUE, color: WHITE }],
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

export default { title: 'Foundations/Variant colours' };

export const Matrix = {
  name: 'Every component × variant',
  render: () => {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-wrap:wrap;align-items:flex-start;gap:1ch';
    CASES.forEach((c, i) => wrap.appendChild(build(c, i)));
    return wrap;
  },
  play: async ({ canvasElement }) => {
    for (const [i, [kind, variant, want]] of CASES.entries()) {
      const cs = getComputedStyle(canvasElement.querySelector(`[data-case="${i}"]`));
      const label = `${kind}[data-variant="${variant}"]`;
      for (const [prop, value] of Object.entries(want)) {
        // Labelled so a failure names the pair that drifted, not just two colours.
        await expect(`${label} ${prop} ${cs[prop]}`).toBe(`${label} ${prop} ${value}`);
      }
    }
  },
};
