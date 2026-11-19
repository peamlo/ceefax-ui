// Pixel art → mosaic characters (README → Mosaic). Pure: no DOM, no side effects, so bundlers drop it
// when unused. Every 2×3 pixels become one cell.

// One cell: blocks 1, 2, 4, 8, 16, 32 from the top-left, row by row, added up.
export const cell = (bits, { separated = false } = {}) => {
  if (!bits) return ' ';
  if (separated) return String.fromCodePoint(0x1ce51 + bits - 1);
  if (bits === 21) return '▌';
  if (bits === 42) return '▐';
  if (bits === 63) return '█';
  return String.fromCodePoint(0x1fb00 + bits - 1 - (bits > 21) - (bits > 42));
};

// Pixel rows ('#' lit, anything else off) → mosaic text, one line per three pixel rows.
export const toMosaic = (pixels, { separated = false } = {}) => {
  const lines = [];
  const width = Math.max(0, ...pixels.map((r) => r.length));
  for (let y = 0; y < pixels.length; y += 3) {
    let line = '';
    for (let x = 0; x < width; x += 2) {
      let bits = 0;
      for (let r = 0; r < 3; r++)
        for (let c = 0; c < 2; c++) if (pixels[y + r]?.[x + c] === '#') bits |= 1 << (r * 2 + c);
      line += cell(bits, { separated });
    }
    lines.push(line);
  }
  return lines.join('\n');
};
