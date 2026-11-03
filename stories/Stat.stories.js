import { expect } from 'storybook/test';

// cf-stat (#15): a headline figure in the display face above the label that says what it
// means. Accent by default; data-variant follows the variant seam. The label carries the
// meaning, so the colour never does alone. No blue story: blue text fails contrast on black.
const stat = ({ value, label, variant }) => {
  const el = document.createElement('p');
  el.className = 'cf-stat';
  if (variant) el.dataset.variant = variant;
  el.innerHTML = `<span class="cf-stat__value">${value}</span> <span class="cf-stat__label">${label}</span>`;
  return el;
};

// Contract: the label is there and read after the value, and the value is in `colour`.
const assertStat = async (el, colour) => {
  const value = el.querySelector('.cf-stat__value');
  const label = el.querySelector('.cf-stat__label');
  await expect(label.textContent.trim()).not.toBe('');
  await expect(value.compareDocumentPosition(label) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  await expect(getComputedStyle(value).color).toBe(colour);
};
const playStat =
  (colour) =>
  ({ canvasElement }) =>
    assertStat(canvasElement.querySelector('.cf-stat'), colour);

export default {
  title: 'Components/Stat',
  tags: ['autodocs'],
  render: stat,
  argTypes: {
    variant: { control: 'select', options: ['', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan'] },
    value: { control: 'text' },
    label: { control: 'text' },
  },
  args: { variant: '', value: '€75,000', label: 'to allocate' },
};

export const Default = { play: playStat('rgb(255, 255, 0)') }; // --cf-accent, no attribute
export const Red = {
  args: { variant: 'red', value: '−€5,000', label: 'short of the deposit' },
  play: playStat('rgb(255, 0, 0)'),
};
export const Green = {
  args: { variant: 'green', value: '€90,000', label: 'deposit and costs' },
  play: playStat('rgb(0, 255, 0)'),
};
export const Yellow = {
  args: { variant: 'yellow', value: '+€1,000', label: 'every month' },
  play: playStat('rgb(255, 255, 0)'),
};
export const Magenta = {
  args: { variant: 'magenta', value: '+€300', label: 'into the fund each month' },
  play: playStat('rgb(255, 0, 255)'),
};
export const Cyan = {
  args: { variant: 'cyan', value: '≈23 months', label: 'to reach the deposit' },
  play: playStat('rgb(0, 255, 255)'),
};

const ROW = [
  ['', '€75,000', 'to allocate today'],
  ['green', '€90,000', 'deposit and costs for a €300,000 home'],
  ['cyan', '≈23 months', 'to get there on the adjusted plan'],
];
const COLOURS = { '': 'rgb(255, 255, 0)', green: 'rgb(0, 255, 0)', cyan: 'rgb(0, 255, 255)' };

// Up to three equally weighted stats per screen, in a layout primitive. More figures: use a table.
export const Row = {
  name: 'Row of three',
  render: () => {
    const grid = document.createElement('div');
    grid.className = 'cf-grid';
    grid.dataset.cols = '3';
    grid.append(...ROW.map(([variant, value, label]) => stat({ variant, value, label })));
    return grid;
  },
  play: async ({ canvasElement }) => {
    const stats = canvasElement.querySelectorAll('.cf-stat');
    for (const [i, [variant]] of ROW.entries()) await assertStat(stats[i], COLOURS[variant]);
  },
};

// The authentic mode: inside the Screen frame the value is teletext double height, two cells.
export const InScreenFrame = {
  name: 'In the Screen frame',
  parameters: { layout: 'fullscreen' },
  render: () => {
    const page = document.createElement('section');
    page.className = 'cf-page';
    page.dataset.frame = '';
    const body = document.createElement('main');
    body.className = 'cf-page__body';
    body.tabIndex = 0;
    body.innerHTML = '<p>Your investment plan, adjusted to a €90,000 deposit.</p>';
    body.append(stat({ value: '€75,000', label: 'to allocate today' }));
    page.append(body);
    return page;
  },
  play: async ({ canvasElement }) => {
    const value = canvasElement.querySelector('.cf-stat__value');
    await assertStat(canvasElement.querySelector('.cf-stat'), 'rgb(255, 255, 0)');
    // Only where the frame applies: below 40em it drops and the value keeps display-xl.
    if (!matchMedia('(min-width: 40em)').matches) return;
    const cell = parseFloat(getComputedStyle(canvasElement.querySelector('.cf-page__body > p')).fontSize);
    await expect(value.getBoundingClientRect().height).toBeCloseTo(cell * 2, 0);
  },
};
