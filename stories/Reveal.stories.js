import { expect, userEvent } from 'storybook/test';

// cf-reveal (#20): a disclosure on the native <details>/<summary>, named after the teletext
// remote's REVEAL button. The browser owns the state ([open]), the keyboard and the
// announcement; the stylesheet only paints it. Real Tab/Enter and the ▼ / ▲ flip are asserted
// in .storybook/test-runner.js.
const ITEMS = [
  ['What does TAE mean?', '<p>The annual rate you earn once compounding is counted. Use it to compare accounts.</p>'],
  [
    'Can I take the money out early?',
    '<p>From the account, any day. From the money-market fund, in one to three working days.</p>',
  ],
  [
    'What happens if the bank fails?',
    '<p>Deposits are covered up to €100,000 per person and bank. Funds are held apart from the bank.</p>',
  ],
];

const reveal = ([title, content], { n, open, variant, name }) => {
  const el = document.createElement('details');
  el.className = 'cf-reveal';
  if (open) el.open = true;
  if (variant) el.dataset.variant = variant;
  if (name) el.name = name;
  el.innerHTML = `<summary>${n ? `<span class="cf-reveal__n">${n}</span>` : ''}${title}</summary>${content}`;
  return el;
};

// group: one reveal, a list (several open at once) or an accordion (one shared `name`, one open).
// `open` pre-opens the first item.
const render = ({ group, open, number, variant }) => {
  if (group === 'single') return reveal(ITEMS[0], { n: number && 1, open, variant });
  // A heading per group carries the navigation: a <summary> isn't a heading.
  const section = document.createElement('section');
  section.className = 'cf-page';
  section.innerHTML = '<h3>Questions for the bank</h3>';
  const name = group === 'accordion' ? 'bank-questions' : '';
  section.append(...ITEMS.map((item, i) => reveal(item, { n: number && i + 1, open: open && i === 0, variant, name })));
  return section;
};

const reveals = (canvasElement) => [...canvasElement.querySelectorAll('.cf-reveal')];
const shown = (el) => el.querySelector('p').checkVisibility();

export default {
  title: 'Components/Reveal',
  tags: ['autodocs'],
  render,
  argTypes: {
    group: { control: 'inline-radio', options: ['single', 'list', 'accordion'] },
    open: { control: 'boolean' },
    number: { control: 'boolean' },
    variant: { control: 'select', options: ['', 'red', 'green', 'yellow', 'magenta', 'cyan'] },
  },
  args: { group: 'single', open: false, number: false, variant: '' },
};

// Contract: closed hides the content and `open` on the element shows it. Sets the attribute rather
// than clicking, so focus stays put for the real Tab in the test runner; List and Accordion click.
export const Single = {
  play: async ({ canvasElement }) => {
    const [el] = reveals(canvasElement);
    await expect(el.open).toBe(false);
    await expect(shown(el)).toBe(false);
    el.open = true;
    await expect(shown(el)).toBe(true);
    el.open = false;
  },
};

export const List = {
  args: { group: 'list', number: true },
  parameters: {
    docs: {
      description: {
        story:
          'Reveals in a row stack into a list with one shared rule between neighbours. Several can be open at once, to compare answers. Give them the same `name` and they become an accordion instead.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const [first, second] = reveals(canvasElement);
    await userEvent.click(first.querySelector('summary'));
    await userEvent.click(second.querySelector('summary'));
    await expect([first.open, second.open]).toEqual([true, true]);
  },
};

export const Accordion = {
  args: { group: 'accordion', number: true, open: true },
  parameters: {
    docs: {
      description: {
        story:
          'The same reveals sharing one native `name` attribute: the HTML standard’s exclusive `<details>` group, so opening one closes the others. That `name` is the only difference from the List. No wrapper, class or JavaScript.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const [first, second] = reveals(canvasElement);
    await expect(first.open).toBe(true);
    await userEvent.click(second.querySelector('summary'));
    await expect([first.open, second.open]).toEqual([false, true]);
    await expect(shown(first)).toBe(false);
  },
};
