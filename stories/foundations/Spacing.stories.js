import { css, page } from './_tokens.js';

export default { title: 'Foundations/Spacing' };

const STEPS = ['0', '1', '2', '3', '4', '5', '6', '7', '8'];

export const Scale = () => {
  const d = page(
    '<p style="max-width:60ch;color:#b3ffb3">Spacing steps are measured in <code>ch</code> so the ' +
    'vertical and horizontal rhythm tracks the monospaced grid.</p>'
  );
  STEPS.forEach((n) => {
    const value = css('--cf-space-' + n) || '0';
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:16px;padding:6px 0';
    row.innerHTML =
      '<code style="min-width:130px;color:#00ffff;font-size:13px">cf-space-' + n + '</code>' +
      '<code style="min-width:60px;color:#b3ffb3;font-size:13px">' + value + '</code>' +
      '<span style="display:inline-block;height:16px;width:' + value + ';background:#ffff00"></span>';
    d.appendChild(row);
  });
  // The row unit used for teletext line rhythm.
  const row = document.createElement('div');
  row.style.cssText = 'margin-top:16px;color:#b3ffb3;font-size:13px';
  row.innerHTML = '<code style="color:#00ffff">cf-row</code> · ' + css('--cf-row') +
    ' — one teletext line of vertical rhythm.';
  d.appendChild(row);
  return d;
};
