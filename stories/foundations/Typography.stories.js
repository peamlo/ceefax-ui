import { css, page } from './_tokens.js';

export default { title: 'Foundations/Typography' };

const FAMILIES = [
  ['Display', 'cf-font-display', 'Bedstead,monospace', 'Headings, card titles and fastext keys.'],
  ['Body / Mono', 'cf-font-mono', 'Space Mono,monospace', 'Everything you actually read.'],
];

const SCALE = [
  ['display-xl', 'cf-text-display-xl', 'Bedstead,monospace'],
  ['display-lg', 'cf-text-display-lg', 'Bedstead,monospace'],
  ['heading', 'cf-text-heading', 'Bedstead,monospace'],
  ['subheading', 'cf-text-subheading', 'Space Mono,monospace'],
  ['body', 'cf-text-body', 'Space Mono,monospace'],
  ['small', 'cf-text-small', 'Space Mono,monospace'],
  ['caption', 'cf-text-caption', 'Space Mono,monospace'],
];

const LEADING = ['cf-leading-tight', 'cf-leading-normal', 'cf-leading-relaxed'];

const WEIGHTS = ['cf-weight-regular', 'cf-weight-bold'];

export const Families = () => {
  const d = page();
  FAMILIES.forEach(([label, token, family, note]) => {
    const row = document.createElement('div');
    row.style.cssText = 'border-bottom:1px solid #222;padding:12px 0';
    row.innerHTML =
      '<code style="color:var(--cf-info);font-size:13px">' + label + ' · ' + css('--' + token) + '</code>' +
      '<div style="font-family:' + family + ';font-size:40px;line-height:1.1">Ceefax 0123456789</div>' +
      '<span style="color:#888;font-size:13px">' + note + '</span>';
    d.appendChild(row);
  });
  return d;
};

export const Scale = () => {
  const d = page();
  SCALE.forEach(([label, token, family]) => {
    const size = css('--' + token);
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:baseline;gap:16px;border-bottom:1px solid #222;padding:10px 0';
    row.innerHTML =
      '<code style="min-width:120px;color:var(--cf-info);font-size:13px">' + label + '</code>' +
      '<code style="min-width:60px;color:var(--cf-fg-dim);font-size:13px">' + size + '</code>' +
      '<span style="font-family:' + family + ';font-size:' + size + ';line-height:1.1">Ceefax P100</span>';
    d.appendChild(row);
  });
  return d;
};

export const Leading = () => {
  const d = page();
  LEADING.forEach((token) => {
    const value = css('--' + token);
    const block = document.createElement('div');
    block.style.cssText = 'margin-bottom:20px';
    block.innerHTML =
      '<code style="color:var(--cf-info);font-size:13px">' + token + ' · ' + value + '</code>' +
      '<p style="max-width:50ch;font-size:19px;line-height:' + value + ';margin:4px 0 0">' +
      'The quick brown fox jumps over the lazy dog. Teletext pages wrapped tight to a fixed grid.</p>';
    d.appendChild(block);
  });
  return d;
};

// Both families ship exactly these two weights; anything else is synthesised by the browser.
export const Weights = () => {
  const d = page();
  WEIGHTS.forEach((token) => {
    const value = css('--' + token);
    const row = document.createElement('div');
    row.style.cssText = 'border-bottom:1px solid #222;padding:12px 0';
    row.innerHTML =
      '<code style="color:var(--cf-info);font-size:13px">' + token + ' · ' + value + '</code>' +
      FAMILIES.map(([, , family]) =>
        '<div style="font-family:' + family + ';font-weight:' + value + ';font-size:32px;line-height:1.2">Ceefax P100</div>'
      ).join('');
    d.appendChild(row);
  });
  return d;
};
