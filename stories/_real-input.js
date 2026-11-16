// PROTOTYPE (#194): real input for play(). `vitest/browser` drives Playwright over CDP, but it only
// exists inside Vitest browser mode (importing it anywhere else throws), so the import is dynamic
// and guarded: in the Storybook UI this resolves to null and the story skips its real-input checks.
export const realInput = () => (globalThis.__vitest_browser__ ? import('vitest/browser') : Promise.resolve(null));

// Under forced colours for the length of `read`, then always off again (the emulateMedia command,
// vitest.config.ts).
export async function underForcedColours({ commands }, read) {
  await commands.emulateMedia({ forcedColors: 'active' });
  try {
    return await read();
  } finally {
    await commands.emulateMedia({ forcedColors: 'none' });
  }
}

export const colours = (el) => {
  const cs = getComputedStyle(el);
  return { backgroundColor: cs.backgroundColor, color: cs.color };
};
