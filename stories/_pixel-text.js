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

/**
 * Render a word as a <cf-canvas> char-grid string.
 * @param {string} text  the word (case-insensitive; unknown chars become blanks)
 * @param {string} code  the palette code to ink each pixel (default 'y' = yellow)
 * @returns {string} newline-separated rows of palette codes
 */
export function pixelText(text, code = 'y') {
  const glyphs = [...text.toUpperCase()].map((ch) => FONT[ch] || FONT[' ']);
  const rows = [];
  for (let r = 0; r < 5; r++) {
    // 1 transparent column between glyphs.
    rows.push(glyphs.map((g) => g[r].replace(/#/g, code).replace(/ /g, '.')).join('.'));
  }
  return rows.join('\n');
}
