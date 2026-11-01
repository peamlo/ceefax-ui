import { expect } from 'storybook/test';
import {
  assertDisabled,
  assertError,
  assertHint,
  assertInvalidLook,
  assertMarkupContract,
  assertTextLook,
  attrs,
  box,
  DIM,
  field,
  style,
  twin,
} from './_form.js';

// cf-textarea (#130): the same look as cf-input, over several lines. `cols` and `rows` set the
// size in characters and lines. `textarea.cf-input` looks exactly the same.
const render = ({ className, label, placeholder, value, cols, rows, required, disabled, hint, error }) =>
  field(
    { label, hint, error },
    (id, describedBy) =>
      `<textarea${attrs({
        class: className,
        id,
        name: 'letter',
        cols,
        rows,
        placeholder,
        required,
        disabled,
        'aria-invalid': !!error && 'true',
        'aria-describedby': describedBy,
      })}>${value}</textarea>`,
  );

export default {
  title: 'Components/Form/Textarea',
  tags: ['autodocs'],
  render,
  argTypes: {
    className: {
      name: 'class',
      control: 'inline-radio',
      options: ['cf-textarea', 'cf-input'],
      description: '`cf-textarea` is the documented class; `textarea.cf-input` looks the same',
    },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    value: { control: 'text' },
    cols: { control: { type: 'number', min: 1 }, description: 'Width in characters (native `cols`)' },
    rows: { control: { type: 'number', min: 1 }, description: 'Height in lines (native `rows`)' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    hint: { control: 'text', description: 'A `cf-field__hint`, linked with `aria-describedby`' },
    error: {
      control: 'text',
      description: 'A server error: a `cf-field__error`, linked, and `aria-invalid="true"` on the control',
    },
  },
  args: {
    className: 'cf-textarea',
    label: 'Letter',
    placeholder: '',
    value: '',
    cols: 40,
    rows: 4,
    required: false,
    disabled: false,
    hint: '',
    error: '',
  },
};

const textarea = (canvasElement) => canvasElement.querySelector('textarea');

export const Default = {
  args: { required: true, hint: 'At least 20 characters.', placeholder: 'Dear Ceefax…' },
  play: async ({ canvasElement }) => {
    await assertMarkupContract(canvasElement);
    await assertTextLook(textarea(canvasElement));
    await assertHint(textarea(canvasElement));
    await expect(style(textarea(canvasElement), '::placeholder').color).toBe(DIM);
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
const look = (el) => ({
  ...Object.fromEntries(LOOK.map((p) => [p, style(el)[p]])),
  width: box(el).width,
  height: box(el).height,
});

export const InputClass = {
  name: 'With cf-input',
  args: { className: 'cf-input', label: 'PS', placeholder: 'Anything else?' },
  play: async ({ canvasElement }) => {
    const control = textarea(canvasElement);
    await expect(look(control)).toEqual(twin(control, (c) => (c.className = 'cf-textarea'), look));
  },
};

// Half the columns and rows: about half the size, so the size is native, never fixed.
export const Sized = {
  name: 'Sized in characters',
  args: { label: 'Note', cols: 20, rows: 2 },
  play: async ({ canvasElement }) => {
    const control = textarea(canvasElement);
    const big = twin(control, (c) => Object.assign(c, { cols: 40, rows: 4 }), box);
    await expect(box(control).width).toBeLessThan(big.width * 0.6);
    await expect(box(control).height).toBeLessThan(big.height * 0.6);
  },
};

export const ServerError = {
  name: 'Server error',
  args: { value: 'Too short.', error: 'Write at least 20 characters.' },
  play: async ({ canvasElement }) => {
    await assertInvalidLook(textarea(canvasElement));
    await assertError(textarea(canvasElement));
  },
};

export const Disabled = {
  args: { cols: 20, rows: 2, value: 'Letters are closed.', disabled: true },
  play: async ({ canvasElement }) => assertDisabled(textarea(canvasElement)),
};
