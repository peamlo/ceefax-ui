import { expect, within } from 'storybook/test';

// Form controls and cf-field (#126, #130): the real native elements with one class each.
// The stories render the exact contract markup; play() asserts what a consumer sees (roles,
// computed styles, the markup contract), never a private --_* property. Real Tab focus and
// real :user-invalid need real input, so they are asserted in .storybook/test-runner.js.

const html = (markup) => {
  const root = document.createElement('div');
  root.innerHTML = markup;
  return root;
};
const style = (el, pseudo) => getComputedStyle(el, pseudo);
const px = (v) => parseFloat(v);
const box = (el) => el.getBoundingClientRect();

// Every control is named by its label, and every aria-describedby id exists in the page.
const assertMarkupContract = async (canvasElement) => {
  const controls = [...canvasElement.querySelectorAll('input, textarea, select')];
  await expect(controls.length).toBeGreaterThan(0);
  for (const control of controls) {
    await expect(control.labels?.length || control.getAttribute('aria-label')).toBeTruthy();
    for (const id of (control.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean))
      await expect(document.getElementById(id), `#${id} is missing`).not.toBeNull();
  }
};

// The invalid look (aria-invalid="true" here, :user-invalid in the test-runner): a thicker
// border in the danger colour, and the box doesn't move. `valid` is a resting control of the
// same size to compare with.
const assertInvalidLook = async (control, valid) => {
  const cs = style(control);
  for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
    await expect(cs[`border${side}Width`]).toBe('4px'); // --cf-border-thick
    await expect(cs[`border${side}Color`]).toBe('rgb(255, 0, 0)'); // --cf-danger
  }
  await expect(box(control).width).toBe(box(valid).width);
  await expect(box(control).height).toBe(box(valid).height);
};

export default {
  title: 'Components/Form',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`cf-field` lays out a control with its `<label>` above it and, when present, a hint (`cf-field__hint`) ' +
          'and an error message (`cf-field__error`) below. Link both to the control with `aria-describedby`. ' +
          '`cf-input` styles every text-like `<input>`, `cf-textarea` a `<textarea>` (`textarea.cf-input` looks ' +
          'the same) and `cf-select` a single `<select>`. State is native: `:focus-visible`, `disabled`, the ' +
          'browser\'s own validation (`:user-invalid`) and `aria-invalid="true"` for an error from the server. ' +
          'Size a control in characters with `size`, `cols` and `rows`. The library never shows or hides an ' +
          'error message: put it in the page only while the field is invalid.',
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
    const canvas = within(canvasElement);
    const email = canvas.getByRole('textbox', { name: 'Email' });
    await expect(email).toHaveAccessibleDescription('We only use it to reply.');
    const postcode = canvas.getByRole('textbox', { name: 'Postcode' });
    await expect(postcode).toBeInvalid();
    // One field: the label above its control, the hint and error message below, left-aligned.
    for (const field of canvasElement.querySelectorAll('.cf-field')) {
      const [label, control, note] = field.children;
      await expect(box(label).bottom).toBeLessThanOrEqual(box(control).top);
      await expect(box(control).bottom).toBeLessThanOrEqual(box(note).top);
      await expect(box(label).left).toBe(box(control).left);
      await expect(box(note).left).toBe(box(control).left);
      await expect(style(note).marginTop).toBe('0px');
      await expect(style(label).color).toBe('rgb(255, 255, 255)'); // --cf-fg, on any page
    }
    const hint = canvasElement.querySelector('.cf-field__hint');
    const error = canvasElement.querySelector('.cf-field__error');
    await expect(style(hint).color).toBe('rgb(179, 255, 179)'); // --cf-fg-dim
    await expect(px(style(hint).fontSize)).toBeLessThan(px(style(email).fontSize));
    await expect(style(error).color).toBe('rgb(255, 0, 0)'); // --cf-danger
    // A non-colour cue: a leading mark drawn before the message, silent to screen readers.
    await expect(style(error, '::before').content).not.toBe('none');
    await expect(postcode).toHaveAccessibleDescription('Enter a postcode like W12 7RJ.');
    await assertInvalidLook(postcode, email);
    // :invalid alone is not the invalid look: the empty required email is untouched.
    await expect(email.matches(':invalid')).toBe(true);
    await expect(style(email).borderTopWidth).toBe('2px');
  },
};

// The resting text-control look: page background, foreground text, a thin square border in
// the foreground colour, and one character of padding across.
const BLACK = 'rgb(0, 0, 0)';
const WHITE = 'rgb(255, 255, 255)';
const assertTextLook = async (control) => {
  const cs = style(control);
  await expect(cs.backgroundColor).toBe(BLACK); // --cf-bg
  await expect(cs.color).toBe(WHITE); // --cf-fg
  await expect(cs.borderTopStyle).toBe('solid');
  await expect(cs.borderTopWidth).toBe('2px'); // --cf-border-thin
  await expect(cs.borderTopColor).toBe(WHITE);
  await expect(cs.borderRadius).toBe('0px');
  await expect(cs.fontFamily).toMatch(/^"?Space Mono/);
};

const TYPES = ['text', 'email', 'password', 'search', 'url', 'tel', 'number'];
const typeField = (type) => `
<div class="cf-field">
  <label for="in-${type}">${type}</label>
  <input class="cf-input" id="in-${type}" name="${type}" type="${type}" placeholder="${type === 'number' ? '199' : `a ${type}`}">
</div>`;

// Every text-like type, a disabled one, and a search box beside its button: a text control is
// as tall as a default cf-btn, so the two line up. `size` sets the width in characters.
export const Input = {
  render: () =>
    html(`<div class="cf-stack">
${TYPES.map(typeField).join('')}
<div class="cf-field">
  <label for="in-short">Postcode (size="8")</label>
  <input class="cf-input" id="in-short" name="short" size="8">
</div>
<div class="cf-field">
  <label for="in-off">Disabled</label>
  <input class="cf-input" id="in-off" name="off" value="OFF AIR" disabled>
</div>
<search class="cf-cluster">
  <input class="cf-input" type="search" name="q" aria-label="Search pages" size="16">
  <button class="cf-btn" type="submit">Go</button>
</search>
</div>`),
  play: async ({ canvasElement }) => {
    await assertMarkupContract(canvasElement);
    for (const type of TYPES) {
      const input = canvasElement.querySelector(`#in-${type}`);
      await assertTextLook(input);
      await expect(style(input).paddingLeft).toBe(style(input).paddingRight);
      // Placeholders in the dim foreground colour, never faded further.
      const placeholder = style(input, '::placeholder');
      await expect(placeholder.color).toBe('rgb(179, 255, 179)'); // --cf-fg-dim
      await expect(placeholder.opacity).toBe('1');
    }
    // size="8" is narrower than the default 20 characters: the width is native, never fixed.
    const short = canvasElement.querySelector('#in-short');
    const text = canvasElement.querySelector('#in-text');
    await expect(box(short).width).toBeLessThan(box(text).width / 2);
    // Disabled dims like a disabled cf-btn, with a default cursor.
    const off = canvasElement.querySelector('#in-off');
    await expect(style(off).opacity).toBe('0.4');
    await expect(style(off).cursor).toBe('default');
    // A control and a default button in a row are the same height.
    const [q, go] = canvasElement.querySelector('search').children;
    await expect(Math.abs(box(q).height - box(go).height)).toBeLessThan(0.5);
    await expect(Math.abs(box(q).top - box(go).top)).toBeLessThan(0.5);
  },
};

// The computed look two textareas must share for `textarea.cf-input` to match `cf-textarea`.
const LOOK = [
  'borderTopWidth',
  'borderTopStyle',
  'borderTopColor',
  'borderRadius',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'backgroundColor',
  'color',
  'fontFamily',
  'fontSize',
  'lineHeight',
  'resize',
];
const look = (el) => Object.fromEntries(LOOK.map((p) => [p, style(el)[p]]));

// `cf-textarea` is the documented class; `textarea.cf-input` gets exactly the same look.
// `cols` and `rows` set the size in characters and lines.
export const Textarea = {
  render: () =>
    html(`<div class="cf-stack">
<div class="cf-field">
  <label for="letter">Letter</label>
  <textarea class="cf-textarea" id="letter" name="letter" rows="4" cols="40" required minlength="20"
            aria-describedby="letter-hint"></textarea>
  <p class="cf-field__hint" id="letter-hint">At least 20 characters.</p>
</div>
<div class="cf-field">
  <label for="ps">PS (textarea.cf-input)</label>
  <textarea class="cf-input" id="ps" name="ps" rows="4" cols="40" placeholder="Anything else?"></textarea>
</div>
<div class="cf-field">
  <label for="short-note">Note (cols="20" rows="2")</label>
  <textarea class="cf-textarea" id="short-note" name="note" rows="2" cols="20"></textarea>
</div>
<div class="cf-field">
  <label for="closed">Disabled</label>
  <textarea class="cf-textarea" id="closed" name="closed" rows="2" cols="20" disabled>Letters are closed.</textarea>
</div>
</div>`),
  play: async ({ canvasElement }) => {
    await assertMarkupContract(canvasElement);
    const [letter, ps, note, closed] = canvasElement.querySelectorAll('textarea');
    await assertTextLook(letter);
    await expect(look(ps)).toEqual(look(letter));
    await expect(box(ps).width).toBe(box(letter).width);
    await expect(box(ps).height).toBe(box(letter).height);
    await expect(style(ps, '::placeholder').color).toBe('rgb(179, 255, 179)'); // --cf-fg-dim
    // Half the columns and rows: about half the size, so the size is native, never fixed.
    await expect(box(note).width).toBeLessThan(box(letter).width * 0.6);
    await expect(box(note).height).toBeLessThan(box(letter).height * 0.6);
    await expect(style(closed).opacity).toBe('0.4');
    await expect(style(closed).cursor).toBe('default');
  },
};

// A single select with a drawn ▼ in the field's own colour; the open list stays the browser's.
export const Select = {
  render: () =>
    html(`<div class="cf-stack">
<div class="cf-field">
  <label for="region">Region</label>
  <select class="cf-select" id="region" name="region">
    <option>London</option>
    <option>Scotland</option>
    <option>Wales</option>
    <option>Northern Ireland</option>
  </select>
</div>
<div class="cf-field">
  <label for="region-off">Disabled</label>
  <select class="cf-select" id="region-off" name="region-off" disabled>
    <option>Off air</option>
  </select>
</div>
<div class="cf-cluster">
  <select class="cf-select" name="page" aria-label="Page">
    <option>P100 Index</option>
    <option>P302 Football</option>
  </select>
  <button class="cf-btn" type="submit">Go</button>
</div>
</div>`),
  play: async ({ canvasElement }) => {
    await assertMarkupContract(canvasElement);
    const region = within(canvasElement).getByRole('combobox', { name: 'Region' });
    await assertTextLook(region);
    await expect(style(region).appearance).toBe('none'); // no operating-system arrow
    // The ▼: two triangle halves in the field's own text colour.
    const arrow = style(region).backgroundImage;
    await expect(arrow.match(/linear-gradient\(/g)?.length).toBe(2);
    await expect(arrow.split(style(region).color).length).toBe(3);
    // Room for the ▼ at the end, so the longest option never runs under it.
    await expect(px(style(region).paddingRight)).toBeGreaterThan(px(style(region).paddingLeft) * 2);
    for (const option of region.options) {
      await expect(style(option).backgroundColor).toBe(BLACK);
      await expect(style(option).color).toBe(WHITE);
    }
    const off = canvasElement.querySelector('#region-off');
    await expect(style(off).opacity).toBe('0.4');
    await expect(style(off).cursor).toBe('default');
    const [page, go] = canvasElement.querySelector('.cf-cluster').children;
    await expect(Math.abs(box(page).height - box(go).height)).toBeLessThan(0.5);
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
    }
    if (args.cells === 40) delete page.dataset.cells;
    else page.dataset.cells = String(args.cells);
  },
};
