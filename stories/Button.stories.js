import { expect } from 'storybook/test';
import { colours, realInput, unhover } from './_real-input.js';

export default {
  title: 'Components/Button',
  tags: ['autodocs'],
  render: ({ label, variant, size, disabled }) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'cf-btn';
    b.textContent = label;
    if (variant) b.dataset.variant = variant;
    if (size && size !== 'md') b.dataset.size = size;
    b.disabled = !!disabled;
    return b;
  },
  argTypes: {
    label: { control: 'text' },
    variant: { control: 'select', options: ['', 'red', 'green', 'yellow', 'blue', 'cyan', 'magenta', 'ghost'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
  },
  args: { label: 'READ MORE', variant: '', size: 'md', disabled: false },
};

// default button: fg=white / bg=black, so inversion => white bg + black text.
const INVERTED = { backgroundColor: 'rgb(255, 255, 255)', color: 'rgb(0, 0, 0)' };
const RESTING = { backgroundColor: 'rgb(0, 0, 0)', color: 'rgb(255, 255, 255)' };

// CSS :hover / :focus-visible only respond to real pointer/keyboard input (_real-input.js).
export const Default = {
  play: async ({ canvasElement }) => {
    const input = await realInput();
    if (!input) return;
    const btn = canvasElement.querySelector('.cf-btn');
    await expect(colours(btn)).toEqual(RESTING);
    // Contract: keyboard focus (:focus-visible) inverts the colours. A real Tab press (the
    // button is the only focusable) makes :focus-visible match.
    await input.userEvent.tab();
    await expect(colours(btn)).toEqual(INVERTED);
    // Contract: hover inverts too. Blur first, or the focus inversion alone would pass it.
    btn.blur();
    await expect(colours(btn)).toEqual(RESTING);
    await input.userEvent.hover(btn);
    await expect(colours(btn)).toEqual(INVERTED);
    await unhover(input, btn);
  },
};
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
export const Disabled = {
  args: { disabled: true, label: 'OFF AIR' },
  // Contract: a disabled button does NOT invert under a real hover.
  play: async ({ canvasElement }) => {
    const input = await realInput();
    if (!input) return;
    const btn = canvasElement.querySelector('.cf-btn');
    await input.userEvent.hover(btn);
    await expect(colours(btn)).toEqual(RESTING);
    await unhover(input, btn);
  },
};
