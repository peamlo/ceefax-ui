# ADR-0004: `<cf-canvas>` — canvas pixel-art element and its char-grid source

## Context

The library needs a way to render teletext-style **pixel art** — headers, logos and
scenes like the classic Ceefax mosaics (palm tree, TELETEXTO logo, a tarot portrait).
This is the first *richer, logic-bearing* component whose shipping mechanism
[ADR-0001](0001-css-first-no-js-runtime.md) explicitly deferred ("it will get its own
ADR when the first such component is actually needed"). It is also render-only for
now: a **later** session adds a "paint it yourself" editor that must share the same
style and emit the same data.

Several questions had genuine alternatives:

1. **Rendering medium.** A CSS-only grid (one element or `box-shadow` per pixel) keeps
   the runtime-free core, but a near-full-screen scene is thousands of nodes/shadows —
   heavy, and it cannot be exported to an image or driven by a painter. `<canvas>` draws
   any resolution into one backing store and unlocks PNG-export and the future editor.
2. **Colour fidelity.** Authentic teletext could set only **one graphics colour per
   character cell** (a serial attribute). Faithful, but it cannot reproduce the example
   images and makes painting genuinely hard. The alternative is free per-pixel colour
   drawn from the same eight authentic colours.
3. **Data format.** How does a consumer supply the art? A JSON 2D array (precise but
   verbose, ugly in HTML, pushes JS onto a CSS-first consumer); a runtime-quantized PNG
   `src` (great for photos but heavy, non-deterministic, not diffable); or a
   newline-separated char-grid of palette codes (diffable, hand-authorable, matches
   `<cf-loader>`'s slotted-text idiom).

## Decision

**Ship it as a second opt-in Web Component, `<cf-canvas>`, under `./elements`** —
extending the `<cf-loader>` pattern rather than adding a framework runtime. This is the
concrete answer to ADR-0001's deferred question: richer components ship as opt-in custom
elements, and the CSS core stays runtime-free.

**Render with a real `<canvas>`** at the artwork's logical resolution, scaled up crisply
with `image-rendering: pixelated`. Rendered size is fluid and ADR-0003-consistent:
capped at `--cf-content-max`, with enumerated `data-size` tiers and a
`--cf-pixels-scale` CSS-variable escape hatch.

**Use free per-pixel colour** from the eight authentic `--ceefax-*` colours (read live,
never remapped) — *not* the one-colour-per-cell hardware constraint.

**The artwork is the element's text content**: newline-separated rows of single-char
[palette codes](../../CONTEXT.md) (`k r g y b m c w`, `.`/space = transparent). Parsing
lives behind a **source adapter** (`parseCharGrid`) that returns a normalised **Pixel
grid** `{ width, height, cells, transparent }` — the only shape the renderer knows.
Unknown codes render transparent with a single dev `console.warn`.

**Accessibility:** the canvas is genuinely opaque to assistive tech, so `alt` maps to
`role="img"` + `aria-label` on the host; no `alt` marks it `aria-hidden` (decorative).

## Consequences

- The CSS core stays JS-free; `<cf-canvas>` is a second opt-in element, so consumers who
  don't import `./elements/cf-canvas` pay nothing.
- The **source-adapter seam** is the key extension point: a future PNG-import or JSON
  source, and the future painter's serialiser, all target the same Pixel grid and
  char-grid string. The renderer never changes when a source is added.
- Free per-pixel colour departs from strict hardware authenticity by choice; a strict
  per-cell "authentic" mode, if ever wanted, would be an additive presentational variant
  and should get its own note.
- Sizing is pure CSS over one backing store, so `data-size`/`--cf-pixels-scale` need no
  redraw; only text-content changes trigger a re-render (via `MutationObserver`).
