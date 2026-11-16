import { css, page } from './_tokens.js';

export default { title: 'Foundations/Spacing' };

// Spelled out, not built from a step number, so the token report (issue #52) sees each name.
const STEPS = [
  'cf-space-0',
  'cf-space-1',
  'cf-space-2',
  'cf-space-3',
  'cf-space-4',
  'cf-space-5',
  'cf-space-6',
  'cf-space-7',
  'cf-space-8',
];

export const Scale = () => {
  const d = page(
    '<p style="max-width:60ch;color:var(--cf-fg-dim)">Spacing steps are measured in <code>ch</code> so the ' +
      'vertical and horizontal rhythm tracks the monospaced grid.</p>',
  );
  STEPS.forEach((token) => {
    const value = css('--' + token) || '0';
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:16px;padding:6px 0';
    row.innerHTML =
      '<code style="min-width:130px;color:var(--cf-info);font-size:13px">' +
      token +
      '</code>' +
      '<code style="min-width:60px;color:var(--cf-fg-dim);font-size:13px">' +
      value +
      '</code>' +
      '<span style="display:inline-block;height:16px;width:' +
      value +
      ';background:var(--cf-accent)"></span>';
    d.appendChild(row);
  });
  // The row unit used for teletext line rhythm.
  const row = document.createElement('div');
  row.style.cssText = 'margin-top:16px;color:var(--cf-fg-dim);font-size:13px';
  row.innerHTML =
    '<code style="color:var(--cf-info)">cf-row</code> · ' +
    css('--cf-row') +
    ' — one teletext line of vertical rhythm.';
  d.appendChild(row);
  return d;
};
