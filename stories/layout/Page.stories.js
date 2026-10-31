import { expect } from 'storybook/test';
import { el } from './_demo.js';

export default {
  title: 'Layout/Page',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The **page shell**: `cf-page` with `cf-page__header` / `__body` / `__footer` slots stacks a teletext page ' +
          'into three bands. Use it for any page that wants a pinned masthead and fastext footer. It fills the ' +
          'viewport at whatever aspect ratio the window has. To sit it in a 4:3 TV screen instead, add ' +
          '`data-frame` — see the **Screen frame** story.',
      },
    },
  },
};

const card = (variant, title, body) => {
  const a = el('article', 'cf-card');
  if (variant) a.dataset.variant = variant;
  a.innerHTML = '<h3 class="cf-card__title">' + title + '</h3>' + '<p class="cf-card__body">' + body + '</p>';
  return a;
};

const fastextKey = (variant, label) => {
  const li = document.createElement('li');
  const a = el('a', 'cf-fastext__key');
  a.dataset.variant = variant;
  a.href = '#';
  a.textContent = label; // colour is never the sole cue
  li.append(a);
  return li;
};

// The page shell's header slot carries the header row on the same <header>, no wrapper.
const headerRow = () =>
  el(
    'header',
    'cf-page__header cf-header-row',
    '<span class="cf-header-row__page">P100</span>' +
      '<span class="cf-header-row__service">CEEFAX</span>' +
      '<span class="cf-header-row__rolling">100</span>' +
      '<time class="cf-header-row__time" datetime="2026-10-28T16:02:55"><span class="cf-header-row__date">Oct28</span> 16:02:55</time>',
  );

// The teletext page: cf-page shell (header band / grid body / fastext footer),
// composed only from library classes on real landmark elements.
export const TeletextPage = {
  render: () => {
    const page = el('section', 'cf-page');

    // Header band — the header row: page number, service, rolling page number, date and time.
    const header = headerRow();

    // Body — the two-page grid of index cards.
    const body = el('main', 'cf-page__body cf-grid');
    body.dataset.cols = '2';
    body.dataset.gap = '3';
    body.style.padding = 'var(--cf-space-3)';
    body.append(
      card('red', 'NOTICIAS', 'Nacional 102 · Internacional 120 · Deportes 135'),
      card('green', 'DEPORTES', 'Fútbol 201 · Motor 230 · Tenis 240'),
      card('yellow', 'SERVICIOS', 'El Tiempo 301 · Tráfico 600 · Sorteos 460'),
      card('cyan', 'ACCESIBILIDAD', 'Subtitulados 875 · Gaceta 800'),
    );

    // Footer band — the fastext remote keys.
    const footer = el('footer', 'cf-page__footer');
    const nav = el('nav');
    nav.setAttribute('aria-label', 'Fastext');
    const ul = el('ul', 'cf-fastext');
    ul.append(
      fastextKey('red', 'NOTICIAS'),
      fastextKey('green', 'DEPORTES'),
      fastextKey('yellow', 'SERVICIOS'),
      fastextKey('cyan', 'SUBTITULADO'),
    );
    nav.append(ul);
    footer.append(nav);

    page.append(header, body, footer);
    return page;
  },
  // Outside the Screen frame body text stays Space Mono: the grid and Bedstead are the frame's.
  play: async ({ canvasElement }) => {
    const body = canvasElement.querySelector('.cf-card__body');
    await expect(getComputedStyle(body).fontFamily).toMatch(/^"?Space Mono/);
  },
};

// The contract markup: the page shell plus the presentational `data-frame` variant, and
// `data-cells` for the denser 60- and 80-cell grids (40, the default, needs no attribute).
// The body is the scroll region, so it is made focusable.
const ruler = (cells) => '0123456789'.repeat(cells / 10);
const framedPage = ({ cells = 40 } = {}) => {
  const page = el('section', 'cf-page');
  page.dataset.frame = '';
  if (cells !== 40) page.dataset.cells = String(cells);

  const header = headerRow();

  const body = el('main', 'cf-page__body cf-stack');
  body.tabIndex = 0;
  body.style.paddingBlock = 'var(--cf-space-3)';
  body.append(el('h1', null, 'NEWS'));
  // A full row of characters: it fills the body's width, so text wraps at the grid's count.
  body.append(el('p', null, `<span>${ruler(cells)}</span>`));
  // The two off-palette aliases, snapped to authentic blue and green inside the frame.
  body.append(
    el(
      'p',
      null,
      '<span style="color:var(--cf-fg-dim)">Updated 16:02</span> ' +
        '<span style="background:var(--cf-bg-2)">Secondary background</span>',
    ),
  );
  for (let i = 1; i <= 30; i++) {
    body.append(el('p', null, `Headline ${i}: forty cells to a row, as on a set.`));
  }
  const end = el('p', null, 'End of page');
  end.id = 'end';
  body.append(end, el('a', 'cf-link', 'Back to end'));
  body.lastChild.href = '#end';

  const footer = el('footer', 'cf-page__footer');
  const nav = el('nav');
  nav.setAttribute('aria-label', 'Fastext');
  const ul = el('ul', 'cf-fastext');
  ul.append(
    fastextKey('red', 'NEWS'),
    fastextKey('green', 'SPORT'),
    fastextKey('yellow', 'WEATHER'),
    fastextKey('cyan', 'INDEX'),
  );
  nav.append(ul);
  footer.append(nav);

  page.append(header, body, footer);
  return page;
};

// A full row of characters fills its row: it never overflows (so it never wraps one short),
// and it falls short by under 1px per cell, the whole-pixel snap that keeps glyph advances exact.
const expectRowFills = async (row, cells) => {
  const span = row.querySelector('span').getBoundingClientRect().width;
  const width = row.getBoundingClientRect().width;
  await expect(span).toBeLessThanOrEqual(width + 0.01);
  await expect(width - span).toBeLessThan(cells);
  await expect(span / cells).toBeCloseTo(Math.round(span / cells), 2);
};

// The grid at `cells` to a row: cells plus a one-cell margin each side across the frame
// (whole-pixel cells, a Bedstead cell is 0.6em), a full row fills the body, and header,
// body and footer start on the same column, one cell in.
const expectGrid = async (page, cells) => {
  const r = page.getBoundingClientRect();
  const [header, footer] = ['header', 'footer'].map((t) => page.querySelector(t));
  const row = page.querySelector('.cf-page__body p > span').parentElement;
  await expect(parseFloat(getComputedStyle(footer).fontSize) * 0.6).toBeCloseTo(Math.floor(r.width / (cells + 2)), 1);
  await expectRowFills(row, cells);
  const lefts = [header.firstElementChild, row.firstChild, footer.querySelector('li')].map(
    (n) => n.getBoundingClientRect().left - r.left,
  );
  for (const left of lefts) await expect(left).toBeCloseTo(lefts[0], 0);
};

// Use the Storybook viewport toolbar to see the frame go full-bleed below 40em.
// The narrow-viewport and accessible-theme checks run in .storybook/test-runner.js postVisit,
// which needs a real viewport resize and a theme switch that play() cannot do.
export const Framed = {
  name: 'Screen frame (data-frame)',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'Add `data-frame` to the page shell (`<section class="cf-page" data-frame>`) to make it look like a real ' +
          'teletext set: a centred 4:3 box on a black canvas, type scaled to the box, header and footer pinned and ' +
          'only the body scrolling. Omit it and you get the plain full-viewport page above.\n\n' +
          '- **Wide monitor:** 4:3 with side bars, so line lengths stay readable.\n' +
          '- **40 cells to a row:** inside the frame the type is sized so 40 Bedstead cells fill the width of the ' +
          'body (inside its scrollbar, if it has one), every line is one cell high, and only the eight authentic ' +
          'colours appear (unless the Accessible theme applies, which wins: toolbar → Theme).\n' +
          '- **Grid size:** `data-cells="60"` or `"80"` for a denser, terminal-like grid (the `cells` control); ' +
          '`--cf-frame-cells` takes any count.\n' +
          '- **Below 40em (phones):** the frame is dropped and the page is full-bleed at normal type sizes.\n' +
          '- **Keyboard:** give the body `tabindex="0"` so the scroll region is reachable; `#hash` links scroll inside it.\n' +
          '- **Other ratios:** set `--cf-frame-ratio` (default `1.3333`).\n\n' +
          'Use the viewport toolbar to try it at phone and desktop widths.',
      },
    },
  },
  args: { cells: 40 },
  argTypes: {
    cells: {
      control: 'inline-radio',
      options: [40, 60, 80],
      description: 'Cells to a row: `data-cells` (40, the default, needs no attribute)',
    },
  },
  render: framedPage,
  // Test-runner default viewport is wide (1280×720), so the frame is 4:3 with side bars.
  play: async ({ canvasElement, args }) => {
    await document.fonts.load("1em 'Bedstead Cell'"); // measure Bedstead, not the fallback monospace
    const page = canvasElement.querySelector('.cf-page');
    const body = page.querySelector('.cf-page__body');
    const r = page.getBoundingClientRect();
    await expect(Math.abs(r.width / r.height - 4 / 3)).toBeLessThan(0.02);
    // Never wider than its container (no sideways scroll, in Docs too).
    await expect(r.width).toBeLessThanOrEqual(page.parentElement.clientWidth);
    await expectGrid(page, args.cells);
    // Each line is one cell high, set in Bedstead, and nothing spills sideways.
    const row = body.querySelector('p > span').parentElement;
    const cs = getComputedStyle(row);
    await expect(body.scrollWidth).toBe(body.clientWidth);
    await expect(row.getBoundingClientRect().height).toBeCloseTo(parseFloat(cs.fontSize), 0);
    await expect(cs.fontFamily).toMatch(/^"?Bedstead/);
    const fastext = page.querySelector('.cf-fastext');
    await expect(fastext.scrollWidth).toBeLessThanOrEqual(fastext.clientWidth);
    // Only the authentic eight: the off-palette aliases snap to blue and green.
    const [dim, bg2] = [...body.querySelectorAll('span[style]')].map((n) => getComputedStyle(n));
    await expect(dim.color).toBe('rgb(0, 255, 0)');
    await expect(bg2.backgroundColor).toBe('rgb(0, 0, 255)');
    // The other grid sizes: data-cells="60" and "80", and the --cf-frame-cells escape hatch. Restored after.
    const span = row.querySelector('span');
    for (const [cells, set] of [
      [60, () => (page.dataset.cells = '60')],
      [80, () => (page.dataset.cells = '80')],
      [50, () => page.style.setProperty('--cf-frame-cells', '50')],
    ]) {
      set();
      span.textContent = ruler(cells);
      await expectGrid(page, cells);
      delete page.dataset.cells;
      page.style.removeProperty('--cf-frame-cells');
    }
    if (args.cells !== 40) page.dataset.cells = String(args.cells);
    span.textContent = ruler(args.cells);
    // Only the body scrolls; header and footer stay pinned.
    await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    const [header, footer] = ['header', 'footer'].map((t) => page.querySelector(t));
    const [h0, f0] = [header, footer].map((n) => n.getBoundingClientRect().top);
    body.scrollTop = body.scrollHeight;
    await expect(body.scrollTop).toBeGreaterThan(0);
    await expect(header.getBoundingClientRect().top).toBe(h0);
    await expect(footer.getBoundingClientRect().top).toBe(f0);
  },
};

// A table region in an overfull frame body (#125): the body is a cf-stack, and a flex item with
// overflow-x: auto has no automatic minimum height, so it used to shrink to 0px and vanish.
export const FramedTable = {
  name: 'Screen frame, with a table',
  parameters: { layout: 'fullscreen' },
  render: () => {
    const page = framedPage();
    const region = el(
      'div',
      'cf-table__scroll',
      '<table class="cf-table" data-stripe-rows="text"><caption id="listings">BBC ONE TONIGHT</caption><tbody>' +
        '<tr><td>18:00</td><td>BBC News</td></tr><tr><td>18:30</td><td>Regional News</td></tr>' +
        '<tr><td>19:00</td><td>The One Show</td></tr><tr><td>19:30</td><td>EastEnders</td></tr></tbody></table>',
    );
    region.setAttribute('role', 'region');
    region.tabIndex = 0;
    region.setAttribute('aria-labelledby', 'listings');
    page.querySelector('.cf-page__body h1').after(region);
    return page;
  },
  play: async ({ canvasElement }) => {
    const body = canvasElement.querySelector('.cf-page__body');
    const region = body.querySelector('.cf-table__scroll');
    await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight); // overfull: the body scrolls
    const table = region.querySelector('table').getBoundingClientRect().height;
    await expect(table).toBeGreaterThan(0);
    await expect(region.getBoundingClientRect().height).toBeCloseTo(table, 0);
  },
};

// The CRT look: the same Screen frame with `data-frame="crt"`. Its off-switches (forced colours,
// Accessible theme) are asserted in .storybook/test-runner.js postVisit: play() can't emulate media.
export const CrtFramed = {
  name: 'Screen frame, CRT look (data-frame="crt")',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'Set `data-frame="crt"` instead of a bare `data-frame` for the look of a CRT set: faint scanlines, twelve to a ' +
          'cell row, over the whole frame and a soft glow on the text. It is still a Screen frame, so everything in ' +
          'the story above applies. Use the **crt** control to switch the look on and off.\n\n' +
          '- **Static:** no flicker, interlace or curvature (photosensitivity; curvature bends text off the grid).\n' +
          '- **Off** under `forced-colors: active` and the Accessible theme, and below 40em where the frame itself is dropped.\n' +
          '- **Not AA everywhere:** on the rows the scanlines darken, red on black (the NEWS key) drops to ~3.5:1 and magenta to ~4.3:1. ' +
          'That is the accepted price of the look (ADR-0014), so it is never on by default: a page that must meet AA ' +
          'leaves `crt` off or uses the Accessible theme.',
      },
    },
  },
  args: { crt: true },
  argTypes: { crt: { control: 'boolean', description: 'Toggle `data-frame="crt"` against a bare `data-frame`' } },
  render: ({ crt }) => {
    const page = framedPage();
    page.dataset.frame = crt ? 'crt' : '';
    return page;
  },
  play: async ({ canvasElement, args }) => {
    if (!args.crt) return; // the CRT assertions are for the look switched on (the default)
    const page = canvasElement.querySelector('.cf-page');
    const r = page.getBoundingClientRect();
    await expect(Math.abs(r.width / r.height - 4 / 3)).toBeLessThan(0.02); // still a Screen frame
    const after = getComputedStyle(page, '::after');
    await expect(after.backgroundImage).toContain('repeating-linear-gradient');
    await expect(after.height).toBe(getComputedStyle(page).height);
    const glow = (sel) => getComputedStyle(page.querySelector(sel)).textShadow;
    await expect(glow('p')).not.toBe('none');
    // Each text glows in its own colour: the green service name's glow isn't the white body's.
    await expect(glow('.cf-header-row__service')).not.toBe(glow('p'));
    // A bare data-frame is unchanged: no overlay, no glow.
    page.dataset.frame = '';
    await expect(getComputedStyle(page, '::after').content).toBe('none');
    await expect(glow('p')).toBe('none');
    page.dataset.frame = 'crt';
  },
};
