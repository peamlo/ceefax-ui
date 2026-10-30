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
};

// The contract markup: the page shell plus the presentational `data-frame` variant.
// The body is the scroll region, so it is made focusable.
const framedPage = () => {
  const page = el('section', 'cf-page');
  page.dataset.frame = '';

  const header = headerRow();

  const body = el('main', 'cf-page__body cf-stack');
  body.tabIndex = 0;
  body.style.padding = 'var(--cf-space-3)';
  body.append(el('h1', null, 'NEWS'));
  for (let i = 1; i <= 30; i++) {
    body.append(el('p', null, `Headline ${i} — the type scales with the frame, so lines stay the same width.`));
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
    // Type scales with the frame: body is 16px at a 1024px-wide frame.
    const cs = getComputedStyle(page);
    await expect(parseFloat(cs.fontSize)).toBeCloseTo((r.width * 16) / 1024, 1);
    await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    const [header, footer] = ['header', 'footer'].map((t) => page.querySelector(t));
    const [h0, f0] = [header, footer].map((n) => n.getBoundingClientRect().top);
    body.scrollTop = body.scrollHeight;
    await expect(body.scrollTop).toBeGreaterThan(0);
    await expect(header.getBoundingClientRect().top).toBe(h0);
    await expect(footer.getBoundingClientRect().top).toBe(f0);
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
          'Set `data-frame="crt"` instead of a bare `data-frame` for the look of a CRT set: faint scanlines, eight to a ' +
          'text row, over the whole frame and a soft glow on the text. It is still a Screen frame, so everything in ' +
          'the story above applies. Use the **crt** control to switch the look on and off.\n\n' +
          '- **Static:** no flicker, interlace or curvature (photosensitivity; curvature bends text off the grid).\n' +
          '- **Off** under `forced-colors: active` and the Accessible theme, and below 40em where the frame itself is dropped.',
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
