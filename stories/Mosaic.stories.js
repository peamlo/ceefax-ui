import { expect, within } from 'storybook/test';

// cf-mosaic (#75, ADR-0020): teletext mosaics written as characters. Each story's markup is what a
// consumer writes; the glyphs are literal (draw them in the zxnet editor; the README has the
// cell → code point formula).
const HEART = '🬻🬺█🬓\n🬁🬬🬆 ';
const HEART_SEPARATED = '𜺎𜺍𜺏𜹤\n𜹒𜹿𜹗 ';
const RULE = '🬋'.repeat(40); // the middle row of every cell
const RULE_SEPARATED = '𜹜'.repeat(40);
// 1 cell = 4%, ▌ for a half.
const VOTES = [
  ['LAB', 34, 'red'],
  ['CON', 24, 'blue'],
  ['LIB', 14, 'yellow'],
  ['GRN', 7, 'green'],
];
const bar = (v) => '█'.repeat(Math.floor(v / 4)) + (v % 4 >= 2 ? '▌' : '');

const ADVANCE = 0.6; // a Bedstead cell is 0.6em wide

const page = (html) => {
  const el = document.createElement('div');
  el.className = 'cf-page';
  el.style.padding = 'var(--cf-space-3)';
  el.innerHTML = html;
  return el;
};
const mosaics = (root) => [...root.querySelectorAll('.cf-mosaic')];
const fontsLoaded = () =>
  Promise.all([document.fonts.load('16px "Bedstead Mosaic"', '█𜺏'), document.fonts.load('16px "Bedstead Cell"')]);
// Every glyph a mosaic draws comes from Bedstead (no tofu): each cell is exactly one advance wide.
const assertCells = async (el, cols) => {
  const size = parseFloat(getComputedStyle(el).fontSize);
  await expect(el.getBoundingClientRect().width).toBeCloseTo(cols * size * ADVANCE, 0);
};

export default {
  title: 'Components/Mosaic',
  tags: ['autodocs'],
};

// Banner caps on a heading's row. The middle run is a mosaic too: its letters fall back to
// Bedstead, so text and mosaics share one band, ink beside the band as ADR-0017 says. The caps are
// decorative and hidden; the heading's name is its text.
export const Banner = {
  render: () =>
    page(
      '<h2>' +
        '<span class="cf-mosaic" aria-hidden="true" data-variant="blue">🬷</span>' +
        '<span class="cf-mosaic" data-band="blue" data-variant="yellow"> WEATHER </span>' +
        '<span class="cf-mosaic" aria-hidden="true" data-variant="blue">🬲</span>' +
        '</h2>',
    ),
  play: async ({ canvasElement }) => {
    await fontsLoaded();
    const heading = within(canvasElement).getByRole('heading', { name: 'WEATHER' });
    const [left, band, right] = mosaics(heading);
    await expect(left.getAttribute('aria-hidden')).toBe('true');
    await expect(right.getAttribute('aria-hidden')).toBe('true');
    // One row: the caps sit on the text's line, edge to edge with the band.
    await expect(left.getBoundingClientRect().top).toBeCloseTo(band.getBoundingClientRect().top, 1);
    await expect(left.getBoundingClientRect().right).toBeCloseTo(band.getBoundingClientRect().left, 1);
    await assertCells(left, 1);
    // Ink and band through the variant seam.
    await expect(getComputedStyle(left).color).toBe('rgb(0, 0, 255)');
    await expect(getComputedStyle(band).backgroundColor).toBe('rgb(0, 0, 255)');
    await expect(getComputedStyle(band).color).toBe('rgb(255, 255, 0)');
    // Mosaics block while the font loads (blank, never tofu); text keeps swap.
    const faces = [...document.fonts].filter((f) => f.family.replace(/"/g, '').startsWith('Bedstead'));
    const mosaic = faces.filter((f) => f.family.includes('Mosaic'));
    await expect(mosaic.map((f) => [f.display, f.unicodeRange])).toEqual([
      ['block', 'U+2580-259F, U+1FB00-1FB3B, U+1CE51-1CE8F'],
    ]);
    await expect(faces.filter((f) => !mosaic.includes(f)).every((f) => f.display === 'swap')).toBe(true);
  },
};

// A rule on a line of its own goes in a <div>, not a <p>: a hidden mosaic would leave an empty
// paragraph in the accessibility tree.
export const Rule = {
  render: () =>
    page(
      '<p>Above the rule.</p>' +
        `<div><span class="cf-mosaic" aria-hidden="true" data-variant="yellow">${RULE}</span></div>` +
        '<p>Below the rule.</p>',
    ),
  play: async ({ canvasElement }) => {
    await fontsLoaded();
    const [rule] = mosaics(canvasElement);
    await expect(rule.getAttribute('aria-hidden')).toBe('true');
    await expect(rule.parentElement.tagName).toBe('DIV');
    await expect(getComputedStyle(rule).color).toBe('rgb(255, 255, 0)');
    await assertCells(rule, 40);
  },
};

// A mosaic that means something is an image with a name. Rows are newlines; the picture keeps
// its shape beside the text that follows it.
export const Picture = {
  render: () =>
    page(
      `<p><span class="cf-mosaic" role="img" aria-label="A red heart" data-variant="red">${HEART}</span>` +
        ' Valentine’s Day: page 520</p>',
    ),
  play: async ({ canvasElement }) => {
    await fontsLoaded();
    const heart = within(canvasElement).getByRole('img', { name: 'A red heart' });
    await expect(heart.getAttribute('aria-hidden')).toBeNull();
    await expect(getComputedStyle(heart).color).toBe('rgb(255, 0, 0)');
    await assertCells(heart, 4);
    // Two rows, one em each.
    const size = parseFloat(getComputedStyle(heart).fontSize);
    await expect(heart.getBoundingClientRect().height).toBeCloseTo(2 * size, 0);
  },
};

// The bars are decorative; the figures stay text, so a screen reader hears "LAB 34%".
export const BarChart = {
  render: () =>
    page(
      '<h3>VOTE SHARE</h3>' +
        VOTES.map(
          ([party, v, colour]) =>
            `<p>${party} <span class="cf-mosaic" aria-hidden="true" data-variant="${colour}">${bar(v)}</span> ${v}%</p>`,
        ).join(''),
    ),
  play: async ({ canvasElement }) => {
    const rows = [...canvasElement.querySelectorAll('p')];
    await expect(rows.length).toBe(VOTES.length);
    for (const [i, [party, v]] of VOTES.entries()) {
      const [m] = mosaics(rows[i]);
      await expect(m.getAttribute('aria-hidden')).toBe('true');
      // The text a screen reader reads: the row without its hidden bar.
      const spoken = [...rows[i].childNodes]
        .filter((n) => n !== m)
        .map((n) => n.textContent)
        .join('')
        .replace(/\s+/g, ' ');
      await expect(spoken).toBe(`${party} ${v}%`);
    }
  },
};

// data-mosaic="separated": the same cells with a gutter round each block, from the Unicode 16
// separated mosaics (U+1CE51–1CE8F), drawn by Bedstead like the contiguous ones.
export const Separated = {
  render: () =>
    page(
      `<p><span class="cf-mosaic" data-mosaic="separated" role="img" aria-label="A red heart" data-variant="red">${HEART_SEPARATED}</span></p>` +
        `<div><span class="cf-mosaic" data-mosaic="separated" aria-hidden="true" data-variant="cyan">${RULE_SEPARATED}</span></div>`,
    ),
  play: async ({ canvasElement }) => {
    await fontsLoaded();
    const [heart, rule] = mosaics(canvasElement);
    for (const m of [heart, rule]) {
      await expect(m.dataset.mosaic).toBe('separated');
      const cells = [...m.textContent].filter((c) => c !== ' ' && c !== '\n');
      await expect(cells.every((c) => c.codePointAt(0) >= 0x1ce51 && c.codePointAt(0) <= 0x1ce8f)).toBe(true);
      await expect(document.fonts.check(`16px "Bedstead Mosaic"`, m.textContent)).toBe(true);
    }
    await assertCells(heart, 4);
    await assertCells(rule, 40);
  },
};

// Inside the Screen frame a mosaic sits on the cell grid: a flag drawn on whole cells, one colour
// run per row, with text beside it. Cells tile edge to edge, across and down.
const FLAG = [
  ['red', '██████'],
  ['yellow', '██████'],
  ['green', '██████'],
];
export const InTheScreenFrame = {
  name: 'In the Screen frame',
  render: () => {
    const section = document.createElement('section');
    section.className = 'cf-page';
    section.dataset.frame = '';
    section.innerHTML =
      '<main class="cf-page__body" tabindex="0">' +
      '<p><span class="cf-mosaic" role="img" aria-label="A red, yellow and green flag">' +
      FLAG.map(([c, cells]) => `<span data-variant="${c}">${cells}</span>`).join('\n') +
      '</span> FLAGS</p>' +
      '</main>';
    return section;
  },
  play: async ({ canvasElement }) => {
    await fontsLoaded();
    const flag = within(canvasElement).getByRole('img', { name: 'A red, yellow and green flag' });
    const runs = [...flag.children].map((r) => r.getBoundingClientRect());
    const size = parseFloat(getComputedStyle(flag).fontSize);
    // The frame's cell: a whole pixel, 40 across the body's content box.
    const body = canvasElement.querySelector('.cf-page__body');
    const { paddingLeft, paddingRight } = getComputedStyle(body);
    const content = body.clientWidth - parseFloat(paddingLeft) - parseFloat(paddingRight);
    await expect(size * ADVANCE).toBeCloseTo(Math.floor(content / 40), 1);
    // Across: six cells. Down: one row per em, and a glyph fills its em, so rows meet. That the
    // painted pixels leave no gap is checked on a screenshot in .storybook/test-runner.js postVisit.
    for (const r of runs) await expect(r.width).toBeCloseTo(6 * size * ADVANCE, 1);
    for (let i = 1; i < runs.length; i++) await expect(runs[i].top - runs[i - 1].top).toBeCloseTo(size, 1);
    await expect(flag.getBoundingClientRect().height).toBeCloseTo(3 * size, 1);
    await expect(runs.map((_, i) => getComputedStyle(flag.children[i]).color)).toEqual([
      'rgb(255, 0, 0)',
      'rgb(255, 255, 0)',
      'rgb(0, 255, 0)',
    ]);
  },
};
