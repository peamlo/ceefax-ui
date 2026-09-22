export default {
  title: 'Components/Button',
  tags: ['autodocs'],
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
    variant: { control: 'select', options: ['', 'red', 'green', 'yellow', 'blue', 'ghost'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
  },
  args: { label: 'READ MORE', variant: '', size: 'md', disabled: false },
};

// The hover/focus-inversion and disabled-suppression contract claims are verified
// in .storybook/test-runner.js: CSS :hover / :focus-visible only respond to *real*
// pointer/keyboard input, which the in-page synthetic userEvent cannot produce — so
// those assertions run through Playwright's real input in the runner's postVisit.
export const Default = {};
export const FastextRed = { args: { variant: 'red', label: '\u25B8 RED \u00B7 INDEX' } };
export const FastextGreen = { args: { variant: 'green', label: '\u25B8 GREEN \u00B7 POSTS' } };
export const Ghost = { args: { variant: 'ghost', label: 'Cancel' } };
export const Large = { args: { size: 'lg', label: 'START' } };
export const Disabled = { args: { disabled: true, label: 'OFF AIR' } };
