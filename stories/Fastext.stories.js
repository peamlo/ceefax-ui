import { expect, within } from 'storybook/test';
import { colours, realInput, unhover } from './_real-input.js';

// The authentic on-screen palette: the 4th key is cyan, because blue text on black fails contrast.
const KEYS = [
  { colour: 'red', label: 'NEWS' },
  { colour: 'green', label: 'SPORT' },
  { colour: 'yellow', label: 'TV' },
  { colour: 'cyan', label: 'A–Z' },
];

// Contract: hovering a fastext key inverts it. A text key fills with its colour in its ink;
// a banded key drops to the page background with its text in the band colour. Asserted
// against the key's own resting colours, so it holds for either look and any theme. One key
// per story is enough: which colour each name resolves to is pinned for every colour by the
// Foundations/Variant colours matrix, so what is left for real input to prove is that the
// hover rule fires. No story's first key is blue, so a text key's ink is black.
const BLACK = 'rgb(0, 0, 0)';
const assertHover = async (io, key) => {
  const rest = colours(key);
  await io.userEvent.hover(key);
  const banded = rest.backgroundColor !== 'rgba(0, 0, 0, 0)';
  await expect(colours(key)).toEqual(
    banded ? { backgroundColor: BLACK, color: rest.backgroundColor } : { backgroundColor: rest.color, color: BLACK },
  );
  // Leave nothing hovered: the axe pass audits the resting state, not a transient inversion.
  await unhover(io, key);
};

export default {
  title: 'Components/Fastext bar',
  tags: ['autodocs', 'contract'],
  parameters: { a11y: { test: 'error' } }, // in the axe gate under both themes (ADR-0006)
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

    const io = realInput();
    if (!io) return;
    await assertHover(io, keys[0]);
    // #12: under the accessible theme the inversion follows the theme's colours, ink still black.
    const root = document.documentElement;
    const theme = root.dataset.theme;
    root.dataset.theme = 'accessible';
    try {
      await assertHover(io, keys[0]);
    } finally {
      if (theme) root.dataset.theme = theme;
      else delete root.dataset.theme;
    }
  },
};

// The usual teletext footer: coloured labels on the page background.
export const Text = {};

// TVE's Dietario: three keys on red / green / yellow bands, edge to edge.
export const Banded = { args: { keys: 3, look: 'band' } };

export const OneKey = { args: { keys: 1 } };
export const TwoKeys = { args: { keys: 2 } };
export const ThreeKeys = { args: { keys: 3 } };
