import { expect } from '@storybook/test';
import { css, page } from './_tokens.js';

export default { title: 'Foundations/Layout' };

const TOKENS = [
  ['cf-content-max', 'prose reading measure (only the Screen frame is 40 cells)'],
  ['cf-layout-max', 'two pages side by side'],
  ['cf-border-thin', 'default border'],
  ['cf-border-thick', 'heavy border'],
  ['cf-radius', 'always 0 — teletext is square'],
  ['cf-header-row', 'header band height'],
  ['cf-footer-row', 'footer band height'],
];

const TokensRender = () => {
  const d = page();
  TOKENS.forEach(([token, note]) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:baseline;gap:16px;border-bottom:1px solid #222;padding:8px 0';
    row.innerHTML =
      '<code style="min-width:150px;color:var(--cf-info);font-size:13px">' + token + '</code>' +
      '<code style="min-width:70px;color:var(--cf-fg-dim);font-size:13px">' + css('--' + token) + '</code>' +
      '<span style="color:#888;font-size:13px">' + note + '</span>';
    d.appendChild(row);
  });

  const demo = document.createElement('div');
  demo.style.cssText = 'margin-top:24px;display:flex;flex-direction:column;gap:12px';
  demo.innerHTML =
    '<div style="max-width:var(--cf-content-max);border:var(--cf-border-thin) solid var(--cf-border);padding:8px;font-size:13px">' +
    'content-max · ' + css('--cf-content-max') + '</div>' +
    '<div style="max-width:var(--cf-layout-max);border:var(--cf-border-thin) solid var(--cf-border);padding:8px;font-size:13px">' +
    'layout-max · ' + css('--cf-layout-max') + '</div>';
  d.appendChild(demo);
  return d;
};

export const Tokens = {
  render: TokensRender,
  play: async () => {
    await expect(css('--cf-content-max')).toBe('65ch');
  },
};
