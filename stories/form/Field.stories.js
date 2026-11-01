import { expect, within } from 'storybook/test';
import {
  assertDrawnRest,
  assertError,
  assertFieldLayout,
  assertGroup,
  assertHint,
  assertInvalidLook,
  assertMarkupContract,
  box,
  html,
  option,
  px,
  style,
  uid,
  VARIANT,
} from './_form.js';

// cf-field (#126, #130, #131): a control with its label and, when present, its hint and error
// message; a <fieldset class="cf-field"> with a <legend> is the field for a group. Each control
// has its own stories (Input, Textarea, Select, Checkbox, Radio); these are how they compose.

export default {
  title: 'Components/Form/Field',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`cf-field` lays out a control with its `<label>` above it and, when present, a hint (`cf-field__hint`) ' +
          'and an error message (`cf-field__error`) below. Link both to the control with `aria-describedby`. ' +
          'Checkboxes and radios sit beside the text of their wrapping `<label>`; a `<fieldset class="cf-field">` ' +
          'with a `<legend>` is the field for a group. State is native: `:focus-visible`, `disabled`, the ' +
          'browser\'s own validation (`:user-invalid`) and `aria-invalid="true"` for an error from the server. ' +
          'The library never shows or hides an error message: put it in the page only while the field is invalid.',
      },
    },
  },
};

// A field with a hint, and a field with a server error, exactly as the README shows them.
export const Field = {
  render: () =>
    html(`
<div class="cf-field">
  <label for="email">Email</label>
  <input class="cf-input" id="email" name="email" type="email"
         autocomplete="email" required aria-describedby="email-hint">
  <p class="cf-field__hint" id="email-hint">We only use it to reply.</p>
</div>

<div class="cf-field">
  <label for="postcode">Postcode</label>
  <input class="cf-input" id="postcode" name="postcode" autocomplete="postal-code"
         aria-invalid="true" aria-describedby="postcode-err">
  <p class="cf-field__error" id="postcode-err">Enter a postcode like W12 7RJ.</p>
</div>`),
  play: async ({ canvasElement }) => {
    await assertMarkupContract(canvasElement);
    for (const fieldEl of canvasElement.querySelectorAll('.cf-field')) await assertFieldLayout(fieldEl);
    const canvas = within(canvasElement);
    const email = canvas.getByRole('textbox', { name: 'Email' });
    const postcode = canvas.getByRole('textbox', { name: 'Postcode' });
    await expect(style(canvasElement.querySelector('.cf-field__hint')).marginTop).toBe('0px');
    await assertHint(email);
    await assertError(postcode);
    await assertInvalidLook(postcode);
    // :invalid alone is not the invalid look: the empty required email is untouched.
    await expect(email.matches(':invalid')).toBe(true);
    await expect(style(email).borderTopWidth).toBe('2px');
  },
};

// A group of checkboxes: a fieldset named by its legend. data-variant="character" works per
// control only: on the fieldset (`containerVariant`) it does nothing to the checkboxes inside.
export const CheckboxGroup = {
  name: 'Checkbox group',
  render: ({ legend, options, checked, variant, containerVariant }) => {
    const name = uid('group');
    return html(`<fieldset class="cf-field"${containerVariant ? ' data-variant="character"' : ''}>
  <legend>${legend}</legend>
  ${options
    .map((label) =>
      option({
        cls: 'cf-checkbox',
        type: 'checkbox',
        name,
        value: label,
        label,
        variant,
        checked: checked.includes(label),
      }),
    )
    .join('')}
</fieldset>`).firstElementChild;
  },
  argTypes: {
    legend: { control: 'text' },
    options: { control: 'object', description: 'The option texts' },
    checked: { control: 'object', description: 'The options that are on' },
    variant: VARIANT,
    containerVariant: {
      control: 'boolean',
      description: '`data-variant="character"` on the fieldset: it does nothing to the controls inside',
    },
  },
  args: {
    legend: 'Regions',
    options: ['London', 'Scotland', 'Wales'],
    checked: ['Scotland'],
    variant: '',
    containerVariant: true,
  },
  play: async ({ canvasElement, args }) => {
    await assertMarkupContract(canvasElement);
    await assertGroup(canvasElement.querySelector('fieldset'), args.legend);
    if (!args.variant) await assertDrawnRest(within(canvasElement).getByRole('checkbox', { name: 'London' }), '0px');
  },
};

// One composed form on a plain page: the field markup contract from #126 as it stands (ids
// prefixed, as the Field story above has the same fields on the docs page), plus a group named
// by the heading above it. Where a legend would repeat that heading, the fieldset
// points at it with aria-labelledby: no hidden text.
export const ComposedForm = {
  name: 'A composed form',
  render: () => {
    const page = html(`
<section class="cf-page">
  <main class="cf-page__body">
    <form class="cf-stack" action="/letters" method="post">
      <div class="cf-field">
        <label for="s-email">Email</label>
        <input class="cf-input" id="s-email" name="email" type="email"
               autocomplete="email" required aria-describedby="s-email-hint">
        <p class="cf-field__hint" id="s-email-hint">We only use it to reply.</p>
      </div>

      <div class="cf-field">
        <label for="s-postcode">Postcode</label>
        <input class="cf-input" id="s-postcode" name="postcode" autocomplete="postal-code"
               aria-invalid="true" aria-describedby="s-postcode-err">
        <p class="cf-field__error" id="s-postcode-err">Enter a postcode like W12 7RJ.</p>
      </div>

      <fieldset class="cf-field">
        <legend>Channel</legend>
        <div class="cf-field"><label><input class="cf-radio" type="radio" name="ch" value="1" checked> BBC1</label></div>
        <div class="cf-field"><label><input class="cf-radio" type="radio" name="ch" value="2"> BBC2</label></div>
      </fieldset>

      <h2 id="reply-heading">How should we reply?</h2>
      <fieldset class="cf-field" aria-labelledby="reply-heading">
        <div class="cf-field"><label><input class="cf-checkbox" type="checkbox" name="reply" value="email" checked> By email</label></div>
        <div class="cf-field"><label><input class="cf-checkbox" type="checkbox" name="reply" value="air"> On air</label></div>
      </fieldset>

      <button class="cf-btn" type="submit">Send letter</button>
    </form>
  </main>
</section>`).firstElementChild;
    page.querySelector('form').addEventListener('submit', (e) => e.preventDefault());
    return page;
  },
  play: async ({ canvasElement }) => {
    await assertMarkupContract(canvasElement);
    const canvas = within(canvasElement);
    // A plain page, not the Screen frame: the body type, not Bedstead.
    await expect(canvasElement.querySelector('.cf-page').hasAttribute('data-frame')).toBe(false);
    const email = canvas.getByRole('textbox', { name: 'Email' });
    await expect(style(email).fontFamily).toMatch(/^"?Space Mono/);
    await expect(email).toHaveAccessibleDescription('We only use it to reply.');
    const postcode = canvas.getByRole('textbox', { name: 'Postcode' });
    await expect(postcode).toBeInvalid();
    await expect(postcode).toHaveAccessibleDescription('Enter a postcode like W12 7RJ.');
    await assertInvalidLook(postcode);
    await assertGroup(canvasElement.querySelector('fieldset'), 'Channel');
    // The second group is named by the on-screen heading, not by a legend or hidden text.
    const heading = canvas.getByRole('heading', { name: 'How should we reply?' });
    const reply = canvas.getByRole('group', { name: 'How should we reply?' });
    await expect(reply.getAttribute('aria-labelledby')).toBe(heading.id);
    await expect(reply.querySelector('legend')).toBeNull();
    await expect(box(heading).height).toBeGreaterThan(0);
    await expect(box(heading).bottom).toBeLessThanOrEqual(box(reply).top);
    await expect(within(reply).getAllByRole('checkbox')).toHaveLength(2);
    await expect(canvas.getByRole('button', { name: 'Send letter' })).toHaveAttribute('type', 'submit');
  },
};

// Inside the Screen frame, the authentic mode (ADR-0014): the controls take the frame's type
// (Bedstead, one cell to a character), and with one cell of padding across, a `size` or `cols`
// width lands on whole cells. Down, a field is taller than a text row: no vertical snapping.
export const InScreenFrame = {
  name: 'In the Screen frame',
  parameters: { layout: 'fullscreen' },
  args: { cells: 40 },
  argTypes: {
    cells: {
      control: 'inline-radio',
      options: [40, 60, 80],
      description: 'Cells to a row: `data-cells` on the page (40, the default, needs no attribute)',
    },
  },
  render: ({ cells }) => {
    const page = html(`
<section class="cf-page" data-frame${cells === 40 ? '' : ` data-cells="${cells}"`}>
  <main class="cf-page__body" tabindex="0" aria-label="Letters">
    <form class="cf-stack" action="#" method="post">
      <div class="cf-field">
        <label for="f-name">Name</label>
        <input class="cf-input" id="f-name" name="name" autocomplete="name" size="20">
      </div>
      <div class="cf-field">
        <label for="f-postcode">Postcode</label>
        <input class="cf-input" id="f-postcode" name="postcode" autocomplete="postal-code" size="8"
               aria-invalid="true" aria-describedby="f-postcode-err">
        <p class="cf-field__error" id="f-postcode-err">Enter a postcode like W12 7RJ.</p>
      </div>
      <div class="cf-field">
        <label for="f-region">Region</label>
        <select class="cf-select" id="f-region" name="region">
          <option>London</option>
          <option>Wales</option>
        </select>
      </div>
      <div class="cf-field">
        <label for="f-letter">Letter</label>
        <textarea class="cf-textarea" id="f-letter" name="letter" rows="3" cols="30"></textarea>
      </div>
      <fieldset class="cf-field">
        <legend>Channel</legend>
        <div class="cf-field"><label><input class="cf-radio" type="radio" name="ch" value="1" checked> BBC1</label></div>
        <div class="cf-field"><label><input class="cf-radio" type="radio" name="ch" value="2"> BBC2</label></div>
      </fieldset>
      <div class="cf-field"><label><input class="cf-checkbox" type="checkbox" name="publish" checked> Publish it</label></div>
      <div class="cf-field"><label><input class="cf-checkbox" data-variant="character" type="checkbox" name="digest" checked> Digest</label></div>
      <div class="cf-field"><label><input class="cf-radio" data-variant="character" type="radio" name="slot" value="am"> Morning</label></div>
      <div class="cf-cluster">
        <input class="cf-input" type="search" name="q" aria-label="Search pages" size="12">
        <button class="cf-btn" type="submit">Go</button>
      </div>
    </form>
  </main>
</section>`).firstElementChild;
    page.querySelector('form').addEventListener('submit', (e) => e.preventDefault());
    return page;
  },
  play: async ({ canvasElement, args }) => {
    // The frame applies from 40em up; the test viewport must be that wide.
    await expect(matchMedia('(min-width: 40em)').matches).toBe(true);
    await document.fonts.load("1em 'Bedstead Cell'"); // measure Bedstead, not the fallback
    await assertMarkupContract(canvasElement);
    const page = canvasElement.querySelector('.cf-page');
    const form = page.querySelector('form');
    const name = page.querySelector('#f-name');
    // A whole number of cells, to within the sub-pixel a glyph advance may round by.
    const expectCells = async (width, n, cell) => await expect(Math.abs(width / cell - n)).toBeLessThan(0.05);
    for (const cells of [40, 60, 80]) {
      page.dataset.cells = String(cells);
      const cell = px(style(form).fontSize) * 0.6; // Bedstead's advance is 0.6em
      await expect(cell).toBeCloseTo(Math.floor(box(form).width / cells), 1);
      for (const control of page.querySelectorAll('input, select, textarea')) {
        await expect(style(control).fontFamily).toMatch(/^"?Bedstead Cell/);
        await expect(style(control).fontSize).toBe(style(form).fontSize);
        // Every control starts on the body's first column.
        await expectCells(box(control).left - box(form).left, 0, cell);
      }
      // size + one cell of padding each side; the border sits inside those cells.
      await expectCells(box(name).width, 20 + 2, cell);
      await expectCells(box(page.querySelector('#f-postcode')).width, 8 + 2, cell);
      await expectCells(box(page.querySelector('textarea')).width, 30 + 2, cell);
      // The select: its longest option, one cell before it, three after (the ▼ in the middle one).
      await expectCells(box(page.querySelector('select')).width, 'London'.length + 4, cell);
      // A checkbox or radio is two cells across (a character-variant glyph three), and its text
      // starts one cell after it.
      for (const label of page.querySelectorAll('label:has(.cf-checkbox, .cf-radio), legend')) {
        await expect(style(label).fontFamily).toMatch(/^"?Bedstead Cell/);
        await expect(style(label).fontSize).toBe(style(form).fontSize);
      }
      for (const control of page.querySelectorAll('.cf-checkbox, .cf-radio')) {
        const across = control.dataset.variant ? 3 : 2;
        await expectCells(box(control).width, across, cell);
        if (!control.dataset.variant) await expectCells(box(control).height, 2, cell);
        const text = document.createRange();
        text.selectNodeContents(control.parentElement);
        text.setStartAfter(control);
        await expectCells(text.getBoundingClientRect().left - box(form).left, across + 1, cell);
      }
    }
    if (args.cells === 40) delete page.dataset.cells;
    else page.dataset.cells = String(args.cells);
  },
};
