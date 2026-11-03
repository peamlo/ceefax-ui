# Teletext mosaics Resources

## Knowledge

- [Unicode chart: Symbols for Legacy Computing, U+1FB00–1FBFF](https://www.unicode.org/charts/PDF/U1FB00.pdf)
  The primary source for the 60 contiguous sextants (`BLOCK SEXTANT-1` … `BLOCK SEXTANT-23456`). The name
  lists the lit positions, numbered 1–6 left to right, top to bottom. Use for: any code-point question.
- [Unicode chart: Symbols for Legacy Computing Supplement, U+1CC00–1CEBF](https://www.unicode.org/charts/PDF/U1CC00.pdf)
  Unicode 16.0 added the separated sextants at U+1CE51–1CE8F (`SEPARATED BLOCK SEXTANT-1` … `-123456`),
  all 63, with no gaps. Use for: the separated look.
- [UnicodeData.txt (16.0)](https://www.unicode.org/Public/16.0.0/ucd/UnicodeData.txt)
  Plain-text names for every code point; `grep 1FB13` beats reading the PDF. Use for: checking a single
  character's name quickly.
- [NamesList.txt (16.0)](https://www.unicode.org/Public/16.0.0/ucd/NamesList.txt)
  The chart's text in order, with block headings ("Block mosaic terminal graphic characters"). Reading the
  sextant list shows the skipped patterns directly. Use for: lesson 2's primary read.
- [DerivedAge.txt (16.0)](https://www.unicode.org/Public/16.0.0/ucd/DerivedAge.txt)
  The Unicode version that added each code point: Block Elements 1.1, sextants 13.0. Use for: "when / why is
  this character elsewhere" questions.
- [Bedstead, by Ben Harris](https://bjh21.me.uk/bedstead/)
  The font cf-mosaic uses: outlines of the SAA5050 teletext character generator (BBC Micro MODE 7), with
  the mosaics at standard Unicode code points and in private use at U+EE00–EE7F. CC0. Use for: why the
  glyphs look and tile the way they do.
- [Teletext Wiki: Teletext art](https://teletext.wiki.zxnet.co.uk/wiki/Teletext_art)
  How teletext artists worked: 2×3 "sixels" per cell, 64 patterns, eight colours set by control
  characters. Use for: the authentic constraints behind the component.
- MDN: [white-space](https://developer.mozilla.org/en-US/docs/Web/CSS/white-space),
  [line-height](https://developer.mozilla.org/en-US/docs/Web/CSS/line-height),
  [letter-spacing](https://developer.mozilla.org/en-US/docs/Web/CSS/letter-spacing),
  [display](https://developer.mozilla.org/en-US/docs/Web/CSS/display). Use for: the five declarations in
  `mosaic.css` (lesson 4). The white-space values table is the one to read.
- In this repo: [ADR-0021](../adr/0021-text-mosaics-replace-pixel-canvas.md),
  [`src/components/mosaic.css`](../../src/components/mosaic.css),
  [`stories/_mosaic.js`](../../stories/_mosaic.js) (pixels → characters in 30 lines), the Mosaic docs page
  in Storybook, and [`docs/reference/zxnet-teletext.md`](../reference/zxnet-teletext.md).

## Wisdom (Communities)

- [Teletext Wiki](https://teletext.wiki.zxnet.co.uk/wiki/Main_Page) and the zxnet community around it
  (the [teletext editor](https://zxnet.co.uk/teletext/editor/), the reference for the project's planned live editor,
  and gallery). Use for: checking art against
  how real pages were drawn.
- Not yet chosen: a live forum. Ask Pedro whether they want one before proposing it.

## Gaps

- No high-trust source yet on how browsers pick a font per character (`unicode-range`, fallback); MDN's
  `@font-face` pages are the likely candidate for the font-loading lesson.
