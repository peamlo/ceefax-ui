import { expect, within } from 'storybook/test';

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

const league = (attrs = '') =>
  table({
    caption: 'Premier League · final table',
    attrs,
    body:
      `<thead>${LEAGUE_HEAD}</thead>` + LEAGUE.map((g) => `<tbody>${g.map((r) => row(r)).join('')}</tbody>`).join(''),
  });

const cells = (root) => [...root.querySelectorAll('th, td')];
const style = (el) => getComputedStyle(el);
const px = (v) => parseFloat(v);

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

// A league table: caption, a header row, three groups and end-aligned figures.
export const League = {
  render: () => league(),
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
    canvasElement.dataset.theme = 'accessible';
    await expect(style(ruled).borderTopColor).not.toBe(authentic);
    delete canvasElement.dataset.theme;
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
