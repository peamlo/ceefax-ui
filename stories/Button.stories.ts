import type { Meta, StoryObj } from '@storybook/html-vite';
import { expect } from 'storybook/test';

type Variant = '' | 'red' | 'green' | 'yellow' | 'blue' | 'cyan' | 'magenta' | 'ghost';
type Args = { label: string; variant: Variant; size: 'sm' | 'md' | 'lg'; disabled: boolean };

const meta: Meta<Args> = {
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
export default meta;
type Story = StoryObj<Args>;

// The hover/focus-inversion and disabled-suppression contract claims are verified
// in .storybook/test-runner.js: CSS :hover / :focus-visible only respond to *real*
// pointer/keyboard input, which the in-page synthetic userEvent cannot produce — so
// those assertions run through Playwright's real input in the runner's postVisit.
export const Default: Story = {};
export const FastextRed: Story = { args: { variant: 'red', label: '\u25B8 RED \u00B7 INDEX' } };
export const FastextGreen: Story = { args: { variant: 'green', label: '\u25B8 GREEN \u00B7 POSTS' } };
export const Ghost: Story = { args: { variant: 'ghost', label: 'Cancel' } };
export const Small: Story = {
  args: { size: 'sm', label: 'MORE' },
  // #171: a small button is still a 24px pointer target (WCAG 2.2). axe's target-size rule
  // passes a lone small button on spacing alone, so it can't see this.
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector<HTMLElement>('.cf-btn')!.offsetHeight).toBeGreaterThanOrEqual(24);
  },
};
export const Large: Story = { args: { size: 'lg', label: 'START' } };
export const Disabled: Story = { args: { disabled: true, label: 'OFF AIR' } };
