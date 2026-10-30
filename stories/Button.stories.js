import { expect } from 'storybook/test';
import { colours, realInput, unhover } from './_real-input.js';

export default {
  title: 'Components/Button',
  tags: ['autodocs', 'contract'],
  parameters: { a11y: { test: 'error' } }, // in the axe gate under both themes (ADR-0006)
  render: ({ label, variant, size, disabled }) => {
    const b = document.createElement('button');
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

// CSS :hover / :focus-visible only respond to *real* pointer/keyboard input, so these
// contracts run where Vitest browser mode provides it (stories/_real-input.js).
export const Default = {
  play: async ({ canvasElement }) => {
    const io = realInput();
    if (!io) return;
    const btn = canvasElement.querySelector('.cf-btn');
    // Contract: keyboard focus (:focus-visible) inverts the colours. A real Tab press
    // (the button is the only focusable) makes :focus-visible match.
    await io.userEvent.tab();
    await expect(colours(btn)).toEqual(INVERTED);
    // Contract: hover inverts too (same CSS rule as focus-visible). Blur first, or the
    // focus inversion would make the hover check pass without :hover.
    btn.blur();
    await expect(colours(btn)).toEqual(RESTING);
    await io.userEvent.hover(btn);
    await expect(colours(btn)).toEqual(INVERTED);
    await unhover(io, btn); // leave nothing hovered for the axe pass
  },
};
export const FastextRed = { args: { variant: 'red', label: '\u25B8 RED \u00B7 INDEX' } };
export const FastextGreen = { args: { variant: 'green', label: '\u25B8 GREEN \u00B7 POSTS' } };
export const Ghost = { args: { variant: 'ghost', label: 'Cancel' } };
export const Large = { args: { size: 'lg', label: 'START' } };
export const Disabled = {
  args: { disabled: true, label: 'OFF AIR' },
  // Contract: a disabled button does NOT invert under a real hover.
  play: async ({ canvasElement }) => {
    const io = realInput();
    if (!io) return;
    const btn = canvasElement.querySelector('.cf-btn');
    await io.userEvent.hover(btn);
    await expect(colours(btn)).toEqual(RESTING);
    await unhover(io, btn);
  },
};
