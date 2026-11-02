import { expect, within } from 'storybook/test';
import {
  assertDisabled,
  assertError,
  assertInvalidLook,
  assertMarkupContract,
  assertTextLook,
  attrs,
  BLACK,
  box,
  field,
  px,
  style,
  WHITE,
  withButton,
} from './_form.js';

// cf-select (#130): a single <select> with a drawn ▼ in the field's own colour; the open list
// stays the browser's own picker.
const render = ({ label, labelVisible, options, required, disabled, hint, error, button }) =>
  field({ label, labelVisible, hint, error }, (id, describedBy) =>
    withButton(
      `<select${attrs({
        class: 'cf-select',
        id: labelVisible && id,
        name: 'choice',
        required,
        disabled,
        'aria-label': !labelVisible && label,
        'aria-invalid': !!error && 'true',
        'aria-describedby': describedBy,
      })}>${options.map((o) => `<option>${o}</option>`).join('')}</select>`,
      button,
    ),
  );

export default {
  title: 'Components/Form/Select',
  tags: ['autodocs'],
  render,
  argTypes: {
    label: { control: 'text' },
    labelVisible: {
      control: 'boolean',
      description: 'Off: no `<label>`; the control is named with `aria-label` instead',
    },
    options: { control: 'object', description: 'The option texts' },
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
    label: 'Region',
    labelVisible: true,
    options: ['London', 'Scotland', 'Wales', 'Northern Ireland'],
    required: false,
    disabled: false,
    hint: '',
    error: '',
    button: '',
  },
};

const select = (canvasElement) => canvasElement.querySelector('select');

export const Default = {
  play: async ({ canvasElement }) => {
    await assertMarkupContract(canvasElement);
    const control = within(canvasElement).getByRole('combobox', { name: 'Region' });
    await assertTextLook(control);
    await expect(style(control).appearance).toBe('none'); // no operating-system arrow
    // The ▼: two triangle halves in the field's own text colour.
    const arrow = style(control).backgroundImage;
    await expect(arrow.match(/linear-gradient\(/g)?.length).toBe(2);
    await expect(arrow.split(style(control).color).length).toBe(3);
    // Room for the ▼ at the end, so the longest option never runs under it.
    await expect(px(style(control).paddingRight)).toBeGreaterThan(px(style(control).paddingLeft) * 2);
    for (const option of control.options) {
      await expect(style(option).backgroundColor).toBe(BLACK);
      await expect(style(option).color).toBe(WHITE);
    }
  },
};

export const ServerError = {
  name: 'Server error',
  args: { options: ['Choose a region', 'London', 'Wales'], error: 'Choose a region.' },
  play: async ({ canvasElement }) => {
    await assertInvalidLook(select(canvasElement));
    await assertError(select(canvasElement));
  },
};

export const Disabled = {
  args: { options: ['Off air'], disabled: true },
  play: async ({ canvasElement }) => assertDisabled(select(canvasElement)),
};

// No visible label, and a button beside it: the two are the same height.
export const WithButton = {
  name: 'With a button',
  args: { label: 'Page', labelVisible: false, options: ['P100 Index', 'P302 Football'], button: 'Go' },
  play: async ({ canvasElement }) => {
    await assertMarkupContract(canvasElement);
    const go = within(canvasElement).getByRole('button', { name: 'Go' });
    await expect(Math.abs(box(select(canvasElement)).height - box(go).height)).toBeLessThan(0.5);
  },
};
