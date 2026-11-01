import { expect, within } from 'storybook/test';
import {
  ACCENT,
  assertCharacter,
  assertDisabled,
  assertDrawnChecked,
  assertDrawnRest,
  assertError,
  assertMarkupContract,
  attrs,
  DANGER,
  html,
  NBSP,
  px,
  shape,
  style,
  twin,
  uid,
  VARIANT,
  WHITE,
} from './_form.js';

// cf-checkbox (#131, #132): the native checkbox in a wrapping <label>, drawn as a square that
// fills with the accent colour when on, or as [ ] [X] [-] with data-variant="character".
// Indeterminate is a property only a script can set, so the story sets it from its arg.
const render = ({ label, variant, checked, indeterminate, required, disabled, error }) => {
  const err = error && uid('err');
  const root = html(`<div class="cf-field">
  <label><input${attrs({
    class: 'cf-checkbox',
    'data-variant': variant,
    type: 'checkbox',
    name: 'choice',
    value: 'yes',
    checked,
    required,
    disabled,
    'aria-invalid': !!error && 'true',
    'aria-describedby': err,
  })}> ${label}</label>
  ${error ? `<p class="cf-field__error" id="${err}">${error}</p>` : ''}
</div>`).firstElementChild;
  root.querySelector('input').indeterminate = indeterminate;
  return root;
};

export default {
  title: 'Components/Form/Checkbox',
  tags: ['autodocs'],
  render,
  argTypes: {
    label: { control: 'text' },
    variant: VARIANT,
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean', description: 'Set by script: a "some selected" parent' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    error: {
      control: 'text',
      description: 'A server error: a `cf-field__error`, linked, and `aria-invalid="true"` on the control',
    },
  },
  args: {
    label: 'Publish my letter',
    variant: '',
    checked: false,
    indeterminate: false,
    required: false,
    disabled: false,
    error: '',
  },
  parameters: {
    docs: {
      description: {
        component:
          'A square outlined in the foreground colour, beside the text of its wrapping `<label>`. Checked, the ' +
          'outline and an inner fill take the accent colour with a gap between them, so "on" changes the shape. ' +
          'Indeterminate shows a bar. `data-variant="character"` on the control draws `[ ]`, `[X]` and `[-]`. ' +
          'A group of checkboxes is a `<fieldset class="cf-field">` with a `<legend>` (see Field).',
      },
    },
  },
};

const checkbox = (canvasElement) => within(canvasElement).getByRole('checkbox');

export const Unchecked = {
  play: async ({ canvasElement }) => {
    await assertMarkupContract(canvasElement);
    await assertDrawnRest(checkbox(canvasElement), '0px');
  },
};

// Checking it changes its shape, not only its colour; unchecking changes it back.
export const Checked = {
  args: { checked: true },
  play: async ({ canvasElement }) => {
    const control = checkbox(canvasElement);
    await assertDrawnChecked(control);
    const on = shape(control);
    control.click();
    await expect(shape(control)).not.toEqual(on);
    control.click();
    await expect(shape(control)).toEqual(on);
  },
};

// A horizontal bar, in the accent colour, unlike both on and off.
export const Indeterminate = {
  args: { label: 'All regions', indeterminate: true },
  play: async ({ canvasElement }) => {
    const control = checkbox(canvasElement);
    await expect(control).toBePartiallyChecked();
    await expect(style(control).borderTopColor).toBe(ACCENT);
    await expect(px(style(control).borderTopWidth)).toBeGreaterThan(px(style(control).borderLeftWidth));
    const settle = (checked) => (c) => Object.assign(c, { indeterminate: false, checked });
    await expect(shape(control)).not.toEqual(twin(control, settle(true), shape));
    await expect(shape(control)).not.toEqual(twin(control, settle(false), shape));
  },
};

// Dimmed like a disabled cf-btn; it keeps its checked shape.
export const Disabled = {
  args: { label: 'Archive (off air)', checked: true, disabled: true },
  play: async ({ canvasElement }) => {
    const control = checkbox(canvasElement);
    await assertDisabled(control);
    await expect(shape(control)).toEqual(twin(control, (c) => (c.disabled = false), shape));
  },
};

export const ServerError = {
  name: 'Server error',
  args: { label: 'I agree to the terms', required: true, error: 'Agree to the terms to send your letter.' },
  play: async ({ canvasElement }) => {
    await assertMarkupContract(canvasElement);
    const control = checkbox(canvasElement);
    await expect(control).toBeInvalid();
    await expect(style(control).borderTopColor).toBe(DANGER);
    await assertError(control);
  },
};

// The character variant (#132): [ ], [X] and [-], the on glyphs in the accent colour, the
// danger colour when invalid; focus and disabled are the drawn default's. One story, the other
// states set in play() and put back.
export const Character = {
  args: { variant: 'character' },
  play: async ({ canvasElement }) => {
    const control = checkbox(canvasElement);
    await assertCharacter(control, `[${NBSP}]`, WHITE);
    control.click();
    await assertCharacter(control, '[X]', ACCENT);
    control.click();
    await assertCharacter(control, `[${NBSP}]`, WHITE);
    control.indeterminate = true;
    await assertCharacter(control, '[-]', ACCENT);
    control.indeterminate = false;
    control.setAttribute('aria-invalid', 'true');
    await assertCharacter(control, `[${NBSP}]`, DANGER);
    control.removeAttribute('aria-invalid');
    control.disabled = true;
    await assertDisabled(control);
    control.disabled = false;
  },
};
