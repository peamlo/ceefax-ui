import { expect, within } from 'storybook/test';
import { ART, COLOURS, RULES, cell, lettering, logo, rule, toMosaic } from './_mosaic.js';

// cf-mosaic (#75, ADR-0020): teletext mosaics written as characters. Every story renders from its
// args, so the controls change the art, colours and contiguous/separated look; the rendered markup
// (Show code) is what a consumer writes. The art is built from pixel rows in ./_mosaic.js.
const ADVANCE = 0.6; // a Bedstead cell is 0.6em wide
const colour = { control: 'select', options: ['', ...COLOURS] };
const attr = (name, value) => (value ? ` ${name}="${value}"` : '');
// The mosaic's attributes: a label makes it an image with a name, no label hides it.
const a11y = (label) => (label ? ` role="img" aria-label="${label}"` : ' aria-hidden="true"');
const sep = (separated) => (separated ? ' data-mosaic="separated"' : '');

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
// Every glyph a mosaic draws comes from Bedstead (no tofu): each cell is one advance wide. Some
// platforms (Linux Chromium) round a fractional advance to a whole pixel, so allow half a pixel a
// cell; a fallback glyph is several pixels off.
const assertCells = async (el, cols) => {
  const size = parseFloat(getComputedStyle(el).fontSize);
  const off = Math.abs(el.getBoundingClientRect().width - cols * size * ADVANCE);
  await expect(off).toBeLessThanOrEqual(cols * 0.5);
};
const assertSeparated = async (el, separated) => {
  const cells = [...el.textContent].filter((c) => c !== ' ' && c !== '\n').map((c) => c.codePointAt(0));
  await expect(cells.every((c) => (c >= 0x1ce51 && c <= 0x1ce8f) === separated)).toBe(true);
};

// The banner, after Ceefax's page 100: letters cut out of white blocks, a title in mosaic
// lettering on a band, a strapline in text and a dotted rule. The logo and title are images with
// names; the rule is decorative.
const banner = ({ logo: letters, title, ink, band, strapline, ruleColour, separated }) =>
  '<header>' +
  '<div class="cf-cluster" data-gap="1" data-align="end">' +
  `<span class="cf-mosaic"${sep(separated)} role="img" aria-label="${letters}">${toMosaic(logo(letters), separated)}</span>` +
  `<span class="cf-mosaic"${sep(separated)} role="img" aria-label="${title}"${attr('data-band', band)}${attr('data-variant', ink)}>${toMosaic(lettering(title), separated)}</span>` +
  '</div>' +
  `<p>${strapline}</p>` +
  `<div><span class="cf-mosaic" data-mosaic="separated" aria-hidden="true"${attr('data-variant', ruleColour)}>${rule('middle', 40, true)}</span></div>` +
  '</header>';

// The docs page: how mosaics work, end to end. Markdown, rendered above the stories.
const DOCS = `
\`cf-mosaic\` draws teletext graphics as **text**: banners, rules, logo blocks, charts and pictures that sit on
the same row as the words around them, as on a real set. It is one class on a \`<span>\` and needs no JavaScript.
The characters you write are the picture; the class only sets the font, the colours and the cell grid.

### How a character becomes a picture

Every mosaic character fills one **cell**, split into 2 × 3 **blocks**. Each block has a value, and a cell's
character is the sum of its lit blocks (1–63; a space is an empty cell):

| | left | right |
| --- | --- | --- |
| top | 1 | 2 |
| middle | 4 | 8 |
| bottom | 16 | 32 |

The heart in **Picture** is 8 × 6 blocks, so 4 cells across and 2 rows down. A newline inside the mosaic starts
the next row:

\`\`\`text
pixels      cell sums
.##.##..    62  61  63  20
#######.
#######.
.#####..     2  47   7   0
..###...
...#....
\`\`\`

Those sums are the characters <span class="cf-mosaic" style="font-family: 'Bedstead Mosaic', monospace">🬻🬺█🬓</span> on the first row and
<span class="cf-mosaic" style="font-family: 'Bedstead Mosaic', monospace">🬁🬬🬆</span> and a space on the second.
The first cell has every block lit but the top-left one: 2 + 4 + 8 + 16 + 32 = 62.

### Code points

- **Contiguous** (blocks touch, the default): \`U+1FB00 + sum − 1\`. Unicode encodes three cells as older block
  elements, so they are skipped: \`▌\` (21), \`▐\` (42) and \`█\` (63). Above 21 subtract one more, above 42 another:
  62 → U+1FB3B <span class="cf-mosaic" style="font-family: 'Bedstead Mosaic', monospace">🬻</span>.
- **Separated** (each block inset by a gutter): \`U+1CE51 + sum − 1\`, no exceptions, and mark the mosaic
  \`data-mosaic="separated"\`. The characters carry the look; the attribute names it.
- Bedstead also has a private-use copy of every mosaic at U+EE00–EE7F, in the layout ZVBI-based tools use. It
  renders the same; write the standard code points so the text means something outside this font.

Don't type them by hand: draw in the [zxnet teletext editor](https://zxnet.co.uk/teletext/editor/) and paste
the characters. It paints with teletext's own rules. These stories build their art in code
(\`stories/_mosaic.js\`), so the controls can change it.

### Colour: two per cell

As on a set, a cell has an **ink** and a **background**: \`data-variant\` names the ink and \`data-band\` the
background, on the mosaic or on a \`<span>\` inside it for each colour run. A banded run names its ink beside its
band, and follows the band rules (ADR-0017): under the Accessible theme its ink turns black, so shapes keep their
contrast. A picture that needs three colours in one cell must be redrawn on whole cells, as teletext artists did.
Letters inside a mosaic fall back to Bedstead, so text can share a mosaic's row or band (the temperature key in
**In the Screen frame**).

### Accessibility

- A screen reader would read every mosaic character by its Unicode name, so **most mosaics are hidden**:
  \`aria-hidden="true"\`.
- A mosaic that means something is an image with a name: \`role="img"\` and an \`aria-label\` (the Banner's logo
  and title, the heart).
- In a chart, hide the bars and keep the figures as text (**Bar chart**): a screen reader hears "LAB 34%".
- A rule on a line of its own goes in a \`<div>\`, not a \`<p>\`, or an empty paragraph is left behind.
- Under **forced colours** a mosaic is treated as a picture: it keeps its colours on its own \`--cf-bg\`
  background, where text around it takes the system colours.

### Font loading

Fallback fonts have no mosaic glyphs, so while Bedstead downloads they would show empty boxes. Mosaics use their
own face over the same file with \`font-display: block\`: cells stay blank until the font arrives, while text
keeps \`swap\`. Browsers give up blocking after about three seconds, so on pages with mosaics preload the font:
\`<link rel="preload" href="…/fonts/bedstead-3.261-regular.woff2" as="font" type="font/woff2" crossorigin>\`.

### Your own CSS

Every mosaic rule is \`:where()\` (ADR-0018), so your CSS wins without \`!important\`, and that includes the font.
A rule that sets a font on every \`span\` (as this docs page's theme does, hence the inline style on the
characters above) turns mosaics into empty boxes. Give them their face back:
\`.cf-mosaic { font-family: 'Bedstead Mosaic', 'Bedstead Cell', monospace }\`.

### On the cell grid

A mosaic is one inline box: the line wraps around it like a word, never inside it, and a picture keeps its
shape beside text. Inside the Screen frame (\`.cf-page[data-frame]\`) cells sit on the 40-cell grid and tile edge
to edge, across and down. The frame's cell is a whole pixel but its height (1em) usually isn't, so at some sizes
a faint line can show where two rows of a solid block meet.
`;

export default {
  title: 'Components/Mosaic',
  tags: ['autodocs'],
  parameters: { docs: { description: { component: DOCS } } },
  argTypes: { separated: { control: 'boolean', description: 'data-mosaic="separated" and the separated characters' } },
  args: { separated: false },
};

export const Banner = {
  parameters: {
    docs: {
      description: {
        story:
          "After Ceefax's page 100: a logo cut out of white blocks and a title in mosaic lettering on a band, both images with names, then a strapline in text and a dotted rule (separated mosaics) that is decorative. Change the letters, colours and strapline in the controls.",
      },
    },
  },
  render: (args) => page(banner(args)),
  argTypes: {
    logo: { control: 'text', description: 'letters cut out of the blocks' },
    title: { control: 'text', description: 'lettered on the band (A–Z, -)' },
    ink: colour,
    band: colour,
    strapline: { control: 'text' },
    ruleColour: colour,
  },
  args: {
    logo: 'CF',
    title: 'WEATHER',
    ink: 'yellow',
    band: 'blue',
    strapline: 'The forecast for your area, page 401',
    ruleColour: 'blue',
  },
  play: async ({ canvasElement, args }) => {
    await fontsLoaded();
    const root = within(canvasElement);
    const title = root.getByRole('img', { name: args.title });
    await expect(root.getByRole('img', { name: args.logo })).toBeTruthy();
    // Ink and band through the variant seam; a cell of the band per letter column.
    await expect(getComputedStyle(title).color).toBe('rgb(255, 255, 0)');
    await expect(getComputedStyle(title).backgroundColor).toBe('rgb(0, 0, 255)');
    await assertCells(title, 1 + 4 * args.title.length);
    await assertSeparated(title, args.separated);
    // The logo and the title stand on the same rows.
    const logoBox = root.getByRole('img', { name: args.logo }).getBoundingClientRect();
    await expect(logoBox.bottom).toBeCloseTo(title.getBoundingClientRect().bottom, 0);
    // The rule is decorative, in a <div>, not a <p>: a hidden mosaic would leave an empty paragraph.
    const ruleEl = mosaics(canvasElement).at(-1);
    await expect(ruleEl.getAttribute('aria-hidden')).toBe('true');
    await expect(ruleEl.parentElement.tagName).toBe('DIV');
    await assertCells(ruleEl, 40);
    // Mosaics block while the font loads (blank, never tofu); text keeps swap.
    const faces = [...document.fonts].filter((f) => f.family.replace(/"/g, '').startsWith('Bedstead'));
    const mosaic = faces.filter((f) => f.family.includes('Mosaic'));
    await expect(mosaic.map((f) => [f.display, f.unicodeRange])).toEqual([
      ['block', 'U+2580-259F, U+1FB00-1FB3B, U+1CE51-1CE8F, U+EE00-EE7F'],
    ]);
    await expect(faces.filter((f) => !mosaic.includes(f)).every((f) => f.display === 'swap')).toBe(true);
  },
};

export const Rule = {
  parameters: {
    docs: {
      description: {
        story:
          'One cell high, with one third of each cell lit: top, middle, bottom or the full cell. Decorative, in a `<div>`.',
      },
    },
  },
  render: ({ pattern, length, variant, separated }) =>
    page(
      '<p>Above the rule.</p>' +
        `<div><span class="cf-mosaic"${sep(separated)} aria-hidden="true"${attr('data-variant', variant)}>${rule(pattern, length, separated)}</span></div>` +
        '<p>Below the rule.</p>',
    ),
  argTypes: {
    pattern: { control: 'inline-radio', options: Object.keys(RULES), description: 'which third of the cell' },
    length: { control: { type: 'range', min: 1, max: 40 } },
    variant: colour,
  },
  args: { pattern: 'middle', length: 40, variant: 'yellow' },
  play: async ({ canvasElement, args }) => {
    await fontsLoaded();
    const [ruleEl] = mosaics(canvasElement);
    await expect(ruleEl.getAttribute('aria-hidden')).toBe('true');
    await expect(ruleEl.parentElement.tagName).toBe('DIV');
    await assertCells(ruleEl, args.length);
    await assertSeparated(ruleEl, args.separated);
  },
};

// A mosaic that means something is an image with a name. Rows are newlines; the picture keeps
// its shape beside the text that follows it. An empty label makes it decorative.
export const Picture = {
  parameters: {
    docs: {
      description: {
        story:
          'A meaningful mosaic is an image with a name; clear the label to make it decorative (aria-hidden). Add a band for a second colour in every cell.',
      },
    },
  },
  render: ({ art, variant, band, label, caption, separated }) =>
    page(
      `<p><span class="cf-mosaic"${sep(separated)}${a11y(label)}${attr('data-band', band)}${attr('data-variant', variant)}>${toMosaic(ART[art], separated)}</span>` +
        ` ${caption}</p>`,
    ),
  argTypes: {
    art: { control: 'inline-radio', options: Object.keys(ART) },
    variant: colour,
    band: colour,
    label: { control: 'text', description: 'aria-label; empty = decorative (aria-hidden)' },
    caption: { control: 'text' },
  },
  args: { art: 'heart', variant: 'red', band: '', label: 'A red heart', caption: 'Valentine’s Day: page 520' },
  play: async ({ canvasElement, args }) => {
    await fontsLoaded();
    const [pic] = mosaics(canvasElement);
    if (args.label) await expect(within(canvasElement).getByRole('img', { name: args.label })).toBe(pic);
    else await expect(pic.getAttribute('aria-hidden')).toBe('true');
    await assertCells(pic, ART[args.art][0].length / 2);
    await assertSeparated(pic, args.separated);
    // One row per three pixel rows, one em each.
    const size = parseFloat(getComputedStyle(pic).fontSize);
    await expect(pic.getBoundingClientRect().height).toBeCloseTo((ART[args.art].length / 3) * size, 0);
  },
};

// The test-runner finds play() by reading the source, so name it rather than spread it in.
export const Separated = {
  ...Picture,
  parameters: {
    docs: {
      description: {
        story:
          'The same picture with data-mosaic="separated" and the separated characters (U+1CE51–1CE8F): each block inset by a gutter. Every story has the separated control.',
      },
    },
  },
  args: { ...Picture.args, separated: true },
  play: Picture.play,
};

// The bars are decorative; the figures stay text, so a screen reader hears "LAB 34%".
// 1 cell = 4%, ▌ for a half.
const bar = (v, separated) => cell(63, separated).repeat(Math.floor(v / 4)) + (v % 4 >= 2 ? cell(21, separated) : '');
export const BarChart = {
  parameters: {
    docs: {
      description: {
        story:
          'Each bar is a run of full cells, with ▌ for a half; 1 cell = 4%. The bars are hidden and the figures are text. Edit the data in the controls.',
      },
    },
  },
  render: ({ heading, data, separated }) =>
    page(
      `<h3>${heading}</h3>` +
        data
          .map(
            ({ label, value, colour: c }) =>
              `<p>${label.padEnd(3)} <span class="cf-mosaic"${sep(separated)} aria-hidden="true"${attr('data-variant', c)}>${bar(value, separated)}</span> ${value}%</p>`,
          )
          .join(''),
    ),
  argTypes: {
    heading: { control: 'text' },
    data: { control: 'object', description: '[{ label, value (%), colour }]' },
  },
  args: {
    heading: 'VOTE SHARE',
    data: [
      { label: 'LAB', value: 34, colour: 'red' },
      { label: 'CON', value: 24, colour: 'blue' },
      { label: 'LIB', value: 14, colour: 'yellow' },
      { label: 'GRN', value: 7, colour: 'green' },
    ],
  },
  play: async ({ canvasElement, args }) => {
    const rows = [...canvasElement.querySelectorAll('p')];
    await expect(rows.length).toBe(args.data.length);
    for (const [i, { label, value }] of args.data.entries()) {
      const [m] = mosaics(rows[i]);
      await expect(m.getAttribute('aria-hidden')).toBe('true');
      // The text a screen reader reads: the row without its hidden bar.
      const spoken = [...rows[i].childNodes]
        .filter((n) => n !== m)
        .map((n) => n.textContent)
        .join('')
        .replace(/\s+/g, ' ');
      await expect(spoken).toBe(`${label} ${value}%`);
    }
  },
};

// The authentic mode: a whole page inside the Screen frame, where every mosaic sits on the 40-cell
// grid beside text. The temperature key is one mosaic of three whole-cell colour runs, each with
// its label; the runs tile edge to edge, across and down (pixels checked in
// .storybook/test-runner.js postVisit). The bars are decorative and the figures text, as in Bar chart.
const KEY = [
  ['red', 'HOT'],
  ['yellow', 'MILD'],
  ['cyan', 'COLD'],
];
const TEMPS = [
  ['LON', 14, 'yellow'],
  ['MAN', 11, 'cyan'],
  ['EDI', 9, 'cyan'],
  ['CDF', 15, 'red'],
];
export const InTheScreenFrame = {
  parameters: {
    docs: {
      description: {
        story:
          "A whole page in the authentic mode: every mosaic sits on the 40-cell grid beside text. The temperature key's colour runs tile edge to edge, and the test-runner checks their pixels for gaps.",
      },
    },
  },
  name: 'In the Screen frame',
  render: (args) => {
    const section = document.createElement('section');
    section.className = 'cf-page';
    section.dataset.frame = '';
    const s = sep(args.separated);
    section.innerHTML =
      '<header class="cf-page__header cf-header-row">' +
      '<span class="cf-header-row__page">P401</span><span class="cf-header-row__service">CEEFAX</span>' +
      '<span class="cf-header-row__rolling">401</span>' +
      '<time class="cf-header-row__time" datetime="2026-11-01T09:30:00"><span class="cf-header-row__date">Nov01</span> 09:30:00</time>' +
      '</header>' +
      '<main class="cf-page__body" tabindex="0">' +
      banner(args) +
      TEMPS.map(
        ([city, t, c]) =>
          `<p>${city} <span class="cf-mosaic"${s} aria-hidden="true" data-variant="${c}">${cell(63, args.separated).repeat(t)}</span> ${t}C</p>`,
      ).join('') +
      `<p><span class="cf-mosaic"${s} role="img" aria-label="Temperature key: red hot, yellow mild, cyan cold">` +
      KEY.map(([c, label]) => `<span data-variant="${c}">${cell(63, args.separated).repeat(4)}</span> ${label}`).join(
        '\n',
      ) +
      '</span></p>' +
      '</main>';
    return section;
  },
  args: { ...Banner.args },
  argTypes: { ...Banner.argTypes },
  play: async ({ canvasElement }) => {
    await fontsLoaded();
    const key = within(canvasElement).getByRole('img', { name: /Temperature key/ });
    const runs = [...key.children].map((r) => r.getBoundingClientRect());
    const size = parseFloat(getComputedStyle(key).fontSize);
    // The frame's cell: a whole pixel, 40 across the body's content box.
    const body = canvasElement.querySelector('.cf-page__body');
    const { paddingLeft, paddingRight } = getComputedStyle(body);
    const content = body.clientWidth - parseFloat(paddingLeft) - parseFloat(paddingRight);
    await expect(size * ADVANCE).toBeCloseTo(Math.floor(content / 40), 1);
    // Across: four cells. Down: one row per em, and a glyph fills its em, so rows meet. That the
    // painted pixels leave no gap is checked on a screenshot in .storybook/test-runner.js postVisit.
    for (const r of runs) await expect(r.width).toBeCloseTo(4 * size * ADVANCE, 1);
    for (let i = 1; i < runs.length; i++) await expect(runs[i].top - runs[i - 1].top).toBeCloseTo(size, 1);
    await expect(runs.map((_, i) => getComputedStyle(key.children[i]).color)).toEqual([
      'rgb(255, 0, 0)',
      'rgb(255, 255, 0)',
      'rgb(0, 255, 255)',
    ]);
  },
};
