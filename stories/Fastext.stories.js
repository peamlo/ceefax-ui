import { expect, within } from 'storybook/test';
import { colours, parkPointer, realInput, underForcedColours } from './_real-input.js';

// The authentic on-screen palette: the 4th key is cyan, because blue text on black fails contrast.
const KEYS = [
  { colour: 'red', label: 'NEWS' },
  { colour: 'green', label: 'SPORT' },
  { colour: 'yellow', label: 'TV' },
  { colour: 'cyan', label: 'A–Z' },
];

const meta = {
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
    // PROTOTYPE (#194): hovering a key inverts it, in both themes (real input, Vitest only). A text
    // key fills with its colour in black ink; a banded key drops to black with its text in the band
    // colour. One key is enough: the Variant colours matrix pins the per-colour part.
    const input = await realInput();
    if (!input) return;
    await parkPointer(input);
    for (const theme of ['authentic', 'accessible']) {
      if (theme === 'accessible') document.documentElement.dataset.theme = 'accessible';
      const rest = colours(keys[0]);
      await input.userEvent.hover(keys[0]);
      const banded = rest.backgroundColor !== 'rgba(0, 0, 0, 0)';
      await expect(colours(keys[0])).toEqual(
        banded
          ? { backgroundColor: BLACK, color: rest.backgroundColor }
          : { backgroundColor: rest.color, color: BLACK },
      );
      await parkPointer(input);
    }
    delete document.documentElement.dataset.theme;
  },
};
export default meta;

const BLACK = 'rgb(0, 0, 0)';
const outline = (el) => {
  const cs = getComputedStyle(el);
  return `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`;
};

// The usual teletext footer: coloured labels on the page background.
export const Text = {
  // PROTOTYPE (#194), contracts #150 and #149: a real Tab inverts the first key (its text colour
  // fills the background, black ink), and under forced colours, where the inversion is gone, the
  // focused key still shows a ring painted in a system colour.
  play: async (ctx) => {
    await meta.play(ctx); // a story's play replaces the meta's
    const input = await realInput();
    if (!input) return;
    const key = ctx.canvasElement.querySelector('.cf-fastext__key');
    await parkPointer(input);
    const restColours = colours(key);
    const rest = await underForcedColours(input, () => outline(key));
    await input.userEvent.tab();
    await expect(document.activeElement).toBe(key);
    await expect(colours(key)).toEqual({ backgroundColor: restColours.color, color: BLACK });
    await expect(outline(key)).toBe('solid 2px rgba(0, 0, 0, 0)');
    const focused = await underForcedColours(input, () => outline(key));
    key.blur();
    await expect(rest).toMatch(/^none/);
    await expect(focused).toMatch(/^solid 2px /);
    await expect(focused).not.toMatch(/rgba\(0, 0, 0, 0\)$/);
  },
};

// TVE's Dietario: three keys on red / green / yellow bands, edge to edge.
export const Banded = { args: { keys: 3, look: 'band' } };

export const OneKey = { args: { keys: 1 } };
export const TwoKeys = { args: { keys: 2 } };
export const ThreeKeys = { args: { keys: 3 } };
