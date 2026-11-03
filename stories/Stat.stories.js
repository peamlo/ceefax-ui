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

// Contract: the label is there and read after the value. The variant colours are pinned
// by Foundations/Variant colours.
const assertOrder = async (el) => {
  const value = el.querySelector('.cf-stat__value');
  const label = el.querySelector('.cf-stat__label');
  await expect(label.textContent.trim()).not.toBe('');
  await expect(value.compareDocumentPosition(label) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
};

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

export const Default = {
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('.cf-stat');
    await assertOrder(el);
    await expect(getComputedStyle(el.querySelector('.cf-stat__value')).color).toBe('rgb(255, 255, 0)'); // --cf-accent, no attribute
  },
};
export const Red = { args: { variant: 'red', value: '−€5,000', label: 'short of the deposit' } };
export const Green = { args: { variant: 'green', value: '€90,000', label: 'deposit and costs' } };
export const Yellow = { args: { variant: 'yellow', value: '+€1,000', label: 'every month' } };
export const Magenta = { args: { variant: 'magenta', value: '+€300', label: 'into the fund each month' } };
export const Cyan = { args: { variant: 'cyan', value: '≈23 months', label: 'to reach the deposit' } };

const ROW = [
  ['', '€75,000', 'to allocate today'],
  ['green', '€90,000', 'deposit and costs for a €300,000 home'],
  ['cyan', '≈23 months', 'to get there on the adjusted plan'],
];

// Up to three equally weighted stats per screen, in a layout primitive. More figures: use a table.
// The grid's column sizes each figure, so "€75,000" stays on one line in a third of the row.
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
    const stats = [...canvasElement.querySelectorAll('.cf-stat')];
    for (const el of stats) await assertOrder(el);
    const value = stats[0].querySelector('.cf-stat__value');
    await expect(value.getBoundingClientRect().height).toBeLessThan(parseFloat(getComputedStyle(value).fontSize) * 2); // one line
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
    const el = canvasElement.querySelector('.cf-stat');
    await assertOrder(el);
    // A cell is one line of body text (1em, line height 1); the value is two, the label one.
    const cell = parseFloat(getComputedStyle(canvasElement.querySelector('.cf-page__body > p')).fontSize);
    const height = (part) => el.querySelector(part).getBoundingClientRect().height;
    await expect(height('.cf-stat__value')).toBeCloseTo(cell * 2, 0);
    await expect(height('.cf-stat__label')).toBeCloseTo(cell, 0);
  },
};
