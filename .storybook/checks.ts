// Spike #193: real-input checks, keyed by name. A story names the ones it needs in
// `parameters.checks`; test-runner.js postVisit looks each name up here and runs it.
// An unknown name throws, so a typo fails the run. Parameters cross from the browser to
// Node as JSON, so a story can only name a check, never carry its code.
//
// Each check runs in one or more phases of postVisit:
//  - input: before axe, on the story as authored;
//  - axe: after axe is injected, to configure it for this story;
//  - accessible: with data-theme="accessible" set on <html>, before the AAA axe pass.

declare const expect: any; // Jest's global in the test-runner

export const colours = (sel) => {
  const cs = getComputedStyle(document.querySelector(sel));
  return { backgroundColor: cs.backgroundColor, color: cs.color };
};
const BTN = '.cf-btn';
// default button: fg=white / bg=black, so inversion => white bg + black text.
export const INVERTED = { backgroundColor: 'rgb(255, 255, 255)', color: 'rgb(0, 0, 0)' };
const RESTING = { backgroundColor: 'rgb(0, 0, 0)', color: 'rgb(255, 255, 255)' };
const FIRST_KEY = '.cf-fastext__key';
export const BLACK = 'rgb(0, 0, 0)';
export const ACCENT = 'rgb(255, 255, 0)';

// A snapshot of a control's computed look (and width), compared before and after real input.
export const controlLook = (sel) => {
  const cs = getComputedStyle(document.querySelector(sel));
  return {
    backgroundColor: cs.backgroundColor,
    color: cs.color,
    borderColor: cs.borderTopColor,
    borderWidth: cs.borderTopWidth,
    outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`,
    opacity: cs.opacity,
    width: document.querySelector(sel).getBoundingClientRect().width,
  };
};

// Run `read` under emulated forced colours, then always switch them off again, so a failing
// read or assertion can't leak them into the next story (its axe pass would fail). Assert on
// what it returns, after it returns.
export async function underForcedColours(page, read) {
  await page.emulateMedia({ forcedColors: 'active' });
  try {
    return await read();
  } finally {
    await page.emulateMedia({ forcedColors: 'none' });
  }
}

// Contract (#150): a focused Scroll region shows the Focus ring, solid in the accent colour,
// never the browser's own ring.
export async function expectFocusRing(page, sel) {
  expect((await page.evaluate(controlLook, sel)).outline).toBe(`solid 2px ${ACCENT}`);
}

// Contract (#150): a real Tab reaches a link or fastext key and inverts it: its text colour
// fills the background, in black ink (the story's link and first key rest on the page).
// Contract (#149): under forced colours the Inversion is gone (the system replaces every colour),
// so the focused control must still show a ring: an outline, transparent as rendered and
// painted in a system colour when forced. Leaves forced colours off and nothing focused, so
// axe audits the resting look.
export async function assertFocusInversion(page, sel) {
  const outline = async () => (await page.evaluate(controlLook, sel)).outline;
  const restColours = await page.evaluate(colours, sel);
  const rest = await underForcedColours(page, outline);
  await page.keyboard.press('Tab');
  expect(await page.evaluate((s) => document.activeElement.matches(s), sel)).toBe(true);
  expect(await page.evaluate(colours, sel)).toEqual({ backgroundColor: restColours.color, color: BLACK });
  expect(await outline()).toBe('solid 2px rgba(0, 0, 0, 0)');
  const focused = await underForcedColours(page, outline);
  await page.evaluate(() => (document.activeElement as HTMLElement).blur());
  expect(rest).toMatch(/^none/);
  expect(focused).toMatch(/^solid 2px /);
  expect(focused).not.toMatch(/rgba\(0, 0, 0, 0\)$/);
}

// Contract: hovering a fastext key inverts it. A text key fills with its colour in its ink;
// a banded key drops to the page background with its text in the band colour. Asserted
// against the key's own resting colours, so it holds for either look and any theme. One key
// per story is enough, and deliberately so: the per-colour part (which colour each name
// resolves to) is pinned for every colour by the Foundations/Variant colours matrix, so what
// is left for real input to prove is that the hover rule fires. Hovering all four cost 9
// Playwright round-trips in postVisit and made this suite fail intermittently on CI with
// "Resulting promise was garbage collected". No story's first key is blue, so a text key's
// ink is black.
async function assertFastextHover(page) {
  const rest = await page.evaluate(colours, FIRST_KEY);
  await page.hover(FIRST_KEY);
  const banded = rest.backgroundColor !== 'rgba(0, 0, 0, 0)';
  expect(await page.evaluate(colours, FIRST_KEY)).toEqual(
    banded ? { backgroundColor: BLACK, color: rest.backgroundColor } : { backgroundColor: rest.color, color: BLACK },
  );
  // Leave nothing hovered: the axe pass below audits the resting state, and a key held in
  // hover is a transient inversion whose contrast is not the contract.
  await page.mouse.move(0, 0);
}

// Contract: below the narrow breakpoint the 4:3 frame is dropped and the page is full-bleed,
// with one non-zero inline padding shared by header, body and footer (#145).
// Needs a real viewport resize, which in-page play() cannot do. Restores the wide viewport.
async function assertScreenFrame(page) {
  await page.setViewportSize({ width: 400, height: 800 });
  const { width, aspectRatio, fontFamily } = await page.evaluate(() => {
    const cs = getComputedStyle(document.querySelector('.cf-page[data-frame]'));
    return { width: parseFloat(cs.width), aspectRatio: cs.aspectRatio, fontFamily: cs.fontFamily };
  });
  expect(aspectRatio).toBe('auto');
  expect(width).toBeGreaterThanOrEqual(380); // viewport minus scrollbar, i.e. full-bleed
  expect(fontFamily).toMatch(/^"?Space Mono/); // no grid, no Bedstead body text
  // #145: body and footer get the header row's inline padding, so all three start on one column.
  const pads = await page.evaluate(() =>
    ['.cf-header-row', '.cf-page__body', '.cf-page__footer'].map((s) => {
      const cs = getComputedStyle(document.querySelector(`.cf-page[data-frame] > ${s}`));
      return [cs.paddingLeft, cs.paddingRight];
    }),
  );
  expect(parseFloat(pads[0][0])).toBeGreaterThan(0);
  expect(pads[1]).toEqual(pads[0]);
  expect(pads[2]).toEqual(pads[0]);
  // A width-bound frame (taller viewport than 4:3): the 40-character row still fills the body.
  await page.setViewportSize({ width: 900, height: 1000 });
  const [rowW, spanW] = await page.evaluate(() => {
    const row = document.querySelector('.cf-page__body p > span').parentElement;
    return [row.getBoundingClientRect().width, (row.firstChild as Element).getBoundingClientRect().width];
  });
  expect(spanW).toBeLessThanOrEqual(rowW + 0.01); // never wraps at 39
  expect(rowW - spanW).toBeLessThan(40); // short by under 1px per cell (whole-pixel cells)
  await page.setViewportSize({ width: 1280, height: 720 });
}

// Contract (#150): a real Tab reaches the Screen frame body (the header row holds nothing
// focusable), which shows the Focus ring, and the whole ring lies inside the frame's visible
// box, which clips its overflow. Leaves nothing focused.
async function assertFrameFocusRing(page) {
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.activeElement.matches('.cf-page__body'))).toBe(true);
  await expectFocusRing(page, '.cf-page__body');
  const { ring, frame } = await page.evaluate(() => {
    const body = document.activeElement;
    const cs = getComputedStyle(body);
    const ringReach = parseFloat(cs.outlineOffset) + parseFloat(cs.outlineWidth);
    const r = body.getBoundingClientRect();
    // The frame clips at its padding box: inside its border, measured by clientLeft/clientTop.
    const page = body.closest('.cf-page');
    const p = page.getBoundingClientRect();
    const [left, top] = [p.left + page.clientLeft, p.top + page.clientTop];
    return {
      ring: {
        top: r.top - ringReach,
        right: r.right + ringReach,
        bottom: r.bottom + ringReach,
        left: r.left - ringReach,
      },
      frame: { top, left, right: left + page.clientWidth, bottom: top + page.clientHeight },
    };
  });
  expect(ring.top).toBeGreaterThanOrEqual(frame.top);
  expect(ring.left).toBeGreaterThanOrEqual(frame.left);
  expect(ring.right).toBeLessThanOrEqual(frame.right);
  expect(ring.bottom).toBeLessThanOrEqual(frame.bottom);
  await page.evaluate(() => (document.activeElement as HTMLElement).blur());
}

// Contract (#76): the CRT look renders neither scanlines nor glow under forced colours or the
// Accessible theme. Needs emulated media, which play() cannot set. Leaves both switches off.
async function assertCrtOffSwitches(page) {
  const crt = () => {
    const frame = document.querySelector('.cf-page[data-frame="crt"]');
    const cs = getComputedStyle(frame);
    return {
      overlay: getComputedStyle(frame, '::after').content,
      glow: getComputedStyle(frame.querySelector('p')).textShadow,
      tokens: ['--cf-crt-scanline', '--cf-crt-glow'].map((t) => cs.getPropertyValue(t)),
    };
  };
  const on = await page.evaluate(crt);
  expect(on.overlay).toBe('""');
  expect(on.glow).not.toBe('none');
  expect(await underForcedColours(page, () => page.evaluate(crt))).toMatchObject({ overlay: 'none', glow: 'none' });
  // The theme remaps aliases only (ADR-0010): both effects stay in place but paint transparent.
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'accessible'));
  expect((await page.evaluate(crt)).tokens).toEqual(['transparent', 'transparent']);
  await page.evaluate(() => document.documentElement.removeAttribute('data-theme'));
}

// Contract (#74): the Accessible theme wins over the frame's authentic colours, so the two
// off-palette aliases keep the theme's values (bg-2 has no theme remap: the default deep blue).
// Call with the theme already set on <html>, as the Storybook theme toolbar sets it.
async function assertAccessibleFrame(page) {
  const [dim, bg2] = await page.evaluate(() =>
    [...document.querySelectorAll('.cf-page__body span[style]')]
      .map((n) => getComputedStyle(n))
      .map((cs) => [cs.color, cs.backgroundColor]),
  );
  expect(dim[0]).toBe('rgb(179, 179, 179)'); // the theme's #b3b3b3
  expect(bg2[1]).toBe('rgb(16, 11, 138)'); // #100b8a, the default
}

type Phase = 'input' | 'axe' | 'accessible';
type Run = (page) => Promise<unknown>;

export const checks = {
  // Contract: keyboard focus (:focus-visible) inverts the colours, and so does hover (same CSS
  // rule). A real Tab press (the button is the only focusable) makes :focus-visible match.
  'button-inverts-on-focus-and-hover': {
    input: async (page) => {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(colours, BTN)).toEqual(INVERTED);
      await page.hover(BTN);
      expect(await page.evaluate(colours, BTN)).toEqual(INVERTED);
    },
  },
  // Contract: a disabled button does NOT invert on hover.
  'button-disabled-ignores-hover': {
    input: async (page) => {
      await page.hover(BTN);
      expect(await page.evaluate(colours, BTN)).toEqual(RESTING);
    },
  },
  // #12: under the accessible theme the inversion follows the theme's colours, ink still black.
  'fastext-key-inverts-on-hover': { input: assertFastextHover, accessible: assertFastextHover },
  'fastext-key-inverts-on-focus': { input: (page) => assertFocusInversion(page, FIRST_KEY) },
  'frame-reflows-narrow': { input: assertScreenFrame },
  'frame-shows-focus-ring': { input: assertFrameFocusRing },
  'crt-off-switches': { input: assertCrtOffSwitches },
  'frame-keeps-accessible-colours': { accessible: assertAccessibleFrame },
  // The scanline overlay is an absolutely positioned ::after with a background-image, which axe
  // treats as unknown background and skips contrast for (incomplete, not a violation). Ignore it,
  // so contrast is really measured with the glow on; the scanlines are a texture, not a background.
  // configure() replaces a check's options, so merge the defaults or the rule throws and is skipped.
  'axe-ignores-scanlines': {
    axe: (page) =>
      page.evaluate(() => {
        const { axe } = window as any;
        const { options } = axe._audit.checks['color-contrast'];
        axe.configure({ checks: [{ id: 'color-contrast', options: { ...options, ignorePseudo: true } }] });
      }),
  },
} satisfies Record<string, Partial<Record<Phase, Run>>>;

export type Check = keyof typeof checks;

// The named checks' runs for one phase, in the story's order. Throws on an unknown name.
export function runsFor(names: string[], phase: Phase, story: string): Run[] {
  return names
    .map((name) => {
      if (!Object.hasOwn(checks, name)) throw new Error(`Unknown check "${name}" in story "${story}"`);
      return checks[name][phase];
    })
    .filter(Boolean);
}
