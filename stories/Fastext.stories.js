import { expect, within } from 'storybook/test';

// The authentic on-screen palette: the 4th key is cyan, because blue text on black fails contrast.
const KEYS = [
  { colour: 'red', label: 'NEWS' },
  { colour: 'green', label: 'SPORT' },
  { colour: 'yellow', label: 'TV' },
  { colour: 'cyan', label: 'A–Z' },
];

export default {
  title: 'Components/Fastext bar',
  tags: ['autodocs'],
  args: { keys: 4, look: 'text' },
  argTypes: {
    keys: { control: { type: 'inline-radio' }, options: [1, 2, 3, 4] },
    look: { control: { type: 'inline-radio' }, options: ['text', 'band'] },
  },
  render: ({ keys, look }) => {
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Fastext');
    const ul = document.createElement('ul');
    ul.className = 'cf-fastext';
    KEYS.slice(0, keys).forEach((k) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'cf-fastext__key';
      // Text look: data-variant is the label colour. Banded: data-band, default ink.
      a.dataset[look === 'band' ? 'band' : 'variant'] = k.colour;
      a.href = '#';
      a.textContent = k.label; // redundant text label — colour is never the sole cue
      li.appendChild(a);
      ul.appendChild(li);
    });
    nav.appendChild(ul);
    return nav;
  },
  // Contract: colour is never the sole cue — every coloured key is a link carrying a
  // redundant, non-empty text label. And however many keys there are, they split the
  // bar into equal columns that together span its full width.
  play: async ({ canvasElement, args }) => {
    const keys = within(canvasElement).getAllByRole('link');
    await expect(keys.length).toBe(args.keys);
    for (const key of keys) {
      await expect(key).toHaveAttribute(args.look === 'band' ? 'data-band' : 'data-variant'); // a colour key
      await expect(key.textContent.trim().length).toBeGreaterThan(0); // ...with a label
    }
    const bar = canvasElement.querySelector('.cf-fastext').getBoundingClientRect().width;
    const widths = keys.map((k) => k.getBoundingClientRect().width);
    for (const w of widths) await expect(Math.abs(w - bar / keys.length)).toBeLessThanOrEqual(1);
    await expect(Math.abs(widths.reduce((a, b) => a + b) - bar)).toBeLessThanOrEqual(1);
  },
};

// The usual teletext footer: coloured labels on the page background.
export const Text = {};

// TVE's Dietario: three keys on red / green / yellow bands, edge to edge.
export const Banded = { args: { keys: 3, look: 'band' } };

export const OneKey = { args: { keys: 1 } };
export const TwoKeys = { args: { keys: 2 } };
export const ThreeKeys = { args: { keys: 3 } };
