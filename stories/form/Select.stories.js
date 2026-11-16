import { expect, within } from 'storybook/test';
import {
  ACCENT,
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
// takes the field's look where base-select is supported, and is the browser's own elsewhere.
const render = ({ label, labelVisible, options, size, required, disabled, hint, error, button }) =>
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
        // As wide as an input of the same size. Not the native size: a select's is a row count.
        style: size && `inline-size: ${size + 2}ch`,
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
    size: {
      control: { type: 'number', min: 5 },
      description:
        "Width in characters, as an input's `size`: as wide as a `cf-input` of the same size, the ▼ taking two of them. Set as `inline-size: <size + 2>ch`, since a select's own `size` is a row count. Empty: 20, a default input",
    },
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
    await expect(style(control).appearance).not.toBe('auto'); // no operating-system arrow
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

// Where the browser supports base-select (#140), the open list takes the field's look: its
// border, the page background and type, and a ► on the chosen option. Elsewhere it stays the
// browser's own. Opening it needs a real click, so the test runner opens it and runs axe on it.
// The select is as wide as a default cf-input whatever is chosen, and the list as wide as the
// select: the last option is cut short in the select and wraps in the list.
export const OpenList = {
  name: 'Open list',
  args: { options: ['London', 'Scotland', 'Wales', 'Northern Ireland', 'Channel Islands and the Isle of Man'] },
  play: async ({ canvasElement }) => {
    const control = select(canvasElement);
    const width = box(control).width;
    control.selectedIndex = control.options.length - 1;
    await expect(box(control).width).toBe(width);
    control.selectedIndex = 0;
    if (!CSS.supports('appearance', 'base-select')) {
      await expect(style(control).appearance).toBe('none');
      return;
    }
    await expect(style(control).appearance).toBe('base-select');
    await expect(style(control).alignItems).toBe('center'); // the closed text stays centred
    await expect(style(control, '::picker-icon').display).toBe('none'); // the drawn ▼ stays
    const picker = style(control, '::picker(select)');
    await expect(picker.appearance).toBe('base-select');
    await expect(picker.borderTopColor).toBe(WHITE);
    await expect(picker.backgroundColor).toBe(BLACK);
    await expect(picker.fontFamily).toBe(style(control).fontFamily);
    const checkmark = style(control.options[0], '::checkmark');
    await expect(checkmark.content).toBe('"►"');
    await expect(checkmark.color).toBe(ACCENT);
  },
};
