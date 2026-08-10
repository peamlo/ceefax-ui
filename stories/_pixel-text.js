// A tiny 5x5 uppercase pixel font for building <cf-canvas> header text as a char-grid.
// '#' = on, ' ' = off. Extend as new glyphs are needed.
const FONT = {
  A: [' ### ', '#   #', '#####', '#   #', '#   #'],
  C: ['#####', '#    ', '#    ', '#    ', '#####'],
  E: ['#####', '#    ', '#### ', '#    ', '#####'],
  F: ['#####', '#    ', '#### ', '#    ', '#    '],
  I: ['#####', '  #  ', '  #  ', '  #  ', '#####'],
  U: ['#   #', '#   #', '#   #', '#   #', '#####'],
  X: ['#   #', ' # # ', '  #  ', ' # # ', '#   #'],
  '-': ['     ', '     ', '#####', '     ', '     '],
  ' ': ['     ', '     ', '     ', '     ', '     '],
};
const GLYPH_H = 5;

/** Build the boolean "ink" matrix for a word: rows of true/false, 1 blank col between glyphs. */
function inkMatrix(text) {
  const glyphs = [...text.toUpperCase()].map((ch) => FONT[ch] || FONT[' ']);
  const rows = [];
  for (let r = 0; r < GLYPH_H; r++) {
    const cells = [];
    glyphs.forEach((g, i) => {
      if (i > 0) cells.push(false); // spacer column
      for (const c of g[r]) cells.push(c === '#');
    });
    rows.push(cells);
  }
  return rows;
}

/**
 * Render a word as a <cf-canvas> char-grid string, with an optional drop shadow and
 * background band — the classic teletext masthead look.
 *
 * @param {string} text  the word (case-insensitive; unknown chars become blanks)
 * @param {string|object} opts  a palette code (ink only) or:
 *   - ink    {string} letter colour code (default 'y' yellow)
 *   - shadow {string|null} drop-shadow colour code, or null for none (default null)
 *   - dx,dy  {number} shadow offset in pixels (default 1,1)
 *   - bg     {string|null} background band colour code, or null for transparent
 *   - pad    {number} transparent/band padding around the text (default 0; 1 when bg set)
 * @returns {string} newline-separated rows of palette codes
 */
/** The classic Ceefax masthead treatment: yellow ink, black drop shadow, blue band. */
export const masthead = (text) => pixelText(text, { ink: 'y', shadow: 'k', bg: 'b', pad: 1 });

export function pixelText(text, opts = {}) {
  if (typeof opts === 'string') opts = { ink: opts };
  const { ink = 'y', shadow = null, dx = 1, dy = 1, bg = null } = opts;
  const pad = opts.pad ?? (bg ? 1 : 0);

  const ink2d = inkMatrix(text);
  const tw = ink2d[0]?.length ?? 0;
  const th = ink2d.length;
  const isInk = (x, y) => y >= 0 && y < th && x >= 0 && x < tw && ink2d[y][x];

  // Output grows to fit the shadow offset and the padding on every side.
  const sx = shadow ? Math.max(0, dx) : 0;
  const sy = shadow ? Math.max(0, dy) : 0;
  const ow = tw + sx + pad * 2;
  const oh = th + sy + pad * 2;

  const rows = [];
  for (let oy = 0; oy < oh; oy++) {
    let row = '';
    for (let ox = 0; ox < ow; ox++) {
      const x = ox - pad;
      const y = oy - pad;
      if (isInk(x, y)) row += ink;
      else if (shadow && isInk(x - dx, y - dy)) row += shadow;
      else if (bg) row += bg;
      else row += '.';
    }
    rows.push(row);
  }
  return rows.join('\n');
}
