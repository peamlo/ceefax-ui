import { expect, within } from 'storybook/test';
import {
  ACCENT,
  assertCharacter,
  assertDisabled,
  assertDrawnChecked,
  assertDrawnRest,
  assertGroup,
  assertMarkupContract,
  DANGER,
  html,
  NBSP,
  option,
  shape,
  style,
  uid,
  VARIANT,
  WHITE,
} from './_form.js';

// cf-radio (#131, #132): a radio only means something in its group, so the story renders one:
// a <fieldset class="cf-field"> named by its legend, each native radio in a wrapping <label>.
// Drawn as a circle that fills with the accent colour, or as ( ) (*) with data-variant="character".
// Arrow keys move the choice, natively (asserted in the test-runner).
const OPTIONS = ['BBC1', 'BBC2', 'ITV'];

const render = ({ legend, options, variant, checked, disabled, error }) => {
  const name = uid('radio');
  const err = error && `${name}-err`;
  return html(`<fieldset class="cf-field"${err ? ` aria-describedby="${err}"` : ''}>
  <legend>${legend}</legend>
  ${options
    .map((label) =>
      option({
        cls: 'cf-radio',
        type: 'radio',
        name,
        value: label,
        label,
        variant,
        checked: label === checked,
        disabled: label === disabled,
        'aria-invalid': !!error && 'true',
      }),
    )
    .join('')}
  ${error ? `<p class="cf-field__error" id="${err}">${error}</p>` : ''}
</fieldset>`).firstElementChild;
};

export default {
  title: 'Components/Form/Radio',
  tags: ['autodocs'],
  render,
  argTypes: {
    legend: { control: 'text' },
    options: { control: 'object', description: 'The option texts (each is also its value)' },
    variant: VARIANT,
    checked: { control: 'select', options: ['', ...OPTIONS], description: 'The option that is on' },
    disabled: { control: 'select', options: ['', ...OPTIONS], description: 'An option that is disabled' },
    error: {
      control: 'text',
      description:
        'A server error for the group: a `cf-field__error` linked from the fieldset, and `aria-invalid="true"` on its radios',
    },
  },
  args: { legend: 'Channel', options: OPTIONS, variant: '', checked: 'BBC1', disabled: '', error: '' },
  parameters: {
    docs: {
      description: {
        component:
          'A circle outlined in the foreground colour, beside the text of its wrapping `<label>`. Checked, the ' +
          'outline and an inner fill take the accent colour with a gap between them, so "on" changes the shape. ' +
          '`data-variant="character"` on each radio draws `( )` and `(*)`.',
      },
    },
  },
};

const radio = (canvasElement, name) => within(canvasElement).getByRole('radio', { name });

// One on, the others off; checking another moves the "on" shape to it.
export const Group = {
  play: async ({ canvasElement }) => {
    await assertMarkupContract(canvasElement);
    await assertGroup(canvasElement.querySelector('fieldset'), 'Channel');
    const on = radio(canvasElement, 'BBC1');
    const off = radio(canvasElement, 'BBC2');
    await assertDrawnRest(off, '50%');
    await assertDrawnChecked(on);
    const rest = shape(off);
    off.click();
    await assertDrawnChecked(off);
    await expect(shape(on)).toEqual(rest);
    on.click();
  },
};

// A group with nothing chosen matches :indeterminate, yet every radio in it is off; a server
// error turns each the danger colour and is linked from the fieldset.
export const ServerError = {
  name: 'Server error',
  args: { legend: 'Day', options: ['Saturday', 'Sunday'], checked: '', error: 'Choose a day.' },
  play: async ({ canvasElement }) => {
    await assertMarkupContract(canvasElement);
    const fieldset = canvasElement.querySelector('fieldset');
    await assertGroup(fieldset, 'Day');
    await expect(fieldset).toHaveAccessibleDescription('Choose a day.');
    for (const control of within(fieldset).getAllByRole('radio')) {
      await expect(control.matches(':indeterminate')).toBe(true);
      await expect(control).toBeInvalid();
      await expect(style(control).borderTopColor).toBe(DANGER);
      await expect(style(control).borderRadius).toBe('50%');
      await expect(style(control).borderTopWidth).toBe('2px');
    }
  },
};

export const WithDisabled = {
  name: 'With a disabled option',
  args: { disabled: 'ITV' },
  play: async ({ canvasElement }) => assertDisabled(radio(canvasElement, 'ITV')),
};

// The character variant (#132): ( ) and (*), the on glyph in the accent colour.
export const Character = {
  args: { variant: 'character' },
  play: async ({ canvasElement }) => {
    const on = radio(canvasElement, 'BBC1');
    const off = radio(canvasElement, 'BBC2');
    await assertCharacter(on, '(*)', ACCENT);
    await assertCharacter(off, `(${NBSP})`, WHITE);
    off.click();
    await assertCharacter(off, '(*)', ACCENT);
    await assertCharacter(on, `(${NBSP})`, WHITE);
    on.click();
  },
};

export const CharacterDisabled = {
  name: 'Character, disabled option',
  args: { variant: 'character', disabled: 'ITV' },
  play: async ({ canvasElement }) => {
    await assertCharacter(radio(canvasElement, 'ITV'), `(${NBSP})`, WHITE);
    await assertDisabled(radio(canvasElement, 'ITV'));
  },
};

// Nothing chosen (:indeterminate) is still off, in the danger colour when invalid.
export const CharacterServerError = {
  name: 'Character, server error',
  args: { variant: 'character', legend: 'Slot', options: ['Morning', 'Evening'], checked: '', error: 'Choose a slot.' },
  play: async ({ canvasElement }) => {
    for (const control of within(canvasElement).getAllByRole('radio'))
      await assertCharacter(control, `(${NBSP})`, DANGER);
  },
};
