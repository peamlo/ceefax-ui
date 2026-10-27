# ADR-0014: The Screen frame is the authentic mode

## Context

The [teletext-fidelity review](../reviews/2026-10-27-teletext-fidelity.html) found the library
looks like teletext but follows few of its rules, starting with the glyphs: the display face
was VT323, a DEC VT320 *terminal* font, not the SAA5050 character generator that drew real
teletext. Being faithful everywhere would cost the web basics (readable body sizes, a prose
measure, free colour), and most consumers build ordinary pages with a teletext look. So the
fidelity work needs one rule for where the teletext constraints apply.

## Decision

**Teletext-*styled* by default; teletext-*constrained* only inside the Screen frame**
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

- VT323 is removed from the package. Anyone naming `'VT323'` directly loses it; the
  `--cf-font-display` token now resolves to Bedstead.
- Later fidelity tickets decide per rule whether it applies everywhere (a look) or only in the
  frame (a constraint), using this split.
- **Deferred:** if `<cf-canvas>` is kept alongside `cf-mosaic`, decide whether it takes the
  two-colours-per-cell limit inside the frame. Until then
  [ADR-0004](0004-cf-canvas-pixel-art.md) stands: free per-pixel colour.
