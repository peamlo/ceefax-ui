# ADR-0022: Fonts ship as unicode-range subsets, with a budget for a Latin page

## Context

[ADR-0015](0015-minified-dist-and-brotli-size-budgets.md) budgets every entry point but left
`./fonts/*` out, and the fonts were the real weight. A page with both faces in both weights
downloaded 174 kB of woff2, 30 times the 5.4 kB brotli CSS core. Bedstead has 3,181 glyphs per
weight (Latin, Greek, Cyrillic, Hebrew, box drawing, mosaics), and a Latin page uses a few hundred.
The references are lighter: 98.css draws its look with about 13 kB of fonts, and Pico uses system
fonts. For the CSS, 98.css is 3.8 kB brotli and Pico 9 to 10 kB.

## Decision

`scripts/subset-fonts.py` splits every face into `-latin` (Latin-1, Latin Extended-A, and the
punctuation, currency, arrows, maths, shapes and ticks UIs use), `-mosaic` (Bedstead only, the
`Bedstead Mosaic` range) and `-other` (everything else). Each `@font-face` names one subset with
its `unicode-range`, so a browser downloads only the subsets a page's characters fall in. No glyph
is dropped. `-other`'s range is its code points merged into a few runs, which the script prints.
A run never spans a Latin character the font lacks: with no range, `-other` was downloaded for
every ✓ or ▼ set in Space Mono, which has neither.

`scripts/size.mjs` gets one font budget: the sum of the `-latin` files, which is what a Latin
page downloads in fonts. It's 89 kB, and the budget is 100 kB, so it catches a font regenerated
without subsetting. The woff2 bytes count as they are, since woff2 is already brotli.

The CSS budget stays an alarm, as ADR-0015 says. Its ceiling is Pico's size, about 10 kB brotli for
`./css`: a CSS-first library styling semantic HTML has no reason to be heavier than the reference
that does the same.

## Considered options

- **Latin-1 only in `-latin`**: 8 kB smaller for Bedstead, but the arrows, ticks and shapes the
  stories use would pull in the 37 kB `-other` file on most pages.
- **Drop the glyphs outside Latin**: the smallest package, but it loses Bedstead's Greek, Cyrillic
  and Hebrew, which teletext's national character sets need.
- **A budget per font file**: every new subset would need one, and the number that matters is
  what a page downloads.

## Consequences

- Amends ADR-0015: `./fonts/*` is no longer out of scope. The subset rules cost `./tokens` about
  200 B brotli, so its budget goes from 1,200 B to 1,500 B.
- The font file names change: `bedstead-3.261-regular.woff2` and the others are gone. A consumer
  who preloads or links a font by name must use the subset names. The mosaic preload is now about
  4 kB instead of 52 kB.
- Regenerating a font means running the script on each source (`fonts/README.md`). The ranges live
  in the script and in `src/tokens/typography.css`, and must match.
- `-other` is downloaded only for a character in its own range: Greek, Cyrillic, Hebrew, box
  drawing and the like.
