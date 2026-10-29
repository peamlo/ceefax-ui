# ADR-0014: The Screen frame is the authentic mode

## Context

The [teletext-fidelity review](../reviews/2026-10-27-teletext-fidelity.html) found the library
looks like teletext but follows few of its rules, starting with the glyphs: the display face
was VT323, a DEC VT320 _terminal_ font, not the SAA5050 character generator that drew real
teletext. Being faithful everywhere would cost the web basics (readable body sizes, a prose
measure, free colour), and most consumers build ordinary pages with a teletext look. So the
fidelity work needs one rule for where the teletext constraints apply.

## Decision

**Teletext-_styled_ by default; teletext-_constrained_ only inside the Screen frame**
([ADR-0009](0009-screen-frame-data-attr.md)). Outside the frame the library keeps the look
(authentic colours, the display face, fastext) and follows web conventions for everything you
read. Inside `.cf-page[data-frame]`, the teletext rules apply: the frame is where a page is
40 cells wide, set in the teletext character set, with teletext's colour limits.

**The display face is Bedstead** everywhere: headings, card titles, fastext keys. Bedstead
(Ben Harris, <https://bjh21.me.uk/bedstead/>) is a recreation of the Mullard SAA5050, so it
has the authentic glyph shapes, including the smoothed diagonals the chip produced. Both weights
ship, so the Screen frame can set its body text in Bedstead without another font change; body
text outside the frame stays Space Mono.

**Licence.** Bedstead's generator and all newly designed glyphs are public domain (CC0 1.0).
The SAA5050 shapes are believed to be public domain in the UK: CDPA 1988 s.55 limits protection
of an industrially produced typeface to 25 years, which ran out around 2005. In the US typeface
shapes are not copyrightable. Self-hosting it is therefore no more restrictive than the OFL
Space Mono ships under. Source, version and this reasoning are recorded in
[`fonts/README.md`](../../fonts/README.md).

## Considered options

- **Keep VT323** — already shipped, but the wrong lineage: its glyphs are a terminal's, not a
  teletext set's.
- **Teletext rules everywhere** — the most faithful, but body text at teletext sizes and a
  40-character measure is poor web reading, and every consumer would pay for it.

## Consequences

- VT323 is removed from the package and `--cf-font-display` now resolves to Bedstead. Nothing
  consumed VT323 by name yet, so this is not a breaking change.
- **Web conventions outside the frame** ([#71](https://github.com/peamlo/ceefax-ui/issues/71)).
  The type scale sits on an 8px grid (small 12 · body 16 · subheading 24 · heading 32 ·
  display-lg 48 · display-xl 72; small is the one 4px exception) and `--cf-content-max` is a
  ~65ch prose measure, not one teletext page. Only the Screen frame is 40 cells wide; it keeps
  scaling the type with its width. `<cf-canvas>` keeps its own 40ch cap so pixel art doesn't
  stretch to the prose measure (amends the cap in [ADR-0004](0004-cf-canvas-pixel-art.md)).
  `--cf-text-caption` is removed outright (use `small`): the library has no consumers yet, so
  a deprecation period would protect no one. Public tokens changed value or were removed, so
  this is a breaking change.
- Later fidelity tickets decide per rule whether it applies everywhere (a look) or only in the
  frame (a constraint), using this split.
- **Deferred:** if `<cf-canvas>` is kept alongside `cf-mosaic`, decide whether it takes the
  two-colours-per-cell limit inside the frame. Until then
  [ADR-0004](0004-cf-canvas-pixel-art.md) stands: free per-pixel colour.

## Amendment: the cell grid and colour rules ([#74](https://github.com/peamlo/ceefax-ui/issues/74))

**The cell grid.** Inside the frame a row is 40 **cells**. Bedstead's cell is 0.6em wide and 1em
tall (its own ascent and descent), so the type is sized to `cell / 0.6` and every line height is
1: a line box is exactly one cell, which is what lets colour runs and mosaics tile. The frame
sets text in a second face, `Bedstead Cell`: the same files with no metric overrides, because the
overrides that centre capitals outside the frame make the glyph box 1.1em tall. All text is
Bedstead in the frame (Space Mono's 0.612em advance would drift off the grid), and tracking is 0.
The type scale keeps its ratios, counted in cells: body 1, heading 2 and display-lg 3 cells high,
with small, subheading and display-xl at 0.75, 1.5 and 4.5, where nothing needs to tile.

**A one-cell margin, and rows measured where they are read.** The 40 cells sit inside a
one-cell margin on each side, like a set's safe area, so header, body and footer all start on the
same column (the header row's own padding is replaced by it). The frame is sized to its container
(never wider, so no sideways scroll in a narrow column such as Storybook Docs) and is a size
container itself: each slot takes its cell from it, 42 across. The body is the scroll region, and
a classic scrollbar takes about one cell, so a grid sized to the frame would wrap a 40-character
line at 39: the body is a size container too, its scrollbar gutter reserved up front so the
measurement is stable, and its children take their cells from its own content box. This replaces
[ADR-0009](0009-screen-frame-data-attr.md)'s `--_w` width property: the type no longer scales on
the frame element itself, so the `cqw` objection there doesn't apply.

**Cells are whole pixels.** Some platforms (Linux Chromium in CI) round glyph advances to whole
pixels, so a fractional cell can round up and wrap a 40-character line at 39. Where CSS `round()`
is supported the cell snaps down to a whole pixel: the row falls short of the edge by under 1px
per cell (under one cell in all), never past it. With a classic scrollbar the header's and body's
cells then usually come out the same size, so their columns line up.

**Authentic colours only.** The two off-palette aliases snap inside the frame, remapped like a
theme: `--cf-bg-2` to blue and `--cf-fg-dim` to green, never touching `--cf-base-*`. When the
Accessible theme applies to the frame or an ancestor it wins and the aliases keep its values. Like
the rest of the frame, none of this applies below the 40em breakpoint.
