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
      fastextKey('blue', 'SUBTITULADO'),
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

// The contract markup: the page shell plus the presentational `data-frame` variant.
// The body is the scroll region, so it is made focusable. No inline padding: inside the
// frame a row is 40 cells edge to edge, as on a set.
const framedPage = () => {
  const page = el('section', 'cf-page');
  page.dataset.frame = '';

  const header = headerRow();

  const body = el('main', 'cf-page__body cf-stack');
  body.tabIndex = 0;
  body.style.paddingBlock = 'var(--cf-space-3)';
  body.append(el('h1', null, 'NEWS'));
  // A 40-character row: it exactly fills the body's width, so text wraps at 40.
  body.append(el('p', null, '<span>0123456789012345678901234567890123456789</span>'));
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
    fastextKey('blue', 'INDEX'),
  );
  nav.append(ul);
  footer.append(nav);

  page.append(header, body, footer);
  return page;
};

// A 40-character line fills its row: it never overflows (so it never wraps at 39), and it
// falls short by under 1px per cell, the whole-pixel snap that keeps glyph advances exact.
const expectRowFills = async (row) => {
  const span = row.querySelector('span').getBoundingClientRect().width;
  const width = row.getBoundingClientRect().width;
  await expect(span).toBeLessThanOrEqual(width + 0.01);
  await expect(width - span).toBeLessThan(40);
  await expect(span / 40).toBeCloseTo(Math.round(span / 40), 2);
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
          '- **Below 40em (phones):** the frame is dropped and the page is full-bleed at normal type sizes.\n' +
          '- **Keyboard:** give the body `tabindex="0"` so the scroll region is reachable; `#hash` links scroll inside it.\n' +
          '- **Other ratios:** set `--cf-frame-ratio` (default `1.3333`).\n\n' +
          'Use the viewport toolbar to try it at phone and desktop widths.',
      },
    },
  },
  render: framedPage,
  // Test-runner default viewport is wide (1280×720), so the frame is 4:3 with side bars.
  play: async ({ canvasElement }) => {
    const page = canvasElement.querySelector('.cf-page');
    const body = page.querySelector('.cf-page__body');
    const r = page.getBoundingClientRect();
    await expect(Math.abs(r.width / r.height - 4 / 3)).toBeLessThan(0.02);
    // Never wider than its container (no sideways scroll, in Docs too).
    await expect(r.width).toBeLessThanOrEqual(page.parentElement.clientWidth);
    // 40 cells plus a one-cell margin each side (whole-pixel cells): a Bedstead cell is 0.6em.
    const footer = page.querySelector('footer');
    await expect(parseFloat(getComputedStyle(footer).fontSize) * 0.6).toBeCloseTo(Math.floor(r.width / 42), 1);
    // A 40-character line fills the body's row (measured inside any scrollbar), one cell
    // high, set in Bedstead.
    const row = body.querySelector('p > span').parentElement;
    const cs = getComputedStyle(row);
    await expectRowFills(row);
    await expect(body.scrollWidth).toBe(body.clientWidth); // nothing spills sideways
    await expect(row.getBoundingClientRect().height).toBeCloseTo(parseFloat(cs.fontSize), 0);
    await expect(cs.fontFamily).toMatch(/^"?Bedstead/);
    const fastext = page.querySelector('.cf-fastext');
    await expect(fastext.scrollWidth).toBeLessThanOrEqual(fastext.clientWidth);
    // Only the authentic eight: the off-palette aliases snap to blue and green.
    const [dim, bg2] = [...body.querySelectorAll('span[style]')].map((n) => getComputedStyle(n));
    await expect(dim.color).toBe('rgb(0, 255, 0)');
    await expect(bg2.backgroundColor).toBe('rgb(0, 0, 255)');
    await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    // Header, body and footer start on the same column, one cell in.
    const header = page.querySelector('header');
    const lefts = [header.firstElementChild, row.firstChild, footer.querySelector('li')].map(
      (n) => n.getBoundingClientRect().left - r.left,
    );
    for (const left of lefts) await expect(left).toBeCloseTo(lefts[0], 0);
    const [h0, f0] = [header, footer].map((n) => n.getBoundingClientRect().top);
    body.scrollTop = body.scrollHeight;
    await expect(body.scrollTop).toBeGreaterThan(0);
    await expect(header.getBoundingClientRect().top).toBe(h0);
    await expect(footer.getBoundingClientRect().top).toBe(f0);
  },
};
