# ADR-0020: Text mosaics replace the pixel canvas, and art is drawn in the zxnet editor

## Context

[ADR-0004](0004-cf-canvas-pixel-art.md) added `<cf-canvas>` for teletext-style pixel art: a JS
custom element drawing free per-pixel colour on a `<canvas>`. [ADR-0011](0011-pixel-canvas-follows-theme.md)
made it follow the theme. A prototype ([#75](https://github.com/peamlo/ceefax-ui/issues/75)) compared it
with text mosaics on performance, DX, accessibility and authenticity. Mosaics are the real teletext
mechanism, sit on text rows, follow the theme through CSS and need no JS. The canvas's only unique
ability, more than two colours per cell, isn't authentic. Its costs: the library's second JS element, a
per-element observer on the whole document, `palette.js` to mirror the CSS colours, and style recalcs that
grow faster than the element count (1000 canvases: 493 ms vs 21 ms for mosaics).

## Decision

Teletext graphics are text mosaics (`cf-mosaic`): Bedstead mosaic glyphs coloured with `data-variant`
and `data-band`, at most two colours per cell. `<cf-canvas>` and `palette.js` are removed, with no
deprecation release, because the library has no consumers yet. A mosaic is a picture: it keeps its
colours under forced colours, on its own `--cf-bg` background. Its font face blocks instead of swapping,
so cells never show tofu. Art is authored in the [zxnet teletext editor](https://zxnet.co.uk/teletext/editor/),
not in a format of the library's own.

## Considered options

- **Keep both**: the canvas for pictures, mosaics for text-row graphics. Rejected: two systems for the
  same output, and the canvas's extra colours are what teletext couldn't do.
- **Make `<cf-canvas>` output mosaics**: keeps the JS element and its observers for no gain over writing
  the markup.
- **Deprecate for one release first**: no consumers to warn.

## Consequences

- Supersedes ADR-0004 and ADR-0011, including ADR-0004's planned "paint it yourself" editor and PNG
  export: the zxnet editor replaces both. Amends [ADR-0008](0008-cf-base-token-tier.md) (the canvas no
  longer names `--cf-base-*`) and [ADR-0014](0014-screen-frame-is-the-authentic-mode.md) (its deferred
  canvas question is closed, and the canvas's 40ch cap goes with it). Where ADR-0006 and ADR-0015 name the
  canvas, `parseCharGrid` or the palette-drift guard, read it as history.
- `./elements` keeps only `<cf-loader>`.
- Pictures that need more than two colours per cell must be redrawn on whole cells, as teletext artists did.
- Authoring and PNG export come from the zxnet editor; the library ships neither.
- A banded mosaic run reads the band ink like any other banded part
  ([ADR-0017](0017-bands-background-attribute-and-ink-tier.md)), so under the Accessible theme its ink is
  black on the band: shapes keep their contrast, and text on a mosaic band stays readable.
- Pinned by `Components/Mosaic`, whose forced-colours check runs in the test-runner's `postVisit`.
