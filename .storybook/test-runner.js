import { getStoryContext } from '@storybook/test-runner';
import { injectAxe, checkA11y } from 'axe-playwright';

// The stories are the test surface (issue #8). Two mechanisms, one surface:
//  - story play() functions carry the assertions that in-page code can observe
//    (ARIA/role/text, static computed styles, the parseCharGrid pure contract);
//  - this hook carries the two that need *real* browser input — CSS :hover and
//    :focus-visible only respond to a real pointer/keyboard, which the synthetic
//    in-page userEvent cannot produce — plus the axe a11y pass.
//
// axe is gated to Components/* and the Layout/Page screen-frame story — the Foundations swatch/demo pages deliberately show
// the raw palette (known contrast tradeoffs), so running axe over them would fail the
// build on non-contract stories. Each gated story is audited twice: as authored, then
// with data-theme="accessible" on <html> at AAA contrast (color-contrast-enhanced, #12).

const BTN = '.cf-btn';
// Read an element's live colours from inside the page (runs in the browser context).
const colours = (sel) => {
  const cs = getComputedStyle(document.querySelector(sel));
  return { backgroundColor: cs.backgroundColor, color: cs.color };
};
// default button: fg=white / bg=black, so inversion => white bg + black text.
const INVERTED = { backgroundColor: 'rgb(255, 255, 255)', color: 'rgb(0, 0, 0)' };
const RESTING = { backgroundColor: 'rgb(0, 0, 0)', color: 'rgb(255, 255, 255)' };

async function assertButtonContract(page, name) {
  if (name === 'Default') {
    // Contract: keyboard focus (:focus-visible) inverts the colours. A real Tab
    // press (the button is the only focusable) makes :focus-visible match.
    await page.keyboard.press('Tab');
    expect(await page.evaluate(colours, BTN)).toEqual(INVERTED);
    // Contract: hover inverts too (same CSS rule as focus-visible).
    await page.hover(BTN);
    expect(await page.evaluate(colours, BTN)).toEqual(INVERTED);
  }
  if (name === 'Disabled') {
    // Contract: a disabled button does NOT invert on hover.
    await page.hover(BTN);
    expect(await page.evaluate(colours, BTN)).toEqual(RESTING);
  }
}

// Contract: hovering a fastext key inverts it — the page background behind the key's own
// colour as text. One key is enough, and deliberately so: the per-colour part (which
// colour each name resolves to) is pinned for all four by the Foundations/Variant colours
// matrix, so what is left for real input to prove is that the single hover rule fires.
// Hovering all four cost 9 Playwright round-trips in postVisit and made this suite fail
// intermittently on CI with "Resulting promise was garbage collected".
const RED_KEY = '.cf-fastext__key[data-variant="red"]';

async function assertFastextHover(page) {
  await page.hover(RED_KEY);
  expect(await page.evaluate(colours, RED_KEY)).toEqual({
    backgroundColor: 'rgb(0, 0, 0)',
    color: 'rgb(255, 0, 0)',
  });
  // Leave nothing hovered: the axe pass below audits the resting state, and a key held
  // in hover is a transient inversion whose contrast is not the contract. (Blue's hover
  // pair is blue-on-black, ~2.4:1 — it would fail axe if left held. See #12.)
  await page.mouse.move(0, 0);
}

// Contract (#12): under the accessible theme the hover inversion stays legible. Blue is the
// key whose authentic inversion fails (~2.4:1), so it is the one worth a real hover: it must
// invert to sky on black (9.5:1). Call with the theme already set on <html>.
const BLUE_KEY = '.cf-fastext__key[data-variant="blue"]';

async function assertAccessibleFastextHover(page) {
  await page.hover(BLUE_KEY);
  expect(await page.evaluate(colours, BLUE_KEY)).toEqual({
    backgroundColor: 'rgb(0, 0, 0)',
    color: 'rgb(102, 179, 255)',
  });
  await page.mouse.move(0, 0);
}

// Contract: below the narrow breakpoint the 4:3 frame is dropped and the page is full-bleed.
// Needs a real viewport resize, which in-page play() cannot do. Restores the wide viewport.
async function assertScreenFrame(page) {
  await page.setViewportSize({ width: 400, height: 800 });
  const { width, aspectRatio } = await page.evaluate(() => {
    const cs = getComputedStyle(document.querySelector('.cf-page[data-frame]'));
    return { width: parseFloat(cs.width), aspectRatio: cs.aspectRatio };
  });
  expect(aspectRatio).toBe('auto');
  expect(width).toBeGreaterThanOrEqual(380); // viewport minus scrollbar, i.e. full-bleed
  await page.setViewportSize({ width: 1280, height: 720 });
}

// Contract (#19): the notice flag flashes for ~5s then holds visible, never under reduced
// motion, and never with data-blink="off". Needs emulated media, which play() cannot set.
// Leaves the flag solid (animation finished) so axe audits the resting state.
async function assertNoticeBlink(page) {
  // The animated properties too: opacity, never visibility, keeps the flag in the a11y tree.
  const flagAnimations = () =>
    document.querySelector('.cf-notice__flag').getAnimations().map((a) => {
      const { duration, iterations } = a.effect.getComputedTiming();
      const props = [...new Set(a.effect.getKeyframes().flatMap((k) => Object.keys(k)))]
        .filter((k) => !['offset', 'computedOffset', 'easing', 'composite'].includes(k));
      return { duration, iterations, props };
    });
  // animation-name, not just getAnimations(): a leaked animation that already finished
  // (no fill) would also leave getAnimations() empty.
  const animationName = () => getComputedStyle(document.querySelector('.cf-notice__flag')).animationName;
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.evaluate(animationName)).toBe('none');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  if (await page.evaluate(() => document.querySelector('.cf-notice').dataset.blink === 'off')) {
    expect(await page.evaluate(animationName)).toBe('none');
    return;
  }
  expect(await page.evaluate(flagAnimations)).toEqual([{ duration: 1000, iterations: 5, props: ['opacity'] }]);
  const opacityAfter = await page.evaluate(() => {
    const flag = document.querySelector('.cf-notice__flag');
    flag.getAnimations().forEach((a) => a.finish());
    return getComputedStyle(flag).opacity;
  });
  expect(opacityAfter).toBe('1');
}

// `aaa` also enables axe's AAA contrast rule — the accessible theme's promise (#12).
const axe = async (page, { aaa = false } = {}) => {
  await checkA11y(page, '#storybook-root', {
    detailedReport: true,
    detailedReportOptions: { html: true },
    ...(aaa && { axeOptions: { rules: { 'color-contrast-enhanced': { enabled: true } } } }),
  });
};

export default {
  async postVisit(page, context) {
    const { title, name } = await getStoryContext(page, context);
    const isFrame = title === 'Layout/Page' && name === 'Screen frame (data-frame)';
    if (isFrame) await assertScreenFrame(page);
    if (!title.startsWith('Components/') && !isFrame) return;

    if (title === 'Components/Button') await assertButtonContract(page, name);
    if (title === 'Components/Fastext bar') await assertFastextHover(page);
    if (title === 'Components/Notice') await assertNoticeBlink(page);

    await injectAxe(page);
    await axe(page);
    // Every contract story must also pass axe — at AAA contrast — under the accessible theme.
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'accessible'));
    if (title === 'Components/Fastext bar') await assertAccessibleFastextHover(page);
    await axe(page, { aaa: true });
  },
};
