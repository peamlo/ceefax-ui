import { expect } from 'storybook/test';

// Shared by the Components/Form/* stories (#126): the contract markup built from a story's args,
// and the assertions more than one control's stories make. play() asserts what a consumer sees
// (roles, computed styles, the markup contract), never a private --_* property. Real Tab focus,
// hover and real :user-invalid need real input, so they are asserted in .storybook/test-runner.js.

export const html = (markup) => {
  const root = document.createElement('div');
  root.innerHTML = markup;
  return root;
};
export const style = (el, pseudo) => getComputedStyle(el, pseudo);
export const px = (v) => parseFloat(v);
export const box = (el) => el.getBoundingClientRect();

export const BLACK = 'rgb(0, 0, 0)';
export const WHITE = 'rgb(255, 255, 255)';
export const DIM = 'rgb(179, 255, 179)'; // --cf-fg-dim
export const ACCENT = 'rgb(255, 255, 0)';
export const DANGER = 'rgb(255, 0, 0)';
export const NBSP = ' ';

// Attributes from an object: `true` is a bare attribute; false, '' and nullish are left out.
export const attrs = (o) =>
  Object.entries(o)
    .filter(([, v]) => v !== false && v !== '' && v != null)
    .map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${String(v).replace(/"/g, '&quot;')}"`))
    .join('');

// The docs page renders every story of a file at once, so each render needs its own ids.
let count = 0;
export const uid = (name) => `${name}-${++count}`;

// A field (cf-field): the label above the control, the hint and error message below, both
// linked from the control with aria-describedby. `control(id, describedBy)` is the control's
// markup. With `labelVisible: false` there is no <label>: the control names itself with
// aria-label (a search box), so `control` gets no id to link.
export const field = ({ label, labelVisible = true, hint, error }, control) => {
  const id = uid('field');
  const describedBy = [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(' ');
  return html(`<div class="cf-field">
  ${labelVisible ? `<label for="${id}">${label}</label>` : ''}
  ${control(id, describedBy)}
  ${hint ? `<p class="cf-field__hint" id="${id}-hint">${hint}</p>` : ''}
  ${error ? `<p class="cf-field__error" id="${id}-err">${error}</p>` : ''}
</div>`).firstElementChild;
};

// A control, with a submit button beside it when the story asks for one (a search box and
// its button line up: a text control is as tall as a default cf-btn).
export const withButton = (control, button) =>
  button ? `<div class="cf-cluster">${control}<button class="cf-btn" type="submit">${button}</button></div>` : control;

// Every control is named by its label, and every aria-describedby id exists in the page.
export const assertMarkupContract = async (canvasElement) => {
  const controls = [...canvasElement.querySelectorAll('input, textarea, select')];
  await expect(controls.length).toBeGreaterThan(0);
  for (const control of controls) {
    await expect(control.labels?.length || control.getAttribute('aria-label')).toBeTruthy();
    for (const id of (control.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean))
      await expect(document.getElementById(id), `#${id} is missing`).not.toBeNull();
  }
};

// The resting text-control look: page background, foreground text, a thin square border in
// the foreground colour, the body's monospace type.
export const assertTextLook = async (control) => {
  const cs = style(control);
  await expect(cs.backgroundColor).toBe(BLACK); // --cf-bg
  await expect(cs.color).toBe(WHITE); // --cf-fg
  await expect(cs.borderTopStyle).toBe('solid');
  await expect(cs.borderTopWidth).toBe('2px'); // --cf-border-thin
  await expect(cs.borderTopColor).toBe(WHITE);
  await expect(cs.borderRadius).toBe('0px');
  await expect(cs.fontFamily).toMatch(/^"?Space Mono/);
};

// A copy of `control` next to it with `change` applied, measured by `read`, then removed: a
// story renders one control, and some claims compare it with the same control in another state.
export const twin = (control, change, read) => {
  const copy = control.cloneNode(true);
  copy.removeAttribute('id');
  change(copy);
  control.after(copy);
  try {
    return read(copy);
  } finally {
    copy.remove();
  }
};

// The invalid look (aria-invalid="true" here, :user-invalid in the test-runner): a thicker
// border in the danger colour, and the box doesn't move compared with the same control valid.
export const assertInvalidLook = async (control) => {
  await expect(control).toBeInvalid();
  const cs = style(control);
  for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
    await expect(cs[`border${side}Width`]).toBe('4px'); // --cf-border-thick
    await expect(cs[`border${side}Color`]).toBe(DANGER); // --cf-danger
  }
  const valid = twin(control, (c) => c.removeAttribute('aria-invalid'), box);
  await expect(box(control).width).toBe(valid.width);
  await expect(box(control).height).toBe(valid.height);
};

// The hint is quieter, smaller text; the error message is the danger colour with a leading
// mark, silent to screen readers, so it isn't told by colour alone.
export const assertHint = async (control) => {
  const hint = control.closest('.cf-field').querySelector('.cf-field__hint');
  await expect(control).toHaveAccessibleDescription(hint.textContent);
  await expect(style(hint).color).toBe(DIM);
  await expect(px(style(hint).fontSize)).toBeLessThan(px(style(control).fontSize));
};
export const assertError = async (control) => {
  const error = control.closest('.cf-field').querySelector('.cf-field__error');
  await expect(control).toHaveAccessibleDescription(expect.stringContaining(error.textContent));
  await expect(style(error).color).toBe(DANGER);
  await expect(style(error, '::before').content).not.toBe('none');
};

// Disabled dims like a disabled cf-btn, with a default cursor.
export const assertDisabled = async (control) => {
  await expect(control).toBeDisabled();
  await expect(style(control).opacity).toBe('0.4');
  await expect(style(control).cursor).toBe('default');
};

// One field: the label above its control, the hint and error message below, left-aligned.
export const assertFieldLayout = async (fieldEl) => {
  const [label, control, ...notes] = fieldEl.children;
  await expect(box(label).bottom).toBeLessThanOrEqual(box(control).top);
  await expect(box(label).left).toBe(box(control).left);
  await expect(style(label).color).toBe(WHITE); // --cf-fg, on any page
  let above = control;
  for (const note of notes) {
    await expect(box(above).bottom).toBeLessThanOrEqual(box(note).top);
    await expect(box(note).left).toBe(box(control).left);
    above = note;
  }
};

// A checkbox or radio's drawn shape, the non-colour part of its look.
const SHAPE = ['borderTopWidth', 'borderTopStyle', 'borderLeftWidth', 'borderLeftStyle', 'borderRadius'];
export const shape = (el) => Object.fromEntries(SHAPE.map((p) => [p, style(el)[p]]));

// A checkbox or radio with its wrapping <label>, in a cf-field.
export const option = ({ cls, type, name, value, label, variant, ...rest }) =>
  `<div class="cf-field"><label><input${attrs({ class: cls, 'data-variant': variant, type, name, value, ...rest })}> ${label}</label></div>`;

// Resting: a square (checkbox) or a circle (radio) outlined in the foreground colour, beside
// its label's text, and no generated glyph (that is the character variant's).
export const assertDrawnRest = async (control, radius) => {
  const cs = style(control);
  await expect(cs.appearance).toBe('none');
  await expect(box(control).width).toBeGreaterThan(0);
  await expect(box(control).width).toBe(box(control).height);
  await expect(cs.borderRadius).toBe(radius);
  await expect(cs.borderTopStyle).toBe('solid');
  await expect(cs.borderTopWidth).toBe('2px'); // --cf-border-thin
  await expect(cs.borderTopColor).toBe(WHITE); // --cf-fg
  await expect(style(control, '::before').content).toBe('none');
  // Beside its text, on one line: the wrapping label is a row.
  const label = control.closest('label');
  await expect(box(control).right).toBeLessThan(box(label).right);
  await expect(box(label).height).toBeLessThan(box(control).height * 2);
};

// Checked: the outline and an inner fill take the accent colour, and the shape changes too
// (compared with the same control off), so "on" is never told by colour alone.
export const assertDrawnChecked = async (on) => {
  await expect(on.checked).toBe(true);
  for (const side of ['Top', 'Right', 'Bottom', 'Left']) await expect(style(on)[`border${side}Color`]).toBe(ACCENT);
  const off = twin(
    on,
    (c) => {
      c.checked = false;
      c.removeAttribute('name');
    },
    (c) => ({ shape: shape(c), width: box(c).width }),
  );
  await expect(shape(on)).not.toEqual(off.shape);
  await expect(box(on).width).toBe(off.width);
};

// A group is a fieldset field, named by its legend, with no fieldset border or padding.
export const assertGroup = async (fieldset, name) => {
  await expect(fieldset).toHaveAccessibleName(name);
  const cs = style(fieldset);
  await expect(cs.borderTopStyle).toBe('none');
  await expect(cs.paddingLeft).toBe('0px');
  await expect(cs.paddingTop).toBe('0px');
  const legend = fieldset.querySelector('legend');
  await expect(box(legend).left).toBe(box(fieldset).left);
  await expect(box(legend).bottom).toBeLessThanOrEqual(box(fieldset.querySelector('input')).top);
};

// The character variant (#132): the control is drawn as its glyph, generated content on the
// <input> itself. No spec requires a browser to draw that (w3c/csswg-drafts#12876), so this is
// also the guard: the control has no size or border of its own, and with its glyph suppressed
// (content: none) it must be narrower, so its width comes from a ::before the browser drew.
// A browser that stops drawing generated content on inputs leaves the two widths equal.
const NO_GLYPH = Object.assign(document.createElement('style'), {
  textContent: '[data-no-glyph]::before { content: none }',
});
const glyphWidth = (control) => {
  const drawn = box(control).width;
  document.head.append(NO_GLYPH);
  control.dataset.noGlyph = '';
  const bare = box(control).width;
  delete control.dataset.noGlyph;
  NO_GLYPH.remove();
  return drawn - bare;
};
export const assertCharacter = async (control, glyph, colour) => {
  await expect(style(control, '::before').content).toBe(`"${glyph}"`);
  await expect(style(control, '::before').color).toBe(colour);
  await expect([style(control).borderTopStyle, style(control).borderLeftStyle]).toEqual(['none', 'none']);
  await expect(glyphWidth(control)).toBeGreaterThan(0);
};

export const VARIANT = {
  control: { type: 'inline-radio', labels: { '': 'drawn' } },
  options: ['', 'character'],
  description: '`data-variant` on the control: none for the drawn shape (the default), `character` for text characters',
};
