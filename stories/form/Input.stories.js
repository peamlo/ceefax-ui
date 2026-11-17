import { expect, within } from 'storybook/test';
import { controlLook, pixels, realInput, underForcedColours, unhover } from '../_real-input.js';
import {
  assertDisabled,
  assertError,
  assertFieldLayout,
  assertHint,
  assertInvalidLook,
  assertMarkupContract,
  assertTextLook,
  attrs,
  box,
  DIM,
  field,
  style,
  withButton,
} from './_form.js';

// cf-input (#130): one class for every text-like <input>, in a cf-field with its label and,
// when present, its hint and error message. Pick a type, add a hint or a server error, size it
// in characters, or put a button beside it, from the controls.
const TYPES = ['text', 'email', 'password', 'search', 'url', 'tel', 'number'];

const render = ({ label, labelVisible, type, placeholder, value, size, required, disabled, hint, error, button }) =>
  field({ label, labelVisible, hint, error }, (id, describedBy) =>
    withButton(
      `<input${attrs({
        class: 'cf-input',
        id: labelVisible && id,
        name: type,
        type,
        // A password field needs autocomplete (html-validate, #127); the hint asks for a new one.
        autocomplete: type === 'password' && 'new-password',
        placeholder,
        value,
        size,
        required,
        disabled,
        'aria-label': !labelVisible && label,
        'aria-invalid': !!error && 'true',
        'aria-describedby': describedBy,
      })}>`,
      button,
    ),
  );

export default {
  title: 'Components/Form/Input',
  tags: ['autodocs'],
  render,
  argTypes: {
    label: { control: 'text' },
    labelVisible: {
      control: 'boolean',
      description: 'Off: no `<label>`; the control is named with `aria-label` instead (a search box)',
    },
    type: { control: 'select', options: TYPES },
    placeholder: { control: 'text' },
    value: { control: 'text' },
    size: { control: { type: 'number', min: 1 }, description: 'Width in characters (native `size`)' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    hint: { control: 'text', description: 'A `cf-field__hint`, linked with `aria-describedby`' },
    error: {
      control: 'text',
      description: 'A server error: a `cf-field__error`, linked, and `aria-invalid="true"` on the control',
    },
    button: { control: 'text', description: 'A submit `cf-btn` beside the control' },
  },
  args: {
    label: 'Name',
    labelVisible: true,
    type: 'text',
    placeholder: '',
    value: '',
    required: false,
    disabled: false,
    hint: '',
    error: '',
    button: '',
  },
  parameters: {
    docs: {
      description: {
        component:
          '`cf-input` styles every text-like `<input>`: square, thin-bordered, on the page background. ' +
          'Focus adds an accent ring and the text keeps its colours. An invalid control (`:user-invalid` after ' +
          'the user has interacted, or `aria-invalid="true"` from the server) gets a thicker danger border. ' +
          "`disabled` dims it like a disabled `cf-btn`. Size it in characters with `size`. A number field's " +
          "spinner and a search field's clear button stay the browser's own, drawn as a thin ▲▼ or ✕ in the " +
          "field's colour (Chrome and Safari; Firefox keeps its own).",
      },
    },
  },
};

const input = (canvasElement) => canvasElement.querySelector('input');

// The resting look, on every text-like type.
export const Text = {
  args: { placeholder: 'Your name' },
  play: async ({ canvasElement }) => {
    await assertMarkupContract(canvasElement);
    await assertFieldLayout(canvasElement.querySelector('.cf-field'));
    const control = input(canvasElement);
    await expect(style(control).paddingLeft).toBe(style(control).paddingRight);
    // Placeholders in the dim foreground colour, never faded further.
    await expect(style(control, '::placeholder').color).toBe(DIM);
    await expect(style(control, '::placeholder').opacity).toBe('1');
    for (const type of TYPES) {
      control.type = type;
      await assertTextLook(control);
    }
    control.type = 'text';
  },
};

// Required and empty, yet untouched: :invalid, but not the invalid look (no red on page load).
export const Email = {
  args: { label: 'Email', type: 'email', required: true, hint: 'We only use it to reply.' },
  play: async ({ canvasElement }) => {
    await assertMarkupContract(canvasElement);
    const control = within(canvasElement).getByRole('textbox', { name: 'Email' });
    await assertHint(control);
    await expect(control.matches(':invalid')).toBe(true);
    await expect(style(control).borderTopWidth).toBe('2px');
  },
};

export const Password = {
  args: { label: 'Password', type: 'password', hint: 'At least 8 characters.' },
  play: async ({ canvasElement }) => {
    await assertTextLook(input(canvasElement));
    await assertHint(input(canvasElement));
  },
};

// Contract (#139): the number spinner and the search clear button are the browser's own parts,
// drawn as a ▲▼ or ✕ in the field's own colour, in the last cell of the content box. Their
// computed style can't be read (getComputedStyle ignores ::-webkit-* parts), so read the pixels,
// as rendered and under forced colours, then click them for real: the top or bottom half steps
// the number, the ✕ clears the search. Leaves the value as rendered and nothing hovered.
const markCell = (control) => {
  const cs = getComputedStyle(control);
  const r = control.getBoundingClientRect();
  const cell = document.createElement('span');
  cell.style.cssText = `font: ${cs.font}; inline-size: 1ch; display: inline-block`;
  control.after(cell);
  const ch = cell.getBoundingClientRect().width;
  cell.remove();
  const end = r.right - parseFloat(cs.borderRightWidth) - parseFloat(cs.paddingRight);
  const em = parseFloat(cs.fontSize);
  return { x: end - ch, y: r.top + r.height / 2 - 0.6 * em, width: ch, height: 1.2 * em, ink: cs.color };
};
// How many pixels of the mark's cell are in the field's text colour (the system's, when forced).
const inkPixels = async (real, control) => {
  const { ink, ...cell } = markCell(control);
  const rgb = ink.match(/\d+/g).map(Number);
  const closeTo = (p) => p.every((c, i) => Math.abs(c - rgb[i]) < 32);
  return (await pixels(real, cell)).filter(closeTo).length;
};
const assertDrawnMark = async (control, stepsNumber) => {
  const real = await realInput();
  if (!real) return;
  await expect(await inkPixels(real, control)).toBeGreaterThan(4);
  await expect(await underForcedColours(real, () => inkPixels(real, control))).toBeGreaterThan(4);
  const cell = markCell(control);
  const rendered = control.value;
  // #171: the part is the gap and the cell, at least 24px each way (WCAG 2.2 target size), so
  // click just inside its far corners: top left steps up, bottom right steps down.
  const [w, h] = [Math.max(24, 2 * cell.width), Math.max(24, cell.height)];
  const [left, mid] = [cell.x - cell.width, cell.y + cell.height / 2];
  const clickAt = (x, dy) => real.commands.clickAt(left + x, mid + dy);
  if (stepsNumber) {
    await clickAt(2, 2 - h / 2);
    await expect(control.value).toBe(String(+rendered + 1));
    await clickAt(w - 2, h / 2 - 2);
    await expect(control.value).toBe(rendered);
  } else {
    await clickAt(2, 2 - h / 2);
    await expect(control.value).toBe('');
    await real.userEvent.fill(control, rendered);
  }
  await unhover(real);
};

// The spinner, drawn as a thin ▲▼ at the end: the top or bottom half steps the number (asserted
// with real clicks, below). A number field ignores `size`; the default width leaves room for two
// digits and the mark.
export const NumberInput = {
  name: 'Number',
  args: { label: 'Nights', type: 'number', value: '14' },
  play: async ({ canvasElement }) => {
    await assertTextLook(input(canvasElement));
    await assertDrawnMark(input(canvasElement), true);
  },
};

// No visible label: the search box is named with aria-label, and lines up with its button.
// With a value, the clear button shows as a thin ✕ (asserted with a real click, below).
export const Search = {
  args: {
    label: 'Search pages',
    labelVisible: false,
    type: 'search',
    placeholder: 'e.g. football',
    value: 'weather',
    size: 16,
    button: 'Go',
  },
  play: async ({ canvasElement }) => {
    await assertMarkupContract(canvasElement);
    const control = within(canvasElement).getByRole('searchbox', { name: 'Search pages' });
    const go = within(canvasElement).getByRole('button', { name: 'Go' });
    await expect(Math.abs(box(control).height - box(go).height)).toBeLessThan(0.5);
    await expect(Math.abs(box(control).top - box(go).top)).toBeLessThan(0.5);
    await assertDrawnMark(control, false);
  },
};

// An error from the server: aria-invalid="true" gives the invalid look, and the error message
// is linked. The library never shows or hides it: it is in the page only while it is true.
export const ServerError = {
  name: 'Server error',
  args: { label: 'Postcode', value: 'W12 7R', size: 8, error: 'Enter a postcode like W12 7RJ.' },
  play: async ({ canvasElement }) => {
    await assertMarkupContract(canvasElement);
    await assertFieldLayout(canvasElement.querySelector('.cf-field'));
    await assertInvalidLook(input(canvasElement));
    await assertError(input(canvasElement));
  },
};

// `size` sets the width in characters: the width is native, never fixed.
export const Sized = {
  name: 'Sized in characters',
  args: { label: 'Postcode', size: 8 },
  play: async ({ canvasElement }) => {
    const control = input(canvasElement);
    const narrow = box(control).width;
    control.size = 16;
    await expect(box(control).width).toBeGreaterThan(narrow * 1.5);
    control.size = 8;
  },
};

export const Disabled = {
  args: { label: 'Booking reference', value: 'TT-PENDING', disabled: true },
  play: async ({ canvasElement }) => {
    await assertDisabled(input(canvasElement));
    // Disabled stays dimmed under forced colours.
    const real = await realInput();
    if (!real) return;
    const { opacity } = await underForcedColours(real, () => controlLook(input(canvasElement)));
    await expect(opacity).toBe('0.4');
  },
};
