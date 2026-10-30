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

// Contract: hovering a fastext key inverts it. A text key fills with its colour in its ink;
// a banded key drops to the page background with its text in the band colour. Asserted
// against the key's own resting colours, so it holds for either look and any theme. One key
// per story is enough, and deliberately so: the per-colour part (which colour each name
// resolves to) is pinned for every colour by the Foundations/Variant colours matrix, so what
// is left for real input to prove is that the hover rule fires. Hovering all four cost 9
// Playwright round-trips in postVisit and made this suite fail intermittently on CI with
// "Resulting promise was garbage collected". No story's first key is blue, so a text key's
// ink is black.
const FIRST_KEY = '.cf-fastext__key';
const BLACK = 'rgb(0, 0, 0)';

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

// Contract: below the narrow breakpoint the 4:3 frame is dropped and the page is full-bleed.
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
  // A width-bound frame (taller viewport than 4:3): the 40-character row still fills the body.
  await page.setViewportSize({ width: 900, height: 1000 });
  const [rowW, spanW] = await page.evaluate(() => {
    const row = document.querySelector('.cf-page__body p > span').parentElement;
    return [row.getBoundingClientRect().width, row.firstChild.getBoundingClientRect().width];
  });
  expect(spanW).toBeLessThanOrEqual(rowW + 0.01); // never wraps at 39
  expect(rowW - spanW).toBeLessThan(40); // short by under 1px per cell (whole-pixel cells)
  await page.setViewportSize({ width: 1280, height: 720 });
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
  await page.emulateMedia({ forcedColors: 'active' });
  expect(await page.evaluate(crt)).toMatchObject({ overlay: 'none', glow: 'none' });
  await page.emulateMedia({ forcedColors: 'none' });
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

// Contract (#72): at phone width the header row wraps inside the page shell, keeping the
// page number visible and nothing spilling sideways. Restores the wide viewport.
async function assertHeaderRowNarrow(page) {
  await page.setViewportSize({ width: 320, height: 640 });
  const { pageVisible, fits } = await page.evaluate(() => {
    const row = document.querySelector('.cf-header-row');
    const r = row.querySelector('.cf-header-row__page').getBoundingClientRect();
    return {
      pageVisible: r.width > 0 && r.left >= 0 && r.right <= innerWidth,
      fits: row.scrollWidth <= row.clientWidth,
    };
  });
  expect(pageVisible).toBe(true);
  expect(fits).toBe(true);
  await page.setViewportSize({ width: 1280, height: 720 });
}

// Contract (#100): at phone width a wide table scrolls inside its region, never the page,
// and a real Tab reaches the region so keyboard users can scroll it. Restores the wide viewport.
async function assertTableNarrow(page) {
  await page.setViewportSize({ width: 320, height: 640 });
  const { pageFits, regionScrolls } = await page.evaluate(() => {
    const region = document.querySelector('.cf-table__scroll');
    return {
      pageFits: document.documentElement.scrollWidth <= innerWidth,
      regionScrolls: region.scrollWidth > region.clientWidth,
    };
  });
  expect(pageFits).toBe(true);
  expect(regionScrolls).toBe(true);
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.activeElement.matches('.cf-table__scroll'))).toBe(true);
  await page.setViewportSize({ width: 1280, height: 720 });
}

// Contract (#19): the notice flag flashes for ~5s then holds visible, never under reduced
// motion, and never with data-blink="off". Needs emulated media, which play() cannot set.
// Leaves the flag solid (animation finished) so axe audits the resting state.
async function assertNoticeBlink(page) {
  // The animated properties too: opacity, never visibility, keeps the flag in the a11y tree.
  const flagAnimations = () =>
    document
      .querySelector('.cf-notice__flag')
      .getAnimations()
      .map((a) => {
        const { duration, iterations } = a.effect.getComputedTiming();
        const props = [...new Set(a.effect.getKeyframes().flatMap((k) => Object.keys(k)))].filter(
          (k) => !['offset', 'computedOffset', 'easing', 'composite'].includes(k),
        );
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

const ignoreAxePseudo = () => {
  const { options } = window.axe._audit.checks['color-contrast'];
  window.axe.configure({ checks: [{ id: 'color-contrast', options: { ...options, ignorePseudo: true } }] });
};

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
    const isCrt = title === 'Layout/Page' && name === 'Screen frame, CRT look (data-frame="crt")';
    const isFrame = (title === 'Layout/Page' && name === 'Screen frame (data-frame)') || isCrt;
    if (isFrame) await assertScreenFrame(page);
    if (isCrt) await assertCrtOffSwitches(page);
    if (!title.startsWith('Components/') && !isFrame) return;

    if (title === 'Components/Button') await assertButtonContract(page, name);
    if (title === 'Components/Fastext bar') await assertFastextHover(page);
    if (title === 'Components/Notice') await assertNoticeBlink(page);
    if (title === 'Components/Header row' && name === 'In the Screen frame') await assertHeaderRowNarrow(page);
    if (title === 'Components/Table' && name === 'Wide, with long text') await assertTableNarrow(page);

    await injectAxe(page);
    // The scanline overlay is an absolutely positioned ::after with a background-image, which axe
    // treats as unknown background and skips contrast for (incomplete, not a violation). Ignore it,
    // so contrast is really measured with the glow on; the scanlines are a texture, not a background.
    // configure() replaces a check's options, so merge the defaults or the rule throws and is skipped.
    if (isCrt) await page.evaluate(ignoreAxePseudo);
    await axe(page);
    // Every contract story must also pass axe — at AAA contrast — under the accessible theme.
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'accessible'));
    // #12: under the accessible theme the inversion follows the theme's colours, ink still black.
    if (title === 'Components/Fastext bar') await assertFastextHover(page);
    if (isFrame) await assertAccessibleFrame(page);
    await axe(page, { aaa: true });
  },
};
