import { getStoryContext } from '@storybook/test-runner';
import { injectAxe, checkA11y } from 'axe-playwright';
import { HtmlValidate } from 'html-validate';
import htmlValidateConfig from '../.htmlvalidate.js';
import {
  runsFor,
  colours,
  INVERTED,
  BLACK,
  ACCENT,
  controlLook,
  underForcedColours,
  expectFocusRing,
  assertFocusInversion,
} from './checks.ts';

// The stories are the test surface (issue #8). Two mechanisms, one surface:
//  - story play() functions carry the assertions that in-page code can observe
//    (ARIA/role/text, static computed styles);
//  - this hook carries the two that need *real* browser input — CSS :hover and
//    :focus-visible only respond to a real pointer/keyboard, which the synthetic
//    in-page userEvent cannot produce — plus the axe a11y pass and, on every story it visits,
//    html-validate over the rendered HTML (#127).
//
// axe is gated to Components/* and any story that names checks (parameters.checks, spike #193) — the Foundations swatch/demo pages deliberately show
// the raw palette (known contrast tradeoffs), so running axe over them would fail the
// build on non-contract stories. Each gated story is audited twice: as authored, then
// with data-theme="accessible" on <html> at AAA contrast (color-contrast-enhanced, #12).

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
// and a real Tab reaches the region so keyboard users can scroll it. Contract (#150): the
// focused region shows the Focus ring.
// Restores the wide viewport.
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
  await expectFocusRing(page, '.cf-table__scroll');
  await page.evaluate(() => document.activeElement.blur());
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

// Contract (#75): under forced colours a mosaic is a picture: it keeps its ink and band, on its
// own --cf-bg background. Needs emulated media, which play() cannot set. Leaves forced colours off.
async function assertMosaicForcedColours(page) {
  await page.emulateMedia({ forcedColors: 'active' });
  // The Banner's logo (default ink, no band), title (yellow on blue) and rule (blue, no band).
  const [logo, title, rule] = await page.evaluate(() =>
    [...document.querySelectorAll('.cf-mosaic')].map((m) => {
      const cs = getComputedStyle(m);
      return { color: cs.color, backgroundColor: cs.backgroundColor, adjust: cs.forcedColorAdjust };
    }),
  );
  expect(logo).toEqual({ color: 'rgb(255, 255, 255)', backgroundColor: 'rgb(0, 0, 0)', adjust: 'none' });
  expect(title).toEqual({ color: 'rgb(255, 255, 0)', backgroundColor: 'rgb(0, 0, 255)', adjust: 'none' });
  expect(rule).toEqual({ color: 'rgb(0, 0, 255)', backgroundColor: 'rgb(0, 0, 0)', adjust: 'none' });
  await page.emulateMedia({ forcedColors: 'none' });
}

// The [r, g, b] of every pixel in a screenshot of `clip`, decoded in the page.
async function pixels(page, clip) {
  const png = (await page.screenshot({ clip })).toString('base64');
  return page.evaluate(async (data) => {
    const img = await createImageBitmap(await (await fetch(`data:image/png;base64,${data}`)).blob());
    const ctx = new OffscreenCanvas(img.width, img.height).getContext('2d');
    ctx.drawImage(img, 0, 0);
    const px = ctx.getImageData(0, 0, img.width, img.height).data;
    return Array.from({ length: px.length / 4 }, (_, i) => [px[4 * i], px[4 * i + 1], px[4 * i + 2]]);
  }, png);
}

// Contract (#75): inside the Screen frame mosaic cells tile with no gap, across or down. Layout
// can't show it (a glyph's ink isn't its box), so read the pixels: a screenshot of the temperature
// key's solid colour runs, decoded in the page, has no page-black pixel inside a 1px inset. Leaves
// forced colours off.
async function assertMosaicTiles(page) {
  const KEY = '.cf-mosaic[aria-label^="Temperature key"]';
  // Only the colour runs: the labels beside them are text on the page's black.
  const clip = await page.evaluate((sel) => {
    document.querySelector(sel).scrollIntoView({ block: 'center' });
    const [first, , last] = [...document.querySelectorAll(`${sel} > span`)].map((r) => r.getBoundingClientRect());
    return { x: first.left, y: first.top, width: first.width, height: last.bottom - first.top };
  }, KEY);
  const inset = { x: clip.x + 1, y: clip.y + 1, width: clip.width - 2, height: clip.height - 2 };
  expect((await pixels(page, inset)).filter((p) => Math.max(...p) < 64)).toHaveLength(0);
  // Colour runs inside a mosaic keep their own inks under forced colours too.
  const runs = (sel) => [...document.querySelectorAll(`${sel} > span`)].map((s) => getComputedStyle(s).color);
  const inks = await page.evaluate(runs, KEY);
  await page.emulateMedia({ forcedColors: 'active' });
  expect(await page.evaluate(runs, KEY)).toEqual(inks);
  await page.emulateMedia({ forcedColors: 'none' });
}

// Contract (#167): a real click on the invoker opens the dialog modally, moves focus inside it
// and stops the page scrolling; a real Esc closes it and hands focus back to the invoker, and so
// does a real click on the backdrop (closedby="any"). All native, so this proves the markup, not
// library code. Leaves the dialog closed and nothing focused.
async function assertDialogInvoker(page) {
  const state = () => {
    const dialog = document.querySelector('.cf-dialog');
    return {
      modal: dialog.matches(':modal'),
      inside: dialog.contains(document.activeElement),
      locked: getComputedStyle(document.documentElement).overflowY === 'hidden',
    };
  };
  const OPEN = { modal: true, inside: true, locked: true };
  const CLOSED = { modal: false, inside: false, locked: false };
  const onInvoker = () => document.activeElement.getAttribute('command') === 'show-modal';
  await page.click('[command="show-modal"]');
  expect(await page.evaluate(state)).toEqual(OPEN);
  await page.keyboard.press('Escape');
  expect(await page.evaluate(state)).toEqual(CLOSED);
  expect(await page.evaluate(onInvoker)).toBe(true);
  await page.click('[command="show-modal"]');
  await page.mouse.click(1, 1); // the backdrop: the dialog is centred, nowhere near the corner
  expect(await page.evaluate(state)).toEqual(CLOSED);
  expect(await page.evaluate(onInvoker)).toBe(true);
  await page.evaluate(() => document.activeElement.blur());
}

const htmlValidate = new HtmlValidate(htmlValidateConfig);

// Contract (#127): every story renders valid HTML, so markup a consumer copies from "Show
// code" validates too. Checks the rendered root after play(), so markup a story builds in JS counts.
async function assertValidHtml(page, title, name) {
  const markup = await page.$eval('#storybook-root', (root) => root.innerHTML);
  const { valid, results } = await htmlValidate.validateString(markup);
  if (valid) return;
  const problems = results[0].messages.map((m) => `  ${m.ruleId}: ${m.message} (${m.selector ?? 'document'})`);
  throw new Error(`Invalid HTML in story "${title} / ${name}":\n${problems.join('\n')}`);
}

// Contract (#130): a real Tab to a text control shows the accent ring and keeps its colours
// (no inversion while you type); typing an invalid value and leaving gives the :user-invalid
// look; every state stays visible under forced colours. Needs real keyboard input and
// emulated media, which play() cannot produce. The Field story (Components/Form/Field): a
// required email field, then a postcode with a server error. Leaves forced colours off.
async function assertFieldInput(page) {
  const rest = await page.evaluate(controlLook, '#email');
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.activeElement.id)).toBe('email');
  expect(await page.evaluate(controlLook, '#email')).toEqual({
    ...rest,
    borderColor: ACCENT,
    outline: `solid 2px ${ACCENT}`,
  });
  // Empty and required, yet untouched: not invalid. Then a bad value, and leave the field.
  expect(rest.borderWidth).toBe('2px');
  await page.keyboard.type('not-an-email');
  await page.keyboard.press('Tab');
  expect(await page.evaluate(controlLook, '#email')).toMatchObject({
    borderColor: 'rgb(255, 0, 0)',
    borderWidth: '4px',
    outline: expect.stringMatching(/^none/),
    width: rest.width,
  });
  const [invalid, focused] = await underForcedColours(page, async () => [
    await page.evaluate(controlLook, '#email'),
    await page.evaluate(controlLook, '#postcode'),
  ]);
  expect(invalid.borderWidth).toBe('4px');
  expect(focused.outline).toMatch(/^solid 2px/);
}
// Disabled stays dimmed under forced colours.
async function assertDisabledForced(page, sel) {
  const { opacity } = await underForcedColours(page, () => page.evaluate(controlLook, sel));
  expect(opacity).toBe('0.4');
}

// Forced colours would drop the drawn ▼ (a gradient background), so the select is the system's
// own, arrow and list, base-select or not.
async function assertSelectForced(page) {
  const appearance = await underForcedColours(page, () =>
    page.evaluate(() => getComputedStyle(document.querySelector('select')).appearance),
  );
  expect(appearance).toBe('auto');
}

// Contract (#140): a real click opens the list, and the arrow keys move the inversion, natively.
// Leaves the list open on the second option, so axe audits it in both themes.
async function assertSelectOpen(page) {
  // The runner's Chromium supports base-select: fail rather than skip if it ever doesn't.
  expect(await page.evaluate(() => CSS.supports('appearance', 'base-select'))).toBe(true);
  await page.click('select');
  await page.keyboard.press('ArrowDown');
  expect(
    await page.evaluate(() => [
      document.querySelector('select').matches(':open'),
      document.activeElement.textContent,
      getComputedStyle(document.activeElement).backgroundColor,
    ]),
  ).toEqual([true, 'Scotland', ACCENT]);
  // The list is exactly as wide as the select, not its longest option.
  const [list, field] = await page.evaluate(() => {
    const select = document.querySelector('select');
    return [parseFloat(getComputedStyle(select, '::picker(select)').inlineSize), select.offsetWidth];
  });
  expect(Math.abs(list - field)).toBeLessThan(1);
}

// Contract (#169): a real click on the trigger opens the popover below it (anchored, so the
// runner's Chromium must support anchor positioning), and a real Esc closes it. Reopens it,
// so axe audits its content in both themes.
async function assertPopoverOpens(page) {
  expect(await page.evaluate(() => CSS.supports('position-area', 'block-end'))).toBe(true);
  const open = () => document.querySelector('.cf-popover').matches(':popover-open');
  await page.click('.cf-btn');
  expect(await page.evaluate(open)).toBe(true);
  const [top, triggerBottom] = await page.evaluate(() => [
    document.querySelector('.cf-popover').getBoundingClientRect().top,
    document.querySelector('.cf-btn').getBoundingClientRect().bottom,
  ]);
  expect(top).toBeGreaterThanOrEqual(triggerBottom);
  await page.keyboard.press('Escape');
  expect(await page.evaluate(open)).toBe(false);
  await page.click('.cf-btn');
}

// Contract (#139): the number spinner and the search clear button are the browser's own parts,
// drawn as a ▲▼ or ✕ in the field's own colour, in the last cell of the content box. Their
// computed style can't be read (getComputedStyle ignores ::-webkit-* parts), so read the pixels,
// as rendered and under forced colours, then click them for real: the top or bottom half steps
// the number, the ✕ clears the search. One control per story. Leaves its value as rendered.
const markCell = () => {
  const control = document.querySelector('input');
  const cs = getComputedStyle(control);
  const r = control.getBoundingClientRect();
  const cell = document.createElement('span');
  cell.style.cssText = `font: ${cs.font}; inline-size: 1ch; display: inline-block`;
  control.after(cell);
  const ch = cell.getBoundingClientRect().width;
  cell.remove();
  const end = r.right - parseFloat(cs.borderRightWidth) - parseFloat(cs.paddingRight);
  const em = parseFloat(cs.fontSize);
  return { x: end - ch, y: r.top + r.height / 2 - 0.6 * em, width: ch, height: 1.2 * em, ink: cs.color };
};
// How many pixels of the mark's cell are in the field's text colour (the system's, when forced).
async function inkPixels(page) {
  const { ink, ...cell } = await page.evaluate(markCell);
  const rgb = ink.match(/\d+/g).map(Number);
  const closeTo = (p) => p.every((c, i) => Math.abs(c - rgb[i]) < 32);
  return (await pixels(page, cell)).filter(closeTo).length;
}
async function assertDrawnMark(page, name) {
  expect(await inkPixels(page)).toBeGreaterThan(4);
  expect(await underForcedColours(page, () => inkPixels(page))).toBeGreaterThan(4);
  const cell = await page.evaluate(markCell);
  const value = () => page.inputValue('input');
  const rendered = await value();
  // #171: the part is the gap and the cell, at least 24px each way (WCAG 2.2 target size), so
  // click just inside its far corners: top left steps up, bottom right steps down.
  const [w, h] = [Math.max(24, 2 * cell.width), Math.max(24, cell.height)];
  const [left, mid] = [cell.x - cell.width, cell.y + cell.height / 2];
  const clickAt = (x, dy) => page.mouse.click(left + x, mid + dy);
  if (name === 'Number') {
    await clickAt(2, 2 - h / 2);
    expect(await value()).toBe(String(+rendered + 1));
    await clickAt(w - 2, h / 2 - 2);
    expect(await value()).toBe(rendered);
  } else {
    await clickAt(2, 2 - h / 2);
    expect(await value()).toBe('');
    await page.fill('input', rendered);
  }
  await page.mouse.move(0, 0);
}

// Contract (#131, #132): a real Tab to a checkbox, drawn or a character, shows the accent ring
// and keeps its shape; a disabled one doesn't change on hover; under forced colours a checked
// box still differs from an unchecked one by its shape (a border, which the system keeps, not a
// background it drops). One checkbox per story. Leaves it as rendered, forced colours off and
// nothing hovered.
const shapeOf = (sel) => {
  const cs = getComputedStyle(document.querySelector(sel));
  return [cs.borderTopStyle, cs.borderTopWidth, cs.borderLeftWidth, cs.borderRadius].join(' ');
};
async function assertCheckboxInput(page, name) {
  const box = '.cf-checkbox';
  if (name === 'Disabled') {
    const dimmed = await page.evaluate(controlLook, box);
    await page.hover(box);
    expect(await page.evaluate(controlLook, box)).toEqual(dimmed);
    await page.mouse.move(0, 0);
    return;
  }
  const rest = await page.evaluate(controlLook, box);
  await page.keyboard.press('Tab');
  expect(await page.evaluate((sel) => document.activeElement.matches(sel), box)).toBe(true);
  expect(await page.evaluate(controlLook, box)).toEqual({ ...rest, outline: `solid 2px ${ACCENT}` });
  if (name !== 'Unchecked') return;
  const [offShape, onShape] = await underForcedColours(page, async () => {
    const off = await page.evaluate(shapeOf, box);
    await page.click(box);
    const on = await page.evaluate(shapeOf, box);
    await page.click(box);
    return [off, on];
  });
  expect(onShape).not.toBe(offShape);
}

// Contract (#131): the arrow keys move the choice in a radio group, natively. The Group story:
// BBC1 on, then BBC2, ITV. Leaves the group as rendered.
async function assertRadioKeys(page) {
  const focused = () => [document.activeElement.value, document.activeElement.checked];
  await page.keyboard.press('Tab');
  expect(await page.evaluate(focused)).toEqual(['BBC1', true]);
  await page.keyboard.press('ArrowDown');
  expect(await page.evaluate(focused)).toEqual(['BBC2', true]);
  expect(await page.evaluate(() => document.querySelector('[value="BBC1"]').checked)).toBe(false);
  await page.keyboard.press('ArrowUp');
  expect(await page.evaluate(focused)).toEqual(['BBC1', true]);
}

// Contract (#20): a real Tab focuses the reveal's summary and inverts the row, marker included;
// a real Enter opens it natively, which the accessibility tree announces as expanded, and flips
// the marker ▼ → ▲. The marker stays out of the accessible name (empty alt text). The Single
// story starts closed. Leaves it open and nothing focused.
const SUMMARY = '.cf-reveal > summary';
const marker = (sel) => {
  const after = getComputedStyle(document.querySelector(sel), '::after');
  return { marker: after.color, glyph: after.content };
};
const revealLook = async (page) => ({
  ...(await page.evaluate(colours, SUMMARY)),
  ...(await page.evaluate(marker, SUMMARY)),
});
// Chrome's own accessibility tree: Playwright's aria snapshot doesn't model <summary>.
async function disclosure(page) {
  const cdp = await page.context().newCDPSession(page);
  const { nodes } = await cdp.send('Accessibility.getFullAXTree');
  await cdp.detach();
  const node = nodes.find((n) => n.role?.value === 'DisclosureTriangle');
  return { name: node.name.value, expanded: node.properties.find((p) => p.name === 'expanded').value.value };
}

async function assertRevealKeys(page) {
  expect((await page.evaluate(marker, SUMMARY)).glyph).toContain('\u25BC');
  expect(await disclosure(page)).toEqual({ name: 'What does TAE mean?', expanded: false });
  await page.keyboard.press('Tab');
  expect(await page.evaluate((sel) => document.activeElement.matches(sel), SUMMARY)).toBe(true);
  expect(await revealLook(page)).toMatchObject({ ...INVERTED, marker: BLACK });
  await page.keyboard.press('Enter');
  expect((await disclosure(page)).expanded).toBe(true);
  expect((await page.evaluate(marker, SUMMARY)).glyph).toContain('\u25B2');
  await page.evaluate(() => document.activeElement.blur());
}

// Contract (#20): inside the Screen frame the reveal's marker is Bedstead's own ▼ glyph, not a
// fallback face's. Only Chrome's renderer knows which font drew a glyph, so this reads it over CDP.
async function assertRevealFrameMarker(page) {
  await page.evaluate(() => document.fonts.ready);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('DOM.enable');
  await cdp.send('CSS.enable');
  const { nodeId } = await cdp.send('DOM.querySelector', {
    nodeId: (await cdp.send('DOM.getDocument')).root.nodeId,
    selector: SUMMARY,
  });
  const { node } = await cdp.send('DOM.describeNode', { nodeId, depth: 0 });
  const after = node.pseudoElements.find((p) => p.pseudoType === 'after');
  const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId: after.nodeId });
  await cdp.detach();
  expect(fonts.map((f) => f.familyName)).toEqual(['Bedstead']);
}

// target-size (WCAG 2.2 AA, 24px pointer targets, #171) is off by default in axe; `aaa` also
// enables axe's AAA contrast rule — the accessible theme's promise (#12).
const axe = async (page, { aaa = false } = {}) => {
  await checkA11y(page, '#storybook-root', {
    detailedReport: true,
    detailedReportOptions: { html: true },
    axeOptions: {
      rules: { 'target-size': { enabled: true }, ...(aaa && { 'color-contrast-enhanced': { enabled: true } }) },
    },
  });
};

export default {
  async postVisit(page, context) {
    const { title, name, parameters } = await getStoryContext(page, context);
    await assertValidHtml(page, title, name);
    // Spike #193: the story names its checks; checks.ts runs them by phase. Unknown names throw.
    const named = parameters.checks ?? [];
    const run = async (phase) => {
      for (const check of runsFor(named, phase, `${title} / ${name}`)) await check(page);
    };
    await run('input');
    if (!title.startsWith('Components/') && !named.length) return;

    if (title === 'Components/Link' && name === 'Inline') await assertFocusInversion(page, '.cf-link');
    if (title === 'Components/Notice') await assertNoticeBlink(page);
    if (title === 'Components/Header row' && name === 'In the Screen frame') await assertHeaderRowNarrow(page);
    if (title === 'Components/Table' && name === 'Wide, with long text') await assertTableNarrow(page);
    if (title === 'Components/Mosaic' && name === 'Banner') await assertMosaicForcedColours(page);
    if (title === 'Components/Mosaic' && name === 'In the Screen frame') await assertMosaicTiles(page);
    if (title === 'Components/Form/Field' && name === 'Field') await assertFieldInput(page);
    if (title === 'Components/Form/Input' && name === 'Disabled') await assertDisabledForced(page, 'input');
    if (title === 'Components/Form/Input' && ['Number', 'Search'].includes(name)) await assertDrawnMark(page, name);
    if (title === 'Components/Form/Select' && name === 'Default') await assertSelectForced(page);
    if (title === 'Components/Form/Select' && name === 'Open list') await assertSelectOpen(page);
    if (title === 'Components/Form/Checkbox' && ['Unchecked', 'Character', 'Disabled'].includes(name))
      await assertCheckboxInput(page, name);
    if (title === 'Components/Form/Radio' && name === 'Group') await assertRadioKeys(page);
    if (title === 'Components/Dialog' && name === 'Closed') await assertDialogInvoker(page);
    if (title === 'Components/Reveal' && name === 'Single') await assertRevealKeys(page);
    if (title === 'Components/Reveal' && name === 'In the Screen frame') await assertRevealFrameMarker(page);
    if (title === 'Components/Popover') await assertPopoverOpens(page);

    await injectAxe(page);
    await run('axe');
    await axe(page);
    // Every contract story must also pass axe — at AAA contrast — under the accessible theme.
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'accessible'));
    await run('accessible');
    await axe(page, { aaa: true });
  },
};
