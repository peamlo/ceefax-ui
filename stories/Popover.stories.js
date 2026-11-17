import { expect, within } from 'storybook/test';
import { uid } from './form/_form.js';
import { realInput } from './_real-input.js';

// cf-popover (#169): a floating panel on the native popover attribute, opened by an invoker
// command on its trigger. The browser opens, dismisses and anchors it; opening it for real
// needs a real click, which the stories assert where Vitest provides real input.
const CONTENT = {
  text: '<p>Pages are three digits, 100 to 899. Type one on the remote and the page loads when it next goes round.</p>',
  dropdown:
    '<ul>' +
    ['News 101', 'Weather 400', 'Sport 300', 'TV listings 600']
      .map((page) => `<li><a class="cf-link" href="#">${page}</a></li>`)
      .join('') +
    '</ul>',
};
const TRIGGER = { text: 'About pages', dropdown: 'Pages' };

const popover = ({ content, variant, area }) => {
  const id = uid('cf-popover');
  const el = document.createElement('div');
  el.innerHTML =
    `<button class="cf-btn" type="button" command="toggle-popover" commandfor="${id}">` +
    `${TRIGGER[content]} <span aria-hidden="true">▾</span></button>` +
    `<div popover class="cf-popover" id="${id}"></div>`;
  const panel = el.querySelector('.cf-popover');
  panel.innerHTML = CONTENT[content];
  if (variant) panel.dataset.variant = variant;
  if (area) panel.style.setProperty('--cf-popover-area', area);
  return el;
};

// Contract: the trigger is a button that toggles the popover, which starts closed.
const assertClosed = async ({ canvasElement }) => {
  const trigger = within(canvasElement).getByRole('button');
  const panel = canvasElement.querySelector('.cf-popover');
  await expect(trigger).toHaveAttribute('command', 'toggle-popover');
  await expect(trigger).toHaveAttribute('commandfor', panel.id);
  await expect(panel.matches(':popover-open')).toBe(false);

  // Contract (#169): a real click on the trigger opens the popover below it (anchored, so the
  // Chromium must support anchor positioning), and a real Esc closes it. Reopens it, so axe
  // audits its content in both themes.
  const input = await realInput();
  if (!input) return;
  await expect(CSS.supports('position-area', 'block-end')).toBe(true);
  await input.userEvent.click(trigger);
  await expect(panel.matches(':popover-open')).toBe(true);
  await expect(panel.getBoundingClientRect().top).toBeGreaterThanOrEqual(trigger.getBoundingClientRect().bottom);
  await input.userEvent.keyboard('{Escape}');
  await expect(panel.matches(':popover-open')).toBe(false);
  await input.userEvent.click(trigger);
};

export default {
  title: 'Components/Popover',
  tags: ['autodocs'],
  render: popover,
  argTypes: {
    content: { table: { disable: true } }, // the Text and Dropdown stories
    variant: {
      control: 'select',
      options: ['', 'red', 'green', 'yellow', 'blue', 'cyan', 'magenta'],
      description: 'Border colour, through the variant seam',
    },
    area: {
      control: 'select',
      options: ['', 'block-start span-inline-end', 'inline-end span-block-end'],
      labels: {
        '': 'below, at the start edge (default)',
        'block-start span-inline-end': 'above',
        'inline-end span-block-end': 'to the end',
      },
      description: '`--cf-popover-area`: any `position-area` value',
    },
  },
  args: { content: 'text', variant: '', area: '' },
};

export const Text = { play: assertClosed };

export const Dropdown = { args: { content: 'dropdown' }, play: assertClosed };
