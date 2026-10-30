import { expect } from 'storybook/test';

// CSS :hover, :focus-visible, media queries and prefers-reduced-motion only respond to *real*
// input: a real pointer, a real Tab, a real viewport, emulated media. Vitest browser mode
// provides it (.storybook/vitest.setup.js); the Storybook UI does not, so there a play()
// skips its real-input steps. Under Vitest a missing API throws: a skipped step never passes.
export const realInput = () => {
  const io = globalThis.cfRealInput;
  if (!io && globalThis.__vitest_browser__) {
    throw new Error('Real input is missing under Vitest: is .storybook/vitest.setup.js loaded?');
  }
  return io ?? null;
};

// Leave nothing hovered, so the axe pass audits the resting state, not a transient inversion.
export const unhover = async (io, el) => {
  await io.commands.movePointerAway();
  await expect(el.matches(':hover')).toBe(false);
};

// An element's live colours, as a consumer would see them.
export const colours = (el) => {
  const cs = getComputedStyle(el);
  return { backgroundColor: cs.backgroundColor, color: cs.color };
};

// Resize the real viewport for one step, then put it back as it was.
export const atViewport = async (io, width, height, step) => {
  const [w, h] = [innerWidth, innerHeight];
  await io.page.viewport(width, height);
  try {
    await step();
  } finally {
    await io.page.viewport(w, h);
  }
};
