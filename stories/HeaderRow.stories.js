import { expect, within } from 'storybook/test';
import { atViewport, realInput } from './_real-input.js';

// cf-header-row (#72): the single top line of a teletext page, as broadcast:
// requested page, service, the page on air, then the consumer's static date and time.
// The only place the page number appears, so it is real text a screen reader announces.
// The story derives the visible date/time from the one `datetime` arg, so the two never
// disagree: the attribute is the machine-readable ISO value, the text is what's shown.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n) => String(n).padStart(2, '0');
const headerRow = ({ page, service, rolling, datetime, variants = {}, bands = {} }) => {
  const d = new Date(datetime);
  // data-variant and data-band on a part, when the `variants` / `bands` args name one for it.
  const v = (name) =>
    (variants[name] ? ` data-variant="${variants[name]}"` : '') + (bands[name] ? ` data-band="${bands[name]}"` : '');
  const el = document.createElement('header');
  el.className = 'cf-header-row';
  el.innerHTML =
    `<span class="cf-header-row__page"${v('page')}>${page}</span>` +
    `<span class="cf-header-row__service"${v('service')}>${service}</span>` +
    `<span class="cf-header-row__rolling"${v('rolling')}>${rolling}</span>` +
    `<time class="cf-header-row__time"${v('time')} datetime="${datetime}">` +
    `<span class="cf-header-row__date"${v('date')}>${MONTHS[d.getMonth()]}${pad(d.getDate())}</span> ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}</time>`;
  return el;
};
const part = (header, name) => header.querySelector(`.cf-header-row__${name}`);

// Contract: a <header> whose page number is visible text, and a native <time datetime>.
const assertRow = async (header, pageText) => {
  await expect(header.tagName).toBe('HEADER');
  const page = within(header).getByText(pageText);
  await expect(page.getAttribute('aria-hidden')).toBeNull();
  await expect(page.getBoundingClientRect().width).toBeGreaterThan(0);
  const time = header.querySelector('time');
  await expect(time.getAttribute('datetime')).toBeTruthy();
};
const topOf = (el) => el.getBoundingClientRect().top;
// Authentic colours via the semantic aliases: page and clock --cf-fg, service --cf-accent-2,
// on-air page and date --cf-accent, all on --cf-bg.
const assertColours = async (header) => {
  const colour = (name) => getComputedStyle(part(header, name)).color;
  await expect(getComputedStyle(header).backgroundColor).toBe('rgb(0, 0, 0)');
  await expect(colour('page')).toBe('rgb(255, 255, 255)');
  await expect(colour('service')).toBe('rgb(0, 255, 0)');
  await expect(colour('rolling')).toBe('rgb(255, 255, 0)');
  await expect(colour('date')).toBe('rgb(255, 255, 0)');
  await expect(colour('time')).toBe('rgb(255, 255, 255)');
};

export default {
  title: 'Components/Header row',
  tags: ['autodocs', 'contract'],
  parameters: { a11y: { test: 'error' } }, // in the axe gate under both themes (ADR-0006)
  render: headerRow,
  argTypes: {
    page: { control: 'text' },
    service: { control: 'text' },
    rolling: { control: 'text' },
    datetime: { control: 'text' },
    variants: { control: 'object', description: 'data-variant per part: { page, service, rolling, date, time }' },
    bands: { control: 'object', description: 'data-band per part: { page, service, rolling, date, time }' },
  },
  args: {
    page: 'P455',
    service: 'CEEFAX',
    rolling: '454',
    datetime: '2026-10-28T15:23:19',
    variants: {},
    bands: {},
  },
};

// On its own a top-level <header> is the page's banner landmark.
export const Default = {
  play: async ({ canvasElement, args }) => {
    const header = within(canvasElement).getByRole('banner');
    await assertRow(header, args.page);
    // One row, in order: page number, service, page on air, date and time.
    const parts = ['page', 'service', 'rolling', 'time'].map((n) => part(header, n));
    for (const p of parts) await expect(topOf(p)).toBe(topOf(parts[0]));
    for (let i = 1; i < parts.length; i++) {
      await expect(parts[i - 1].getBoundingClientRect().right).toBeLessThanOrEqual(
        parts[i].getBoundingClientRect().left,
      );
    }
    await expect(part(header, 'time').textContent).toBe('Oct28 15:23:19');
    // A touch larger than body text.
    await expect(parseFloat(getComputedStyle(header).fontSize)).toBeGreaterThan(
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cf-text-body')),
    );
    await assertColours(header);
    const cs = getComputedStyle(header);
    // Square and flat.
    await expect(cs.borderRadius).toBe('0px');
    await expect(cs.boxShadow).toBe('none');
    await expect(cs.backgroundImage).toBe('none');
  },
};

// Any part takes data-variant, the same colour attribute as every component: it recolours
// that part's text through the variant seam. Blue text is low-contrast on black in the authentic
// theme (~2.4:1), so it is left out here.
export const PartColours = {
  name: 'Part colours',
  args: {
    page: 'P657',
    service: 'TELETEXT',
    rolling: '657',
    datetime: '2026-07-15T15:22:58',
    variants: { page: 'cyan', service: 'yellow', rolling: 'green', date: 'magenta', time: 'yellow' },
  },
  play: async ({ canvasElement, args }) => {
    const header = within(canvasElement).getByRole('banner');
    await assertRow(header, args.page);
    const colour = (name) => getComputedStyle(part(header, name)).color;
    await expect(colour('page')).toBe('rgb(0, 255, 255)'); // --cf-variant-cyan
    await expect(colour('service')).toBe('rgb(255, 255, 0)');
    await expect(colour('rolling')).toBe('rgb(0, 255, 0)');
    await expect(colour('date')).toBe('rgb(255, 0, 255)');
    await expect(colour('time')).toBe('rgb(255, 255, 0)');
  },
};

// Bands (ADR-0017): data-band sets a part on a coloured background, data-variant beside it is
// the ink. Yellow on blue, as a broadcast service name. The Accessible theme sends the ink to
// black on its light bands, so the axe pass there still holds.
export const Banded = {
  args: {
    page: 'P657',
    service: 'Teletext',
    rolling: '657',
    datetime: '2026-07-15T15:22:58',
    variants: { service: 'yellow', time: 'yellow' },
    bands: { service: 'blue' },
  },
  play: async ({ canvasElement, args }) => {
    const header = within(canvasElement).getByRole('banner');
    await assertRow(header, args.page);
    const cs = getComputedStyle(part(header, 'service'));
    await expect(cs.backgroundColor).toBe('rgb(0, 0, 255)'); // --cf-variant-blue
    await expect(cs.color).toBe('rgb(255, 255, 0)'); // the yellow ink
    await expect(getComputedStyle(part(header, 'page')).backgroundColor).toBe('rgba(0, 0, 0, 0)'); // unbanded
  },
};

// In the page shell's header slot, on the same <header>: no wrapper element.
export const InScreenFrame = {
  name: 'In the Screen frame',
  parameters: { layout: 'fullscreen' },
  render: (args) => {
    const page = document.createElement('section');
    page.className = 'cf-page';
    page.dataset.frame = '';
    const header = headerRow(args);
    header.classList.add('cf-page__header');
    const body = document.createElement('main');
    body.className = 'cf-page__body';
    body.tabIndex = 0;
    body.style.padding = 'var(--cf-space-3)';
    body.innerHTML =
      '<h1>NEWS</h1><p>Screen titles stay ordinary headings; the page number lives in the header row.</p>';
    page.append(header, body);
    return page;
  },
  play: async ({ canvasElement, args }) => {
    const page = canvasElement.querySelector('.cf-page');
    const header = page.querySelector(':scope > header.cf-page__header.cf-header-row');
    await assertRow(header, args.page);
    await expect(topOf(part(header, 'time'))).toBe(topOf(part(header, 'page')));
    // One cell high, like the broadcast row: the frame's whole-pixel cell (40 plus a
    // one-cell margin each side), 0.6em wide.
    await expect(parseFloat(getComputedStyle(header).fontSize) * 0.6).toBeCloseTo(
      Math.floor(page.getBoundingClientRect().width / 42),
      1,
    );
    await assertColours(header);

    // Contract (#72): at phone width the row wraps inside the page shell, keeping the page
    // number visible and nothing spilling sideways. Needs a real viewport resize.
    const io = realInput();
    if (!io) return;
    await atViewport(io, 320, 640, async () => {
      const r = part(header, 'page').getBoundingClientRect();
      await expect(r.width).toBeGreaterThan(0);
      await expect(r.left).toBeGreaterThanOrEqual(0);
      await expect(r.right).toBeLessThanOrEqual(innerWidth);
      await expect(header.scrollWidth).toBeLessThanOrEqual(header.clientWidth);
    });
  },
};

// A phone-width row: the time wraps under, the page number stays first and visible.
export const Narrow = {
  render: (args) => {
    const wrap = document.createElement('div');
    wrap.style.width = '280px'; // a 320px phone minus gutters
    wrap.append(headerRow(args));
    return wrap;
  },
  play: async ({ canvasElement, args }) => {
    const wrap = canvasElement.firstElementChild;
    const header = within(canvasElement).getByRole('banner');
    await assertRow(header, args.page);
    const [page, time] = ['page', 'time'].map((n) => part(header, n));
    const box = wrap.getBoundingClientRect();
    const p = page.getBoundingClientRect();
    await expect(p.left).toBeGreaterThanOrEqual(box.left);
    await expect(p.right).toBeLessThanOrEqual(box.right);
    await expect(topOf(time)).toBeGreaterThan(topOf(page));
    await expect(header.scrollWidth).toBeLessThanOrEqual(header.clientWidth); // nothing spills sideways
  },
};
