# ADR-0011: Pixel canvas art follows the theme through `--cf-variant-*`

## Context

[ADR-0004](0004-cf-canvas-pixel-art.md) had `<cf-canvas>` read the authentic colours
"live, never remapped", and [ADR-0010](0010-accessible-theme-variant-alias-tier.md) kept
that: under `[data-theme="accessible"]` every component recoloured except pixel art. In
practice a page switched to the accessible theme still showed authentic red, green and blue
wherever it had a canvas. That looked like a missed spot, and authentic blue fails contrast
on black anyway.

## Decision

**The canvas resolves palette codes `r g y b m c` through the `--cf-variant-*` tier**, the
same remappable colours `data-variant` blocks use. It falls back to `--cf-base-*` when no
variant token exists (black and white, which no theme changes) and then to the fixed hex
when there is no stylesheet. One theme block therefore recolours blocks and pixel art alike.

Canvas pixels don't follow the cascade, so each canvas also watches `data-theme` changes on
the document (any ancestor) and repaints.

## Considered options

- **A separate `--cf-pixel-*` tier** — lets pixel art have its own themed palette (e.g. a
  darker blue to keep yellow-on-blue crisp), at the cost of eight more tokens per theme.
  Not needed yet; it can be added later without changing the char-grid format.
- **Keep pixel art authentic** — the ADR-0010 position, reversed here.

## Consequences

- Supersedes ADR-0004's "never remapped" for the canvas and ADR-0010's "pixel art stays
  authentic". `--cf-base-*` itself is still never remapped.
- The accessible palette is tuned for contrast against black, not between its own colours:
  the wordmark's yellow on blue drops from ~8:1 to ~2:1. Accepted. Meaningful art carries
  `alt`, and a `--cf-pixel-*` tier is the upgrade path if it matters.
- Pinned by the `Components/Pixel canvas` "All colours" story, which reads the drawn pixels
  under each theme and checks the repaint when `data-theme` is toggled on an ancestor.
