import { expect } from '@storybook/test';
import { el } from './_demo.js';

export default {
  title: 'Layout/Screen',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The **screen frame** is not a separate element: it is the `data-frame` variant of the page shell ' +
          '(`<section class="cf-page" data-frame>`, see **Layout/Page**). Add it when you want the page to look ' +
          'like a real teletext set: a centred 4:3 box on a black canvas, type scaled to the box, header and ' +
          'footer pinned and only the body scrolling. Omit it and you get the plain full-viewport page.\n\n' +
          '- **Wide monitor:** 4:3 with side bars, so line lengths stay readable.\n' +
          '- **Below 40em (phones):** the frame is dropped and the page is full-bleed at normal type sizes.\n' +
          '- **Keyboard:** give the body `tabindex="0"` so the scroll region is reachable; `#hash` links scroll inside it.\n' +
          '- **Other ratios:** set `--cf-frame-ratio` (default `1.3333`).\n\n' +
          'Use the viewport toolbar to try it at phone and desktop widths.',
      },
    },
  },
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

// The contract markup: the page shell plus the presentational `data-frame` variant.
// The body is the scroll region, so it is made focusable.
const screen = () => {
  const page = el('section', 'cf-page');
  page.dataset.frame = '';

  const header = el('header', 'cf-page__header cf-cluster');
  header.style.cssText = 'justify-content:space-between;padding:0 var(--cf-space-3)';
  header.append(el('span', null, '100'), el('strong', null, 'CEEFAX'), el('time', null, '16:02:55'));

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
  ul.append(fastextKey('red', 'NEWS'), fastextKey('green', 'SPORT'), fastextKey('yellow', 'WEATHER'), fastextKey('blue', 'INDEX'));
  nav.append(ul);
  footer.append(nav);

  page.append(header, body, footer);
  return page;
};

// One story: use the Storybook viewport toolbar to see the frame go full-bleed below 40em.
// The narrow-viewport and accessible-theme checks run in .storybook/test-runner.js postVisit,
// which needs a real viewport resize and a theme switch that play() cannot do.
export const Frame = {
  render: screen,
  // Test-runner default viewport is wide (1280×720), so the frame is 4:3 with side bars.
  play: async ({ canvasElement }) => {
    const page = canvasElement.querySelector('.cf-page');
    const body = page.querySelector('.cf-page__body');
    const r = page.getBoundingClientRect();
    await expect(Math.abs(r.width / r.height - 4 / 3)).toBeLessThan(0.02);
    await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    const [header, footer] = ['header', 'footer'].map((t) => page.querySelector(t));
    const [h0, f0] = [header, footer].map((n) => n.getBoundingClientRect().top);
    body.scrollTop = body.scrollHeight;
    await expect(body.scrollTop).toBeGreaterThan(0);
    await expect(header.getBoundingClientRect().top).toBe(h0);
    await expect(footer.getBoundingClientRect().top).toBe(f0);
  },
};
