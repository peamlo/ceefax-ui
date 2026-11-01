// Builds mosaic markup for the stories from pixel art, so their controls can change it. Art is
// rows of pixels ('#' on); every 2×3 pixels become one cell. Consumers draw in the zxnet editor
// instead and paste the characters (README → Mosaic); this is the same formula in code.

export const COLOURS = ['red', 'green', 'yellow', 'blue', 'cyan', 'magenta'];

// One cell: blocks 1, 2, 4, 8, 16, 32 from the top-left, row by row, added up.
export const cell = (bits, separated = false) => {
  if (!bits) return ' ';
  if (separated) return String.fromCodePoint(0x1ce51 + bits - 1);
  if (bits === 21) return '▌';
  if (bits === 42) return '▐';
  if (bits === 63) return '█';
  return String.fromCodePoint(0x1fb00 + bits - 1 - (bits > 21) - (bits > 42));
};

// Pixel rows → mosaic text, one line per three pixel rows.
export const toMosaic = (pixels, separated = false) => {
  const lines = [];
  for (let y = 0; y < pixels.length; y += 3) {
    let line = '';
    for (let x = 0; x < pixels[0].length; x += 2) {
      let bits = 0;
      for (let r = 0; r < 3; r++)
        for (let c = 0; c < 2; c++) if (pixels[y + r]?.[x + c] === '#') bits |= 1 << (r * 2 + c);
      line += cell(bits, separated);
    }
    lines.push(line);
  }
  return lines.join('\n');
};

// A one-cell-high rule: which third of the cell is lit.
const RULES = { top: 3, middle: 12, bottom: 48, full: 63 };
export const rule = (pattern, length, separated) => cell(RULES[pattern], separated).repeat(length);

export const ART = {
  heart: ['.##.##..', '#######.', '#######.', '.#####..', '..###...', '...#....'],
  house: ['...##...', '..####..', '.######.', '########', '.##..##.', '.##..##.'],
  arrow: ['##......', '####....', '######..', '########', '######..', '####....'],
  // Original art, 24 × 13 cells: a lit sphere, ordered-dithered for shading, with a two-band ring in
  // front of it and behind it. Computed once and pasted, as you'd paste from the zxnet editor.
  saturn: [
    '.................#..............................',
    '..............................#.................',
    '............................................#...',
    '..#.............................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '...................#.#.#.#.#....................',
    '..................#######.#.#.#.................',
    '.................###########.#.#................',
    '...............################.#...............',
    '...............#############.#...#########......',
    '..............###############.#.#.###.#...###...',
    '.............###############.#.#.......#.#..##..',
    '............###################.#.#.....##..##..',
    '.............###############.#.#...#.......##...',
    '..........#.#.###############.#.#.....##.##.....',
    '.......##....###############.#.#...#.#.##.......',
    '.....##.##..###############.#.#.#.#..#..........',
    '...##..#.....#.#########.#.#.#.#..#.............',
    '.###..##....#.###########..##.##..#.............',
    '..##...#.....#.#.#...#.#.###....................',
    '...###...##.###.###.###.#.#.#.....#.............',
    '......#########....#.#.#.#.......#..............',
    '................#.#.#.#.#.#.....#...............',
    '.................#.............#................',
    '..................#.#.......#.#.................',
    '...................#.#.#.#.#....................',
    '.....#..........................................',
    '..............................................#.',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '.........#......................................',
    '....................................#...........',
    '................................................',
  ],
};

// 5×5 capitals, made bold below; M and W are drawn bold already (6 wide). Unknown characters are blank.
const FONT = {
  A: [' ### ', '#   #', '#####', '#   #', '#   #'],
  B: ['#### ', '#   #', '#### ', '#   #', '#### '],
  C: ['#####', '#    ', '#    ', '#    ', '#####'],
  D: ['#### ', '#   #', '#   #', '#   #', '#### '],
  E: ['#####', '#    ', '#### ', '#    ', '#####'],
  F: ['#####', '#    ', '#### ', '#    ', '#    '],
  G: ['#####', '#    ', '# ###', '#   #', '#####'],
  H: ['#   #', '#   #', '#####', '#   #', '#   #'],
  I: ['#####', '  #  ', '  #  ', '  #  ', '#####'],
  J: ['  ###', '   # ', '   # ', '#  # ', ' ##  '],
  K: ['#   #', '#  # ', '###  ', '#  # ', '#   #'],
  L: ['#    ', '#    ', '#    ', '#    ', '#####'],
  M: ['##  ##', '######', '# ## #', '#    #', '#    #'],
  N: ['#   #', '##  #', '# # #', '#  ##', '#   #'],
  O: ['#####', '#   #', '#   #', '#   #', '#####'],
  P: ['#### ', '#   #', '#### ', '#    ', '#    '],
  Q: ['#####', '#   #', '#   #', '#  # ', '### #'],
  R: ['#### ', '#   #', '#### ', '#  # ', '#   #'],
  S: ['#####', '#    ', '#####', '    #', '#####'],
  T: ['#####', '  #  ', '  #  ', '  #  ', '  #  '],
  U: ['#   #', '#   #', '#   #', '#   #', '#####'],
  V: ['#   #', '#   #', '#   #', ' # # ', '  #  '],
  W: ['#    #', '#    #', '# ## #', '######', '##  ##'],
  X: ['#   #', ' # # ', '  #  ', ' # # ', '#   #'],
  Y: ['#   #', ' # # ', '  #  ', '  #  ', '  #  '],
  Z: ['#####', '   # ', '  #  ', ' #   ', '#####'],
  '-': ['     ', '     ', '#####', '     ', '     '],
};
// Bold, like Ceefax's own lettering: each lit pixel also lights the one to its right (6 wide).
const bold = (row) => [...` ${row}`].map((_, i, r) => (r[i] === '#' || r[i + 1] === '#' ? '#' : ' ')).join('');
const letter = (ch) =>
  (FONT[ch.toUpperCase()] ?? FONT['-'].map(() => '     ')).map((row) => (row.length === 6 ? row : bold(row)));

// A word in 3-row lettering: 4 cells a letter, a cell of margin each side, 2 blank pixel rows
// above and below the 5-pixel letters.
export const lettering = (word) => {
  const glyphs = [...word].map(letter);
  const rows = [0, 1, 2, 3, 4].map((r) => '  ' + glyphs.map((g) => g[r] + '  ').join(''));
  const blank = ' '.repeat(rows[0].length);
  return [blank, blank, ...rows, blank, blank];
};

// Ceefax's logo blocks: each letter cut out of a solid 4×3-cell block, a cell apart.
export const logo = (letters) => {
  const blocks = [...letters].map((ch) => {
    const g = letter(ch);
    return Array.from({ length: 9 }, (_, y) => {
      const row = y >= 2 && y < 7 ? g[y - 2] : '      ';
      return '#' + [...row].map((p) => (p === '#' ? ' ' : '#')).join('') + '#';
    });
  });
  return Array.from({ length: 9 }, (_, y) => blocks.map((b) => b[y]).join('  '));
};
