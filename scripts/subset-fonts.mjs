// Splits a font into unicode-range subsets (ADR-0024), so a page downloads only the
// glyphs it shows: Latin text with the symbols UIs use, the mosaics, and everything else.
// The ranges must match the @font-face rules in src/tokens/typography.css.
//
//   node scripts/subset-fonts.mjs <font.otf|ttf> <out-prefix>
//
// Writes <out-prefix>-latin.woff2, -other.woff2 and, if the font has any, -mosaic.woff2,
// and prints the -other unicode-range to copy into the CSS. HarfBuzz's subsetter keeps
// every layout feature (stylistic sets, alternates) and the hinting.
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { Blob, Face } from 'harfbuzzjs';
import subsetFont from 'subset-font';

const LATIN = 'U+0-17F, U+2000-206F, U+20A0-20CF, U+2100-214F, U+2190-22FF, U+25A0-25FF, U+2700-27BF';
const MOSAIC = 'U+2580-259F, U+1FB00-1FB3B, U+1CE51-1CE8F, U+EE00-EE7F';

const hex = (n) => n.toString(16).toUpperCase();

// 'U+0-17F, U+20AC' → the set of code points it covers.
export const parse = (ranges) =>
  new Set(
    ranges.split(',').flatMap((range) => {
      const [a, b = a] = range
        .trim()
        .slice(2)
        .split('-')
        .map((h) => parseInt(h, 16));
      return Array.from({ length: b - a + 1 }, (_, i) => a + i);
    }),
  );

// -other's range: its code points, merged over gaps so the rule stays short. A character
// in the range that the font lacks downloads -other for nothing, so a gap is merged only
// if it holds no Latin or mosaic code point the font lacks (✓ in Space Mono, say) and at
// most 1024 the font lacks elsewhere.
export function runs(other, cmap, ranged) {
  const out = [];
  for (const cp of [...other].sort((a, b) => a - b)) {
    const last = out.at(-1);
    let missing = 0;
    let blocked = false;
    if (last)
      for (let c = last[1] + 1; c < cp; c++)
        if (!cmap.has(c)) {
          missing++;
          blocked ||= ranged.has(c);
        }
    if (last && missing <= 1024 && !blocked) last[1] = cp;
    else out.push([cp, cp]);
  }
  return out.map(([a, b]) => `U+${hex(a)}${b > a ? `-${hex(b)}` : ''}`).join(', ');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [src, prefix] = process.argv.slice(2);
  const font = readFileSync(src);
  const face = new Face(new Blob(font));
  const cmap = new Set(face.collectUnicodes());
  // Every name the font has (licence, URLs, stylistic set labels); HarfBuzz keeps only 0–6.
  const preserveNameIds = [...new Set(face.listNames().map((n) => n.nameId))];
  const pick = (ranges) => new Set([...cmap].filter((cp) => ranges.has(cp)));
  const latin = pick(parse(LATIN));
  const mosaic = pick(parse(MOSAIC));
  const other = new Set([...cmap].filter((cp) => !latin.has(cp) && !mosaic.has(cp)));
  for (const [name, unicodes] of Object.entries({ latin, mosaic, other })) {
    if (!unicodes.size) continue;
    const text = String.fromCodePoint(...unicodes);
    writeFileSync(`${prefix}-${name}.woff2`, await subsetFont(font, text, { targetFormat: 'woff2', preserveNameIds }));
  }
  console.log(`${prefix}-other: unicode-range: ${runs(other, cmap, parse(`${LATIN}, ${MOSAIC}`))}`);
}
