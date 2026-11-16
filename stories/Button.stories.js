import { expect } from 'storybook/test';
/** @typedef {import('../.storybook/checks').Check} Check */

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

// parameters.checks name the real-input checks in .storybook/checks.ts: CSS :hover /
// :focus-visible only respond to *real* pointer/keyboard input, which the in-page synthetic
// userEvent cannot produce — so they run through Playwright's real input in postVisit.
export const Default = { parameters: { checks: /** @satisfies {Check[]} */ (['button-inverts-on-focus-and-hover']) } };
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
  parameters: { checks: /** @satisfies {Check[]} */ (['button-disabled-ignores-hover']) },
};
