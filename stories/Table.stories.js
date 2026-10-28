import { expect, within } from 'storybook/test';
import { bandSample } from './_bands.js';

// cf-table (#22): a native <table> set like a broadcast league table, inside its own
// cf-table__scroll region. The stories render the exact contract markup; play() asserts
// what a consumer sees (roles, text, computed styles), never a private --_* property.

// One body row: position, the team as the row header, then end-aligned figures.
const row = ([pos, team, ...figures], attrs = '') =>
  `<tr${attrs}><td>${pos}</td><th scope="row">${team}</th>` +
  figures.map((f) => `<td data-align="end">${f}</td>`).join('') +
  '</tr>';

const LEAGUE_HEAD =
  '<tr><th scope="col">Pos</th><th scope="col">Team</th>' +
  ['P', 'W', 'D', 'L', 'GD', 'Pts'].map((h) => `<th scope="col" data-align="end">${h}</th>`).join('') +
  '</tr>';

// Three groups, as a broadcast page draws them: champion, Champions League places, the rest.
const LEAGUE = [
  [[1, 'Man City', 38, 28, 7, 3, '+62', 91]],
  [
    [2, 'Arsenal', 38, 28, 5, 5, '+62', 89],
    [3, 'Liverpool', 38, 24, 10, 4, '+45', 82],
    [4, 'Aston Villa', 38, 20, 8, 10, '+15', 68],
  ],
  [
    [5, 'Tottenham', 38, 20, 6, 12, '+13', 66],
    [6, 'Chelsea', 38, 18, 9, 11, '+14', 63],
    [7, 'Newcastle', 38, 18, 6, 14, '+23', 60],
    [8, 'Man Utd', 38, 18, 6, 14, '-1', 60],
  ],
];

// The scroll region, named from the caption, around the table. `body` is everything
// after the caption; the caption stays the table's first child wherever it is drawn.
let ids = 0;
const table = ({ caption, captionAttrs = '', attrs = '', body }) => {
  const id = `cf-table-caption-${++ids}`;
  const region = document.createElement('div');
  region.className = 'cf-table__scroll';
  region.setAttribute('role', 'region');
  region.tabIndex = 0;
  region.setAttribute('aria-labelledby', id);
  region.innerHTML = `<table class="cf-table"${attrs}><caption id="${id}"${captionAttrs}>${caption}</caption>${body}</table>`;
  return region;
};

// `current` names the team whose row is aria-current="true" (your team).
const league = (attrs = '', current) =>
  table({
    caption: 'Premier League · final table',
    attrs,
    body:
      `<thead>${LEAGUE_HEAD}</thead>` +
      LEAGUE.map(
        (g) => `<tbody>${g.map((r) => row(r, r[1] === current ? ' aria-current="true"' : '')).join('')}</tbody>`,
      ).join(''),
  });

const cells = (root) => [...root.querySelectorAll('th, td')];
const style = (el) => getComputedStyle(el);
const px = (v) => parseFloat(v);
// What a row's (or a cell's) colour layer paints: its cells carry it.
const paint = (el) => {
  const cs = style(el.matches('tr') ? el.firstElementChild : el);
  return { bg: cs.backgroundColor, fg: cs.color };
};
const NONE = 'rgba(0, 0, 0, 0)';
// The same claim read once as authentic, once under the Accessible theme on the story's root.
const accessible = async (canvasElement, read) => {
  canvasElement.dataset.theme = 'accessible';
  try {
    return await read();
  } finally {
    delete canvasElement.dataset.theme;
  }
};
// A data-band reference sample, measured in place (so it follows the theme), then removed.
const reference = (root, band, ink) => {
  const el = bandSample(band, ink);
  root.append(el);
  const cs = style(el);
  const out = { bg: cs.backgroundColor, fg: cs.color };
  el.remove();
  return out;
};

// Contract: native table semantics, the caption first, and a region named from it.
const assertSemantics = async (canvasElement) => {
  const canvas = within(canvasElement);
  const tableEl = canvas.getByRole('table');
  const caption = tableEl.querySelector('caption');
  await expect(tableEl.firstElementChild).toBe(caption);
  await expect(canvas.getByRole('table', { name: caption.textContent })).toBe(tableEl);
  await expect(canvas.getByRole('region', { name: caption.textContent })).toBe(tableEl.parentElement);
  await expect(canvas.getAllByRole('rowgroup').length).toBe(tableEl.querySelectorAll('thead, tbody, tfoot').length);
  await expect(canvas.getAllByRole('columnheader').length).toBe(tableEl.querySelectorAll('thead th').length);
  return tableEl;
};

// Contract: a rule only between groups — on the first-row cells of every later <tbody>
// and the <tfoot>, nowhere else, and never under a row.
const assertGroupRules = async (tableEl) => {
  const ruled = new Set(tableEl.querySelectorAll(':is(tbody + tbody, tbody + tfoot) > tr:first-child > *'));
  await expect(ruled.size).toBeGreaterThan(0);
  for (const cell of cells(tableEl)) {
    const cs = style(cell);
    if (ruled.has(cell)) await expect(px(cs.borderTopWidth)).toBeGreaterThan(0);
    else await expect(cs.borderTopWidth).toBe('0px');
    await expect(cs.borderBottomWidth).toBe('0px');
  }
};

export default {
  title: 'Components/Table',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`cf-table` on a native `<table>`, inside a `cf-table__scroll` region (`role="region"`, `tabindex="0"`, ' +
          '`aria-labelledby` → the caption). Group rows with native `<tbody>` elements: the only rule is between ' +
          'groups (`--cf-table-rule` changes it). `data-align="end"` end-aligns a figure cell. Typography comes from ' +
          'the `--cf-*` tokens in your own CSS, never attributes.',
      },
    },
  },
};

// A league table: caption, a header row, three groups and end-aligned figures. Rows
// alternate text colour (Ceefax cyan/white) with data-stripe-rows="text", and your team's
// row is aria-current="true": an accent band, announced as current.
export const League = {
  render: () => league(' data-stripe-rows="text"', 'Liverpool'),
  play: async ({ canvasElement }) => {
    const tableEl = await assertSemantics(canvasElement);
    await expect(within(canvasElement).getAllByRole('rowheader').length).toBe(8);
    await assertGroupRules(tableEl);
    // The header: bold foreground text, no rule.
    for (const th of tableEl.querySelectorAll('thead th')) {
      const cs = style(th);
      await expect(cs.fontWeight).toBe('700');
      await expect(cs.borderTopWidth).toBe('0px');
      await expect(cs.borderBottomWidth).toBe('0px');
      await expect(cs.color).toBe('rgb(255, 255, 255)'); // --cf-fg
    }
    // The caption: display face, accent colour, at the top.
    const caption = style(tableEl.querySelector('caption'));
    await expect(caption.fontFamily).toContain('Bedstead');
    await expect(caption.color).toBe('rgb(255, 255, 0)'); // --cf-accent
    await expect(caption.captionSide).toBe('top');
    // Figures: end-aligned, whole, tabular digits.
    for (const cell of tableEl.querySelectorAll('[data-align="end"]')) {
      const cs = style(cell);
      await expect(['end', 'right']).toContain(cs.textAlign);
      await expect(cs.whiteSpace).toBe('nowrap');
      await expect(cs.fontVariantNumeric).toBe('tabular-nums');
    }
    // The group rule follows the theme: --cf-accent-2 remaps under the Accessible theme.
    const ruled = tableEl.querySelector('tbody + tbody > tr > td');
    const authentic = style(ruled).borderTopColor;
    await expect(authentic).toBe('rgb(0, 255, 0)');
    await expect(await accessible(canvasElement, () => style(ruled).borderTopColor)).not.toBe(authentic);
    // Text stripes: odd and even rows differ, every group starts on the same colour, no
    // background, and the header is never striped.
    const groups = [...tableEl.tBodies];
    const [odd, even] = [...groups[2].rows].map(paint);
    await expect(odd.fg).toBe('rgb(0, 255, 255)'); // --cf-info
    await expect(even.fg).toBe('rgb(255, 255, 255)'); // --cf-fg
    for (const g of groups) await expect(paint(g.rows[0])).toEqual(odd);
    for (const tr of tableEl.querySelectorAll('tbody tr:not([aria-current])')) await expect(paint(tr).bg).toBe(NONE);
    for (const th of tableEl.tHead.rows[0].cells) await expect(paint(th).fg).toBe(even.fg);
    // Under the Accessible theme the stripe follows the remapped info colour.
    await expect(await accessible(canvasElement, () => paint(groups[2].rows[0]).fg)).not.toBe(odd.fg);
    await assertCurrentRow(canvasElement);
  },
};

// Contract: the aria-current row is announced as current and painted as an accent band with
// its ink, over the stripe or zone it sits in; data-band on it recolours the band.
const assertCurrentRow = async (canvasElement) => {
  const current = within(canvasElement).getByRole('row', { current: true });
  await expect(current.getAttribute('aria-current')).toBe('true');
  for (const cell of current.cells) await expect(paint(cell)).toEqual({ bg: 'rgb(255, 255, 0)', fg: 'rgb(0, 0, 0)' }); // --cf-accent, --cf-on-variant
  current.dataset.band = 'magenta';
  await expect(paint(current)).toEqual(reference(canvasElement, 'magenta'));
  current.dataset.band = 'not-a-colour'; // an unknown band keeps the accent: never a text-only current row
  await expect(paint(current).bg).toBe('rgb(255, 255, 0)');
  delete current.dataset.band;
};

// Zones (WDR-style): data-band on a <tbody> bands the whole group, data-variant colours its
// text. Both override the row stripe. The caption and header take a band too, here yellow on
// blue as on a broadcast title strip.
export const Zones = {
  render: () =>
    table({
      caption: 'Premier League · places',
      captionAttrs: ' data-band="blue" data-variant="yellow"',
      attrs: ' data-stripe-rows="band"',
      body:
        `<thead data-band="blue" data-variant="yellow">${LEAGUE_HEAD}</thead>` +
        `<tbody data-band="cyan">${[...LEAGUE[0], ...LEAGUE[1]].map((r) => row(r, r[1] === 'Arsenal' ? ' aria-current="true"' : '')).join('')}</tbody>` +
        `<tbody data-variant="green">${LEAGUE[2]
          .slice(0, 2)
          .map((r) => row(r))
          .join('')}</tbody>` +
        `<tbody>${LEAGUE[2]
          .slice(2)
          .map((r) => row(r))
          .join('')}</tbody>`,
    }),
  play: async ({ canvasElement }) => {
    const tableEl = await assertSemantics(canvasElement);
    const [zone, green, plain] = tableEl.tBodies;
    const read = () => ({
      zone: [...zone.rows].filter((tr) => !tr.ariaCurrent).map(paint),
      green: [...green.rows].map(paint),
      caption: paint(tableEl.caption),
      head: paint(tableEl.tHead.rows[0].cells[0]),
      cyan: reference(canvasElement, 'cyan'),
      title: reference(canvasElement, 'blue', 'yellow'),
      greenText: reference(canvasElement, '', 'green').fg,
    });
    const authentic = read();
    // Every row of the banded zone matches a data-band="cyan" sample, stripe or not.
    for (const r of authentic.zone) await expect(r).toEqual(authentic.cyan);
    // The variant zone: text in the variant colour, no band, no stripe.
    for (const r of authentic.green) await expect(r).toEqual({ bg: NONE, fg: authentic.greenText });
    // The plain group keeps the band stripe.
    await expect(paint(plain.rows[0]).bg).toBe('rgb(0, 0, 255)');
    // Caption and header: yellow on blue.
    await expect(authentic.caption).toEqual(authentic.title);
    await expect(authentic.head).toEqual(authentic.title);
    await expect(authentic.title).toEqual({ bg: 'rgb(0, 0, 255)', fg: 'rgb(255, 255, 0)' });
    // The current row wins over its zone.
    await assertCurrentRow(canvasElement);
    // An unknown band renders no band.
    zone.dataset.band = 'not-a-colour';
    await expect(paint(zone.rows[0]).bg).toBe(NONE);
    zone.dataset.band = 'cyan';
    // Under the Accessible theme the colours change and every band's ink is black.
    const themed = await accessible(canvasElement, read);
    await expect(themed.cyan.bg).not.toBe(authentic.cyan.bg);
    await expect(themed.greenText).not.toBe(authentic.greenText);
    for (const r of themed.zone) await expect(r).toEqual(themed.cyan);
    for (const band of [themed.caption, themed.head, themed.zone[0]]) await expect(band.fg).toBe('rgb(0, 0, 0)');
  },
};

// data-stripe-rows="band": odd rows on a blue band with the seam's readable ink, the pair
// data-band="blue" gives. For very wide tables that need a stronger row guide.
const RESULTS = [
  ['Arsenal', '2-1', 'Chelsea'],
  ['Brentford', '0-0', 'Fulham'],
  ['Everton', '1-3', 'Liverpool'],
  ['Man Utd', '2-2', 'Newcastle'],
  ['Spurs', '4-0', 'Wolves'],
];
export const BandStripes = {
  name: 'Band stripes',
  render: () =>
    table({
      caption: 'Results · Saturday',
      attrs: ' data-stripe-rows="band"',
      body:
        '<thead><tr><th scope="col">Home</th><th scope="col" data-align="end">Score</th><th scope="col">Away</th></tr></thead>' +
        '<tbody>' +
        RESULTS.map(
          ([home, score, away]) =>
            `<tr><th scope="row">${home}</th><td data-align="end">${score}</td><td>${away}</td></tr>`,
        ).join('') +
        '</tbody>',
    }),
  play: async ({ canvasElement }) => {
    const tableEl = await assertSemantics(canvasElement);
    const read = () => {
      const [odd, even] = [...tableEl.tBodies[0].rows].map(paint);
      return { odd, even, blue: reference(canvasElement, 'blue'), head: paint(tableEl.tHead.rows[0]) };
    };
    const authentic = read();
    await expect(authentic.odd).toEqual(authentic.blue);
    await expect(authentic.odd.bg).toBe('rgb(0, 0, 255)'); // --cf-variant-blue
    await expect(authentic.even.bg).toBe(NONE);
    await expect(authentic.head.bg).toBe(NONE);
    // Under the Accessible theme the band changes and its ink is black.
    const themed = await accessible(canvasElement, read);
    await expect(themed.odd).toEqual(themed.blue);
    await expect(themed.odd.bg).not.toBe(authentic.odd.bg);
    await expect(themed.odd.fg).toBe('rgb(0, 0, 0)');
  },
};

// Totals in a <tfoot>, set apart by the group rule and in bold, under a caption drawn
// at the bottom. The consumer's own CSS restyles the caption with the type tokens and wins
// without !important: the table's defaults are :where(), so any selector beats them.
export const Summary = {
  render: () => {
    const wrap = document.createElement('div');
    wrap.className = 'summary-demo';
    const css = document.createElement('style');
    css.textContent =
      '.summary-demo caption { font-family: var(--cf-font-body); font-size: var(--cf-text-subheading);' +
      ' font-weight: var(--cf-weight-bold); }';
    const money = (n) => `${n.toLocaleString('es-ES')}€`;
    const line = (name, a, b) =>
      `<tr><th scope="row">${name}</th><td data-align="end">${money(a)}</td><td data-align="end">${money(b)}</td></tr>`;
    wrap.append(
      css,
      table({
        caption: 'Your investment plan · <small>per month</small>',
        captionAttrs: ' data-side="bottom"',
        body:
          '<thead><tr><th scope="col">Fund</th><th scope="col" data-align="end">Now</th>' +
          '<th scope="col" data-align="end">Plan</th></tr></thead>' +
          `<tbody>${line('Index fund', 900, 1290)}${line('Bonds', 300, 250)}${line('Cash', 200, 60)}</tbody>` +
          `<tfoot><tr><th scope="row">Total</th><td data-align="end">${money(1400)}</td>` +
          `<td data-align="end"><strong>${money(1600)}</strong></td></tr></tfoot>`,
      }),
    );
    return wrap;
  },
  play: async ({ canvasElement }) => {
    const tableEl = await assertSemantics(canvasElement);
    await assertGroupRules(tableEl);
    for (const cell of tableEl.querySelectorAll('tfoot :is(th, td)')) await expect(style(cell).fontWeight).toBe('700');
    // No data-stripe-rows: every body row the same colour, none on a background.
    const rows = [...tableEl.tBodies[0].rows].map(paint);
    for (const r of rows) await expect(r).toEqual({ bg: NONE, fg: rows[0].fg });
    const caption = tableEl.querySelector('caption');
    const cs = style(caption);
    await expect(cs.captionSide).toBe('bottom');
    await expect(caption.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      tableEl.querySelector('tfoot').getBoundingClientRect().bottom,
    );
    // The consumer's token-based overrides won.
    const root = getComputedStyle(document.documentElement);
    await expect(cs.fontFamily).toContain('Space Mono');
    await expect(cs.fontSize).toBe(root.getPropertyValue('--cf-text-subheading').trim());
    await expect(cs.fontWeight).toBe('700');
    // <small> follows its token.
    await expect(style(caption.querySelector('small')).fontSize).toBe(root.getPropertyValue('--cf-text-small').trim());
  },
};

// Column stripes: data-stripe-cols gives the row stripes' two looks cell by cell. Here band
// rows cross text columns: where they cross the row wins, and the header follows the columns.
export const BandRowsTextColumns = {
  name: 'Band rows, text columns',
  render: () => league(' data-stripe-rows="band" data-stripe-cols="text"', 'Liverpool'),
  play: async ({ canvasElement }) => {
    const tableEl = await assertSemantics(canvasElement);
    const read = () => {
      const rest = tableEl.tBodies[2];
      return {
        plain: [...rest.rows[1].cells].map(paint), // an even row: no row stripe
        banded: [...rest.rows[0].cells].map(paint), // an odd row: the band stripe
        head: [...tableEl.tHead.rows[0].cells].map(paint),
        blue: reference(canvasElement, 'blue'),
      };
    };
    const authentic = read();
    for (const cells of [authentic.plain, authentic.head]) {
      await expect(cells[0].fg).toBe('rgb(0, 255, 255)'); // --cf-info
      await expect(cells[1].fg).toBe('rgb(255, 255, 255)'); // --cf-fg
      for (const [i, c] of cells.entries()) await expect(c.fg).toBe(cells[i % 2].fg);
    }
    for (const c of authentic.banded) await expect(c).toEqual(authentic.blue);
    await assertCurrentRow(canvasElement);
    const themed = await accessible(canvasElement, read);
    await expect(themed.plain[0].fg).not.toBe(authentic.plain[0].fg);
    for (const c of themed.banded) await expect(c).toEqual({ bg: themed.blue.bg, fg: 'rgb(0, 0, 0)' });
  },
};

// data-stripe-cols="band" for a dense table of figures. A highlighted row and a banded group
// cross the columns, and both keep their own colours. colspan isn't supported here: it shifts
// the count.
const RETURNS = [
  ['World index', '+21,8%', '-12,7%', '+18,1%', '+25,3%', '+6,2%'],
  ['Euro bonds', '-3,1%', '-17,2%', '+7,2%', '+2,6%', '+1,4%'],
  ['Your plan', '+14,9%', '-13,8%', '+14,3%', '+18,4%', '+4,9%'],
  ['Cash', '-0,5%', '+0,2%', '+3,3%', '+3,6%', '+2,1%'],
];
export const ColumnBands = {
  name: 'Column bands',
  render: () =>
    table({
      caption: 'Returns by year',
      attrs: ' data-stripe-cols="band"',
      body:
        '<thead><tr><th scope="col">Fund</th>' +
        ['2021', '2022', '2023', '2024', '2025'].map((y) => `<th scope="col" data-align="end">${y}</th>`).join('') +
        '</tr></thead><tbody>' +
        RETURNS.map(
          ([name, ...figs]) =>
            `<tr${name === 'Your plan' ? ' aria-current="true"' : ''}><th scope="row">${name}</th>` +
            figs.map((f) => `<td data-align="end">${f}</td>`).join('') +
            '</tr>',
        ).join('') +
        '</tbody><tbody data-band="cyan"><tr><th scope="row">Benchmark</th>' +
        ['+20,1%', '-14,0%', '+16,9%', '+22,0%', '+5,8%'].map((f) => `<td data-align="end">${f}</td>`).join('') +
        '</tr></tbody>',
    }),
  play: async ({ canvasElement }) => {
    const tableEl = await assertSemantics(canvasElement);
    const read = () => ({
      plain: [...tableEl.tBodies[0].rows[0].cells].map(paint),
      head: [...tableEl.tHead.rows[0].cells].map(paint),
      zone: [...tableEl.tBodies[1].rows[0].cells].map(paint),
      blue: reference(canvasElement, 'blue'),
      cyan: reference(canvasElement, 'cyan'),
    });
    const authentic = read();
    // Odd columns on the blue band, even ones bare, in the body and the header alike.
    for (const cells of [authentic.plain, authentic.head])
      for (const [i, c] of cells.entries()) await expect(c.bg).toBe(i % 2 ? NONE : authentic.blue.bg);
    await expect(authentic.plain[0]).toEqual(authentic.blue);
    // The banded group and the current row keep their own colours across every column.
    for (const c of authentic.zone) await expect(c).toEqual(authentic.cyan);
    await assertCurrentRow(canvasElement);
    // Under the Accessible theme the column band changes and its ink is black.
    const themed = await accessible(canvasElement, read);
    await expect(themed.plain[0].bg).not.toBe(authentic.plain[0].bg);
    for (const c of [themed.plain[0], themed.head[0], ...themed.zone]) await expect(c.fg).toBe('rgb(0, 0, 0)');
  },
};

// Inside the Screen frame, the authentic mode (ADR-0014): every cell and the caption stay on
// one line and every body row is one row high.
export const InScreenFrame = {
  name: 'In the Screen frame',
  parameters: { layout: 'fullscreen' },
  render: () => {
    const page = document.createElement('section');
    page.className = 'cf-page';
    page.dataset.frame = '';
    const body = document.createElement('main');
    body.className = 'cf-page__body';
    body.tabIndex = 0;
    body.style.padding = 'var(--cf-space-3)';
    body.append(league());
    page.append(body);
    return page;
  },
  play: async ({ canvasElement }) => {
    const tableEl = await assertSemantics(canvasElement);
    for (const el of [tableEl.querySelector('caption'), ...cells(tableEl)])
      await expect(style(el).whiteSpace).toBe('nowrap');
    for (const tr of tableEl.querySelectorAll('tbody tr')) {
      // One line high, plus the group rule on a group's first row.
      const cs = style(tr.firstElementChild);
      const height = tr.getBoundingClientRect().height - px(cs.borderTopWidth);
      await expect(Math.abs(height - px(cs.lineHeight))).toBeLessThan(1);
    }
  },
};

// Long text cells wrap like any web table outside the frame; figures never do. On a phone
// the table is wider than the screen, so it scrolls inside its region and the page doesn't
// (asserted at a real 320px viewport in .storybook/test-runner.js postVisit).
const LONG =
  'Global index fund tracking developed and emerging markets, rebalanced every quarter with dividends reinvested';
export const Wide = {
  name: 'Wide, with long text',
  render: () =>
    table({
      caption: 'Fund comparison',
      body:
        '<thead><tr><th scope="col">Fund</th><th scope="col">Notes</th>' +
        ['Fee', '1y', '3y', '5y', '10y', 'Min.'].map((h) => `<th scope="col" data-align="end">${h}</th>`).join('') +
        '</tr></thead><tbody>' +
        [
          ['World index', LONG, '0,12%', '+18,2%', '+24,9%', '+61,0%', '+142,3%', '1.290€'],
          [
            'Euro bonds',
            'Investment-grade government and corporate bonds',
            '0,10%',
            '+4,1%',
            '-6,3%',
            '-2,0%',
            '+12,8%',
            '500€',
          ],
        ]
          .map(
            ([name, notes, ...figs]) =>
              `<tr><th scope="row">${name}</th><td>${notes}</td>` +
              figs.map((f) => `<td data-align="end">${f}</td>`).join('') +
              '</tr>',
          )
          .join('') +
        '</tbody>',
    }),
  play: async ({ canvasElement }) => {
    const tableEl = await assertSemantics(canvasElement);
    // The long text cell wraps: its row is taller than one row height.
    const notes = tableEl.querySelector('tbody td');
    await expect(style(notes).whiteSpace).toBe('normal');
    await expect(notes.parentElement.getBoundingClientRect().height).toBeGreaterThan(px(style(notes).lineHeight) * 1.5);
  },
};
