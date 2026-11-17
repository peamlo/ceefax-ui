import { expect } from 'storybook/test';
import { BTN_PROPS, root, expectSameAsClassForm, outsideRoot, expectNoLeak } from './_classless.js';

export default {
  title: 'Components/Button',
  tags: ['autodocs'],
  render: ({ label, variant, size, disabled, classless }) => {
    const b = document.createElement('button');
    b.type = 'button';
    if (!classless) b.className = 'cf-btn';
    b.textContent = label;
    if (variant) b.dataset.variant = variant;
    if (size && size !== 'md') b.dataset.size = size;
    b.disabled = !!disabled;
    return classless ? root(b) : b;
  },
  argTypes: {
    label: { control: 'text' },
    variant: { control: 'select', options: ['', 'red', 'green', 'yellow', 'blue', 'cyan', 'magenta', 'ghost'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    classless: {
      control: 'boolean',
      description: 'EXPERIMENTAL (#26): a bare `<button>` inside a `.cf-root` container, no class',
    },
  },
  args: { label: 'READ MORE', variant: '', size: 'md', disabled: false, classless: false },
};

// The hover/focus-inversion and disabled-suppression contract claims are verified
// in .storybook/test-runner.js: CSS :hover / :focus-visible only respond to *real*
// pointer/keyboard input, which the in-page synthetic userEvent cannot produce — so
// those assertions run through Playwright's real input in the runner's postVisit.
export const Default = {};
export const FastextRed = { args: { variant: 'red', label: '\u25B8 RED \u00B7 INDEX' } };
export const FastextGreen = { args: { variant: 'green', label: '\u25B8 GREEN \u00B7 POSTS' } };
export const Ghost = { args: { variant: 'ghost', label: 'Cancel' } };
export const Small = {
  args: { size: 'sm', label: 'MORE' },
  // #171: a small button is still a 24px pointer target (WCAG 2.2). axe's target-size rule
  // passes a lone small button on spacing alone, so it can't see this.
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('.cf-btn').offsetHeight).toBeGreaterThanOrEqual(24);
  },
};
export const Large = { args: { size: 'lg', label: 'START' } };
export const Disabled = { args: { disabled: true, label: 'OFF AIR' } };

// EXPERIMENTAL (#26): inside an opt-in .cf-root, a bare <button> looks and behaves like
// cf-btn. play() compares it with a cf-btn twin for every variant, size and disabled; the
// test-runner gives it the same real focus/hover checks as Default and Disabled.
export const Classless = {
  args: { classless: true },
  play: async ({ canvasElement }) => {
    const cases = [
      {},
      { 'data-size': 'sm' },
      { 'data-size': 'lg' },
      { disabled: '' },
      ...['red', 'green', 'yellow', 'blue', 'cyan', 'magenta', 'ghost', 'RED'].map((v) => ({ 'data-variant': v })),
    ];
    await expectSameAsClassForm(canvasElement.querySelector('button'), 'cf-btn', BTN_PROPS, cases);
  },
};
export const ClasslessDisabled = {
  name: 'Classless (disabled)',
  args: { classless: true, disabled: true, label: 'OFF AIR' },
};
// Outside .cf-root a bare <button> keeps the browser's own look.
export const ClasslessOutsideRoot = {
  name: 'Classless outside .cf-root',
  render: () =>
    outsideRoot(() => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = 'READ MORE';
      return b;
    }),
  play: async ({ canvasElement }) => expectNoLeak(canvasElement, [['button', BTN_PROPS]]),
};
// A consumer's own class beats the classless look without !important. .my-btn (0,1,0) is
// less specific than the library's .cf-root button:not(…) (0,2,1): it only wins because the
// library sits in cascade layers, and unlayered CSS beats any layer.
export const ClasslessOverride = {
  name: 'Classless, consumer class wins',
  render: () => {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync('.my-btn{background:rgb(0, 0, 255);color:rgb(255, 255, 255)}');
    if (!document.adoptedStyleSheets.some((s) => s.cssRules[0]?.selectorText === '.my-btn'))
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'my-btn';
    b.textContent = 'MINE';
    return root(b);
  },
  play: async ({ canvasElement }) => {
    const cs = getComputedStyle(canvasElement.querySelector('.my-btn'));
    await expect([cs.backgroundColor, cs.textTransform]).toEqual(['rgb(0, 0, 255)', 'uppercase']);
  },
};
