import { expect } from 'storybook/test';

// CSS :hover, :focus-visible, media queries and forced colours only respond to *real* input: a
// real pointer, a real Tab, a real viewport, emulated media. Vitest browser mode provides it
// through `vitest/browser`, which throws when imported anywhere else, and the plain story view
// loads the story file outside Vitest. So the import is guarded: there a play() gets null and
// skips its real-input steps (the UI's Run tests and CI run them). Under the Storybook Vitest
// plugin a missing API throws instead, so a skipped step can never pass. Waits for the web fonts
// first: a real-input step compares layout before and after, and a font landing in between
// would move it.
export const realInput = async () => {
  if (globalThis.__vitest_browser__) {
    await document.fonts.ready;
    return import('vitest/browser');
  }
  if (import.meta.env.VITEST_STORYBOOK !== undefined) {
    throw new Error('Real input is missing under Vitest (globalThis.__vitest_browser__ is not set)');
  }
  return null;
};

// Leave nothing hovered: the axe pass audits the resting state, not a transient inversion.
// Parks the pointer off the page (vitest.config.js), as the preview does before every story.
export const unhover = async ({ commands }, el) => {
  await commands.movePointerAway();
  if (el) await expect(el.matches(':hover')).toBe(false);
};

// Resize the real viewport for one step, then put it back as it was.
export const atViewport = async ({ page }, width, height, step) => {
  const [w, h] = [innerWidth, innerHeight];
  await page.viewport(width, height);
  try {
    await step();
  } finally {
    await page.viewport(w, h);
  }
};

// Run `read` under emulated forced colours, then always switch them off again, so a failing
// read can't leak them into the next story. Assert on what it returns, after it returns.
export const underForcedColours = async ({ commands }, read) => {
  await commands.emulateMedia({ forcedColors: 'active' });
  try {
    return await read();
  } finally {
    await commands.emulateMedia({ forcedColors: 'none' });
  }
};

// The [r, g, b] of every pixel in a region of the viewport, from a real screenshot.
export const pixels = async ({ commands }, clip) => {
  const png = await commands.screenshot(clip);
  const img = await createImageBitmap(await (await fetch(`data:image/png;base64,${png}`)).blob());
  const ctx = new OffscreenCanvas(img.width, img.height).getContext('2d');
  ctx.drawImage(img, 0, 0);
  const px = ctx.getImageData(0, 0, img.width, img.height).data;
  return Array.from({ length: px.length / 4 }, (_, i) => [px[4 * i], px[4 * i + 1], px[4 * i + 2]]);
};

// An element's live colours, as a consumer would see them.
export const colours = (el) => {
  const cs = getComputedStyle(el);
  return { backgroundColor: cs.backgroundColor, color: cs.color };
};

// A control's computed look (and width), compared before and after real input.
export const controlLook = (el) => {
  const cs = getComputedStyle(el);
  return {
    backgroundColor: cs.backgroundColor,
    color: cs.color,
    borderColor: cs.borderTopColor,
    borderWidth: cs.borderTopWidth,
    outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`,
    opacity: cs.opacity,
    width: el.getBoundingClientRect().width,
  };
};

// Run one step under data-theme="accessible" on <html>, as a consumer sets it, then put the
// theme back as it was.
export const withAccessibleTheme = async (step) => {
  const root = document.documentElement;
  const theme = root.dataset.theme;
  root.dataset.theme = 'accessible';
  try {
    return await step();
  } finally {
    if (theme) root.dataset.theme = theme;
    else delete root.dataset.theme;
  }
};

export const BLACK = 'rgb(0, 0, 0)';
export const ACCENT = 'rgb(255, 255, 0)';

// Contract (#150): a real Tab reaches a link or fastext key and inverts it: its text colour
// fills the background, in black ink (the stories' link and first key rest on the page).
// Contract (#149): under forced colours the inversion is gone (the system replaces every
// colour), so the focused control must still show a ring: an outline, transparent as rendered
// and painted in a system colour when forced. Leaves forced colours off and nothing focused.
export const expectFocusInversion = async (input, el) => {
  const outline = () => controlLook(el).outline;
  const restColours = colours(el);
  const rest = await underForcedColours(input, outline);
  await input.userEvent.tab();
  await expect(document.activeElement).toBe(el);
  await expect(colours(el)).toEqual({ backgroundColor: restColours.color, color: BLACK });
  await expect(outline()).toBe('solid 2px rgba(0, 0, 0, 0)');
  const focused = await underForcedColours(input, outline);
  el.blur();
  await expect(rest).toMatch(/^none/);
  await expect(focused).toMatch(/^solid 2px /);
  await expect(focused).not.toMatch(/rgba\(0, 0, 0, 0\)$/);
};

// Contract (#150): a focused control or scroll region shows the Focus ring, solid in the accent
// colour, never the browser's own ring.
export const expectFocusRing = (el) => expect(controlLook(el).outline).toBe(`solid 2px ${ACCENT}`);
