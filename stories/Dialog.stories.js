import { expect, within } from 'storybook/test';

// cf-dialog (#167): a teletext panel on the native <dialog>, opened and closed with invoker
// commands, no script (ADR-0022). The browser moves focus in, closes on Esc and hands focus
// back to the invoker; that needs real input, so it is asserted in .storybook/test-runner.js.
// The controls showcase the use cases; they are not a test sweep.
const CONTENT = {
  confirmation: {
    open: 'Delete page',
    title: 'Delete P100?',
    // Cancel first and focused, so Enter never deletes by accident. Each submit button sets
    // the dialog's returnValue.
    body: () =>
      `<p>The page and its 12 subpages go off air for good.</p>
      <form method="dialog" class="cf-cluster">
        <button class="cf-btn" type="submit" value="cancel" autofocus>Cancel</button>
        <button class="cf-btn" type="submit" data-variant="red" value="delete">Delete</button>
      </form>`,
  },
  form: {
    open: 'Subscribe',
    title: 'Subscribe to P302',
    body: (id) =>
      `<form method="dialog" class="cf-stack">
        <div class="cf-field">
          <label for="${id}-email">Email</label>
          <input class="cf-input" id="${id}-email" name="email" type="email" autocomplete="email" required>
        </div>
        <div class="cf-cluster">
          <button class="cf-btn" type="button" command="close" commandfor="${id}">Cancel</button>
          <button class="cf-btn" type="submit" data-variant="green" value="subscribe">Subscribe</button>
        </div>
      </form>`,
  },
  long: {
    open: 'Read the terms',
    title: 'Terms of the service',
    body: (id) =>
      Array.from(
        { length: 12 },
        (_, i) =>
          `<p>${i + 1}. Pages are broadcast in a carousel, so a page you ask for arrives when its turn comes round.</p>`,
      ).join('') +
      `<div class="cf-cluster"><button class="cf-btn" type="button" command="close" commandfor="${id}" autofocus>Close</button></div>`,
  },
};

// The id is the story's, so the docs page (every story at once) never repeats one.
const dialog = ({ size, variant, content }, { name }) => {
  const id = `dialog-${name.toLowerCase().replace(/\W+/g, '-')}`;
  const { open, title, body } = CONTENT[content];
  const wrap = document.createElement('div');
  wrap.innerHTML = `<button class="cf-btn" type="button" command="show-modal" commandfor="${id}">${open}</button>
    <dialog class="cf-dialog" id="${id}" aria-labelledby="${id}-title">
      <h2 id="${id}-title">${title}</h2>
      ${body(id)}
    </dialog>`;
  const el = wrap.querySelector('dialog');
  if (size) el.dataset.size = size;
  if (variant) el.dataset.variant = variant;
  return wrap;
};

// Contract: a dialog, closed until opened.
const assertClosed = async (canvasElement) => {
  const el = canvasElement.querySelector('.cf-dialog');
  await expect(within(canvasElement).getByRole('dialog', { hidden: true })).toBe(el);
  await expect(el.open).toBe(false);
  return el;
};

export default {
  title: 'Components/Dialog',
  tags: ['autodocs'],
  render: dialog,
  argTypes: {
    size: { control: 'radio', options: ['sm', '', 'lg'], labels: { '': 'default (40 Cells)' } },
    variant: { control: 'select', options: ['', 'red', 'green', 'yellow', 'blue', 'cyan', 'magenta'] },
    content: { control: 'radio', options: Object.keys(CONTENT) },
  },
  args: { size: 'sm', variant: 'red', content: 'confirmation' },
};

// The exact contract markup: the invoker and the closed dialog.
export const Closed = {
  play: ({ canvasElement }) => assertClosed(canvasElement),
};

// Opened by test code (not library runtime), so the axe pass audits the open box. Once open,
// the dialog is named by its heading.
export const Open = {
  play: async ({ canvasElement }) => {
    const el = await assertClosed(canvasElement);
    el.showModal();
    await expect(el.matches(':modal')).toBe(true);
    const name = el.querySelector('h2').textContent;
    await expect(within(canvasElement).getByRole('dialog', { name })).toBe(el);
  },
};
