import { expect, within } from 'storybook/test';
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
          '`disabled` dims it like a disabled `cf-btn`. Size it in characters with `size`.',
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

export const NumberInput = {
  name: 'Number',
  args: { label: 'Nights', type: 'number', value: '7', size: 4 },
  play: async ({ canvasElement }) => assertTextLook(input(canvasElement)),
};

// No visible label: the search box is named with aria-label, and lines up with its button.
export const Search = {
  args: {
    label: 'Search pages',
    labelVisible: false,
    type: 'search',
    placeholder: 'e.g. football',
    size: 16,
    button: 'Go',
  },
  play: async ({ canvasElement }) => {
    await assertMarkupContract(canvasElement);
    const control = within(canvasElement).getByRole('searchbox', { name: 'Search pages' });
    const go = within(canvasElement).getByRole('button', { name: 'Go' });
    await expect(Math.abs(box(control).height - box(go).height)).toBeLessThan(0.5);
    await expect(Math.abs(box(control).top - box(go).top)).toBeLessThan(0.5);
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
  play: async ({ canvasElement }) => assertDisabled(input(canvasElement)),
};
