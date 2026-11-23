# Mosaic drawing library: prior art

Research note, 2026-11-19. It asks whether a library already does what the proposed mosaic drawing library would
do: a p5.js-shaped API (a setup and draw loop, `fill`, `rect`, `circle`, `line`, a frame counter) that draws into a
low-resolution grid of blocks and renders it as teletext **mosaics**, written as text, with at most two colours a
**cell** from the eight **authentic colours**. It builds on [`mosaic-logic-options.md`](mosaic-logic-options.md),
which already surveyed teletext editors and image converters; those aren't re-checked here.

## Summary

- **Does it exist? No.** Nothing found draws shapes into a 2×3-blocks-a-cell grid and writes the result as mosaic
  text, in the browser, with an ink and a background per cell chosen from the eight teletext colours.
- **The closest five each cover a different part:**
  - [Melker](https://github.com/wistrand/melker)'s canvas (MIT, TypeScript) has the drawing calls (`drawLine`,
    `fillCircle`, `fillRect`) and writes sextants with two colours a cell, but only into a terminal, as part of a
    terminal app framework, in any RGB colour.
  - [ratatui](https://github.com/ratatui/ratatui)'s `Canvas` (MIT, Rust) draws `Circle`, `Line` and `Rectangle` as
    sextants. With [ratzilla](https://github.com/ratatui/ratzilla) (Apache-2.0) it renders them as `<span>`s in a
    `<pre>` in the browser. It allows one colour a cell, and the last shape drawn recolours the whole cell.
  - [asciify-engine](https://github.com/ayangabryl/asciify-engine)'s `/headless` entry (MIT, TypeScript) turns a
    pixel buffer into sextants with two colours a cell and writes a `<pre>` with colour `<span>`s. It converts
    pictures; it has no `rect` or `circle`.
  - [`@techandsoftware/teletext`](https://teletext-for-javascript-docs.robdev.org.uk/teletext-screen-api.html)
    (AGPL-3.0) has `plot(x, y)` on the real 80×75 teletext grid, but no shapes, an SVG renderer, teletext bytes
    where a colour change takes up a cell, and a licence that can't go into this repo.
  - [textmode.js](https://github.com/humanbydefinition/textmode.js) (MIT build, private source) has the p5 shape
    (`draw()`, `frameCount`, `rect`, `ellipse`, per-cell character and background colour), but its shapes are
    measured in whole cells, not blocks, and it paints a WebGL2 canvas, not text.
- **The gap:** the combination. No candidate has more than three of the seven things the library needs (§1), and
  none writes **separated** mosaics (U+1CE51), which matches the earlier note. So the plan stays "build it", on top of
  the `./mosaic` conversion module that note recommends.
- **Worth studying (all MIT or Apache-2.0):** Melker's shape code and two-colour split, ratatui's shape and
  colour-per-cell code, asciify-engine's run-merging HTML writer, and ratzilla's DOM backend (§5). Shape drawing
  itself is textbook (line, circle and rectangle filling), so there's little to port.

## 1. What the library would need

Each candidate is checked against seven things. "Yes" means the project's own docs or source show it.

1. **A p5-style API:** a draw loop with a frame counter, a fill colour, and shapes (`rect`, `circle`, `line`) drawn by
   position and size.
2. **Blocks, not cells:** shapes land on a grid with 2×3 blocks a cell (80×75 for a 40×25 screen), and each cell
   becomes a contiguous mosaic (U+1FB00–U+1FB3B, `▌` `▐` `█`).
3. **Separated mosaics:** the same cell can be written as U+1CE51–U+1CE8F.
4. **Teletext colour:** at most two colours a cell, an ink and a background, both from the eight authentic colours.
   When two colours meet in a cell, the library decides what the cell shows.
5. **Text output:** a string (for a static site or server rendering) or live DOM with colour spans. Not a `<canvas>`.
6. **Web platform only:** runs in a browser, written in JS or TS, with no framework and no runtime dependencies.
7. **A licence that fits an MIT repo.**

## 2. The named candidates

**drawille** ([Python original](https://github.com/asciimoo/drawille)) draws dots in a terminal with braille
characters: `Canvas().set(x, y)`, a `Turtle`, and `frame()` to get the text. Braille cells are 2×4 dots with no
colour, and the licence is AGPL-3.0-or-later ([PyPI](https://pypi.org/project/drawille/), 0.2.0, Nov 2024).
**Different.**

**The JS ports.** [node-drawille](https://github.com/madbence/node-drawille) (MIT, 2.0.2, Oct 2022) has only `set`,
`unset`, `toggle`, `clear` and `frame()`, and its README sends you elsewhere for lines. Its sister package
[drawille-canvas](https://github.com/madbence/node-drawille-canvas) wraps it in part of the HTML canvas API
(`fillRect`, `moveTo`/`lineTo`, `arc`, `stroke`, `fill`, transforms) and returns braille from `toString()`, with a
browser example page. That's the right API shape: draw an arc, get a string. But it's braille, one colour, unmaintained
since 2022, and the npm entry says MIT while the repo has no LICENSE file. **Partial overlap: canvas-style drawing to a
text string.**

**notcurses** ([repo](https://github.com/dankamongmen/notcurses), Apache-2.0 per `COPYRIGHT`, v3.0.17 Oct 2025, pushed
to in Nov 2026) is a C terminal UI library. Its `NCBLIT_3x2` blitter turns an RGBA buffer into sextants. Each cell gets
two colours made by blending the pixels' colours, and a comment in `src/lib/blit.c` notes that having only a foreground
and a background loses some colour fidelity. The drawing calls in
`notcurses.h` (`ncplane_box`, `ncplane_hline_interp`, `ncplane_gradient`) work on whole cells. For a circle in
sextants you fill your own RGBA buffer and blit it. **Partial overlap: pixels to two-colour sextants, in C, in a
terminal.**

**chafa** ([repo](https://github.com/hpjansson/chafa), LGPL-3.0, 1.18.3 Sept 2026, very active) converts images to terminal
text. `--symbols sextant` limits it to sextants and `--colors 8` to eight colours, with a foreground and background a
cell. [chafa-wasm](https://github.com/hectorm/chafa-wasm) (LGPL-3.0, 0.3.3, 2.2 MB unpacked) runs it in a browser and
can write HTML. So chafa turns a PNG into eight-colour sextants, but you can't draw a circle with it, and its LGPL
licence makes copying code into this repo a no. **Partial overlap: image to sextants in eight colours.**

**p5.asciify** ([repo](https://github.com/humanbydefinition/p5.asciify), MIT, 0.10.3) is **archived**. You draw with
p5.js (1.8 or later, WEBGL mode only) and it converts the canvas to a grid of characters chosen by brightness or edges,
with a character colour and background colour a cell. Output is a WebGL canvas, with `.txt`, `.svg` and `.json` export.
A red circle comes out as a disc of whatever characters its brightness ramp holds, not as mosaics. Its author replaced it with textmode.js
(§3). **Partial overlap: p5 drawing turned into a character grid.**

**PICO-8** ([product page](https://www.lexaloffle.com/pico-8.php), [manual](https://www.lexaloffle.com/dl/docs/pico-8_manual.html))
is a closed-source fantasy console ($14.99): a 128×128 screen in 16 colours, Lua, a `_DRAW()` callback, `CLS`,
`RECT`, `CIRCFILL`, `LINE`. Its web export is an HTML and JS player that paints pixels. It has the API feel but none
of the output. **Different.**

**TIC-80** ([repo](https://github.com/nesbox/TIC-80), MIT, v1.4.1 Oct 2026) is an open-source fantasy console: a
240×136 screen with a 16-colour palette, a `TIC()` function called 60 times a second, and
[`cls`](https://github.com/nesbox/TIC-80/wiki/cls), [`rect`](https://github.com/nesbox/TIC-80/wiki/rect),
[`circ`](https://github.com/nesbox/TIC-80/wiki/circ) and [`line`](https://github.com/nesbox/TIC-80/wiki/line), all
taking a palette index. Any pixel can be any colour, and the result is a bitmap. **Different.** Like PICO-8, it's a
model for the API names and the "fixed palette by index" idea, not for the output.

## 3. Other candidates found

**textmode.js** ([repo](https://github.com/humanbydefinition/textmode.js),
[npm](https://www.npmjs.com/package/textmode.js), MIT, 0.18.2 Oct 2026, no dependencies, 921 kB unpacked) is the
closest thing to "p5 for text": `textmode.create()`, `t.draw(() => …)`, `t.frameCount`, `rect`, `ellipse`, `line`,
`triangle`, `arc`, and per cell a `char`, a `charColor` and a `cellColor` (ink and background). But its type
definitions give `rect(width, height)` in grid cells, so a circle is a ring of whole cells. It never samples 2×3 blocks
inside a cell. It needs WebGL2 and paints a canvas. The README says the published build is MIT and the TypeScript source
is in a private repository. **Partial overlap: the API shape.**

**Melker** ([repo](https://github.com/wistrand/melker), MIT, release 2026.7.1, last commit July 2026) is a terminal app
framework for Deno 2.5+ (Node 25 experimental). Its `<canvas onPaint="…">` element has `setPixel`, `drawLine`,
`drawRect`, `fillRect`, `drawCircle`, `fillCircle`, ellipses, polygons, SVG paths, text and images, each with a
`…Color` variant (`src/components/canvas.ts`). It renders sextants by default. For two colours in one cell,
`quantizeBlockColorsInline` (`canvas-render-sextant.ts`) splits the six blocks at the midpoint brightness and averages
each group. For example, a cell with two red, two yellow and two black blocks becomes yellow ink on a dark red
(127, 0, 0) background, a colour teletext doesn't have. It writes to a terminal only. **Partial overlap: the closest
drawing API with two-colour sextant output.**

**ratatui's Canvas, in the browser with ratzilla.** ratatui ([repo](https://github.com/ratatui/ratatui), MIT,
v0.30.2 June 2026) is a Rust terminal UI library. Its `Canvas` widget (`ratatui-widgets/src/canvas.rs`) draws shapes
(`circle.rs`, `line.rs`, `rectangle.rs`, `points.rs`, `map.rs`) with a `Marker`: braille, half block, quadrant,
**sextant** or octant. Its doc comment says the sextant grid holds a single foreground colour a cell, and each `paint`
sets the cell's colour. So when a red circle and a blue line share a cell, every lit block in it turns blue. ratzilla
([repo](https://github.com/ratatui/ratzilla), Apache-2.0, v0.3.1 June 2026) runs ratatui in the browser through
WebAssembly. Its `DomBackend` turns each cell into a `<span>` inside a `<pre>` (`src/backend/dom.rs`). That's a circle drawn as sextants in live DOM text, the nearest match to the proposal's
behaviour, but it needs Rust and a WASM build, and has no palette limit, no background per cell and no separated
mosaics. **Partial overlap: shapes to sextants to DOM spans.**

**asciify-engine** ([repo](https://github.com/ayangabryl/asciify-engine), MIT, 4.33.0 Nov 2026, 4.0 MB unpacked, four
runtime dependencies) is a large ASCII-art toolkit. Its `/headless` entry has `toBlockGrid(pixels, { mode: 'sextant',
color: true })` (`src/headless/blocks.ts`). It builds the same 64-entry table we use (U+1FB00 onwards, with ▌ ▐ █ for
21, 42 and 63). With colour on, the blocks lighter than the cell's mean become the ink and the rest the background,
each in its group's average colour, so the colours are averages, not palette entries. `gridToHtml` (`src/headless/format.ts`) writes a
`<pre>` and merges runs of cells that share colours into one `<span>`. No shape drawing: you hand it a picture. **Partial
overlap: the output half (pixel buffer to a mosaic HTML string).**

**`@techandsoftware/teletext`** ([npm](https://www.npmjs.com/package/@techandsoftware/teletext),
[repo](https://github.com/techandsoftware/teletext), AGPL-3.0-only, 1.3.1 Aug 2026) is a teletext page renderer
already described in the earlier note. Its [Screen API](https://teletext-for-javascript-docs.robdev.org.uk/teletext-screen-api.html)
has `plot(x, y)` and `plotPoints()` with coordinates from (0, 0) to (79, 74), the exact grid the proposal uses. But
you must first write a graphics colour control code at the start of each row, because it models teletext bytes. There
are no shapes, it renders SVG, and AGPL rules it out. **Partial overlap: plotting blocks on the teletext grid.**

**three.js `AsciiEffect`** ([source](https://github.com/mrdoob/three.js/blob/dev/examples/jsm/effects/AsciiEffect.js),
MIT, three 0.187.0) renders a 3D scene, reads its pixels and rebuilds the HTML of a `<table>` cell every frame, one
character a sample from the ramp `' .:-=+*#%@'`, optionally wrapping each in a `<span>` with an inline colour. No
blocks inside a cell, and it needs three.js. **Different**, but it shows the live-DOM output path is workable.

**rot.js** ([repo](https://github.com/ondras/rot.js), BSD-3-Clause, 2.2.1 Nov 2024) draws one character a cell with
`display.draw(x, y, ch, fg, bg)` on a canvas (or a terminal in Node). There are no blocks smaller than a cell.
**Different.**

**blessed-contrib** ([repo](https://github.com/yaronn/blessed-contrib), MIT, 4.11.1) is a Node terminal dashboard
kit. Its canvas widget wraps a drawille canvas (`lib/widget/canvas.js`), so its line charts are braille. It has 14
runtime dependencies. **Different.**

**Also checked and ruled out:**

- [textmode-city](https://github.com/gghostdadd/textmode-city) (MIT) is a browser app, not a library, that renders
  looping scenes as text art for VJ clips. Its teletext mode samples 2×3 dots a cell and draws them as rectangles on a
  canvas. The ink is picked from the teletext colours using the lit dots' average colour, and the background is
  always black.
- [stoatworks-labs/teletext](https://github.com/stoatworks-labs/teletext) (MIT, C++) is a Resolume video effect that
  encodes video as broadcast Level 1 teletext. Its README reports that its row encoder matches an exhaustive search
  for where to put colour codes. That solves the broadcast rule where a colour change takes up a cell, which ceefax-ui's mosaics don't have.
- [dapple](https://github.com/queelius/dapple) (MIT, Python) turns a NumPy bitmap into braille, quadrants or
  sextants in a terminal.
- [andorthehood/teletext](https://github.com/andorthehood/teletext) (MIT, 2016) renders teletext pages onto a canvas,
  and [react-teletext](https://github.com/andorthehood/react-teletext) (no licence file) is a one-line README.
- [CharDesk](https://github.com/Sayhi-bzb/CharDesk) and [ascii-canvas](https://github.com/jcubic/ascii-canvas) arrange
  text on a grid; neither has blocks smaller than a cell.
- The editors and converters in [`mosaic-logic-options.md` §4](mosaic-logic-options.md#4-existing-libraries-re-checked-as-an-editor-core)
  (TheMarco/teletext, zxnet, edit.tf, `image-to-sextants`, `sextants`, `img2teletext`, img2blocks) have no drawing API
  you call from code. That note's licence findings stand.

## 4. Comparison

| Project                                                                                                   | Licence                             | Last release / commit                   | Maintained       | Runs in                        | Depends on                                      | Drawing API                                                                    | Characters out                                     | Output to                                      | Colour per cell                                | Size                                | Verdict                                            |
| --------------------------------------------------------------------------------------------------------- | ----------------------------------- | --------------------------------------- | ---------------- | ------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- | ----------------------------------- | -------------------------------------------------- |
| [drawille](https://github.com/asciimoo/drawille) (Python)                                                 | AGPL-3.0+                           | 0.2.0, Nov 2024                         | Quiet            | Terminal                       | None                                            | `set(x, y)`, turtle                                                            | Braille                                            | Text string                                    | None                                           | n/a                                 | Different                                          |
| [node-drawille](https://github.com/madbence/node-drawille)                                                | MIT                                 | 2.0.2, Oct 2022                         | No               | Node                           | None                                            | `set`, `unset`, `toggle` only                                                  | Braille                                            | Text string                                    | None                                           | 6.6 kB unpacked                     | Partial overlap: points to a string                |
| [drawille-canvas](https://github.com/madbence/node-drawille-canvas)                                       | MIT on npm, no LICENSE file in repo | 1.2.1, 2022                             | No               | Node, browser                  | drawille, bresenham, earcut, gl-matrix          | Canvas subset: `fillRect`, `lineTo`, `arc`, `fill`, `stroke`                   | Braille                                            | Text string                                    | None                                           | 14 kB + 4 deps                      | Partial overlap: canvas-style API to a string      |
| [notcurses](https://github.com/dankamongmen/notcurses)                                                    | Apache-2.0                          | v3.0.17, Oct 2025; pushed Nov 2026      | Yes              | Terminal                       | C library                                       | Cell-level boxes and lines; blit your own RGBA buffer                          | Sextants, octants, quadrants, half blocks, braille | Terminal                                       | Two, blended from the pixels                   | C library                           | Partial overlap: pixels to two-colour sextants     |
| [chafa](https://github.com/hpjansson/chafa) / [chafa-wasm](https://github.com/hectorm/chafa-wasm)         | LGPL-3.0                            | 1.18.3, Sept 2026; wasm 0.3.3, Feb 2026 | Yes              | Terminal; browser via WASM     | C library; WASM module                          | None: image in, text out                                                       | Sextants (and many other symbol classes)           | ANSI text; HTML (wasm)                         | Two; `--colors 8` limits to eight              | wasm 2.2 MB unpacked                | Partial overlap: image to eight-colour sextants    |
| [p5.asciify](https://github.com/humanbydefinition/p5.asciify)                                             | MIT                                 | 0.10.3, Aug 2026                        | **Archived**     | Browser                        | p5.js ≥ 1.8, WEBGL mode                         | All of p5's (draw first, then convert)                                         | Any charset, by brightness or edges                | WebGL canvas; `.txt`/`.svg`/`.json` export     | Character colour + background, any RGB         | 464 kB + p5                         | Partial overlap: p5 drawing to a character grid    |
| [PICO-8](https://www.lexaloffle.com/pico-8.php)                                                           | Proprietary ($14.99)                | n/a                                     | Yes (commercial) | Own app; HTML/JS player export | Own runtime                                     | `_DRAW()`, `CLS`, `RECT`, `CIRCFILL`, `LINE` (Lua)                             | None                                               | 128×128 bitmap                                 | n/a: any pixel any of 16                       | n/a                                 | Different                                          |
| [TIC-80](https://github.com/nesbox/TIC-80)                                                                | MIT                                 | v1.4.1, Oct 2026                        | Yes              | Native app                     | Own runtime                                     | `TIC()`, `cls`, `rect`, `circ`, `line`                                         | None                                               | 240×136 bitmap                                 | n/a: any pixel any of 16                       | n/a                                 | Different                                          |
| [textmode.js](https://github.com/humanbydefinition/textmode.js)                                           | MIT (build only; source private)    | 0.18.2, Oct 2026                        | Yes              | Browser (WebGL2)               | None                                            | p5-like: `draw()`, `frameCount`, `rect`, `ellipse`, `line`, in **whole cells** | Any glyph you set per cell                         | WebGL2 canvas                                  | Character colour + cell colour, any RGB        | 921 kB unpacked (190 kB ESM bundle) | Partial overlap: the API shape                     |
| [Melker](https://github.com/wistrand/melker) canvas                                                       | MIT                                 | 2026.7.1, Jul 2026                      | Yes              | Terminal (Deno, Node 25)       | The Melker framework                            | `drawLine`, `fillRect`, `fillCircle`, ellipses, polygons, paths, text          | Sextants (default), quadrants, half blocks         | Terminal                                       | Two: brightness split, each side averaged      | Not measured                        | Partial overlap: drawing API + two-colour sextants |
| [ratatui](https://github.com/ratatui/ratatui) `Canvas` + [ratzilla](https://github.com/ratatui/ratzilla)  | MIT + Apache-2.0                    | v0.30.2 / v0.3.1, Jun 2026              | Yes              | Terminal; browser via WASM     | Rust toolchain                                  | `Circle`, `Line`, `Rectangle`, `Points`, `Map`                                 | Sextants, octants, quadrants, half blocks, braille | Terminal; `<span>`s in a `<pre>` (ratzilla)    | One; the last shape painted recolours the cell | Rust crates                         | Partial overlap: shapes to sextants to DOM         |
| [asciify-engine](https://github.com/ayangabryl/asciify-engine) `/headless`                                | MIT                                 | 4.33.0, Nov 2026                        | Yes              | Browser, Node, workers         | figlet, gifenc, gifuct-js, mediabunny (package) | None: pixel buffer in                                                          | Sextants, quadrants, half blocks, braille          | Text, ANSI, SVG, `<pre>` with colour `<span>`s | Two: lighter and darker halves, each averaged  | 4.0 MB unpacked                     | Partial overlap: pixel buffer to mosaic HTML       |
| [`@techandsoftware/teletext`](https://github.com/techandsoftware/teletext)                                | AGPL-3.0-only                       | 1.3.1, Aug 2026                         | Yes              | Browser, Node                  | None found                                      | `plot(x, y)`, `plotPoints()` on 80×75                                          | Teletext G1 mosaics                                | SVG; Unicode via `getText`                     | Teletext bytes: colour codes take a cell       | 42 kB minified                      | Partial overlap: plotting on the teletext grid     |
| [three.js `AsciiEffect`](https://github.com/mrdoob/three.js/blob/dev/examples/jsm/effects/AsciiEffect.js) | MIT                                 | three 0.187.0, Oct 2026                 | Yes              | Browser                        | three.js                                        | None: renders a 3D scene                                                       | ASCII ramp                                         | HTML in a `<table>`, optional colour `<span>`s | One, any RGB                                   | One file + three.js                 | Different                                          |
| [rot.js](https://github.com/ondras/rot.js)                                                                | BSD-3-Clause                        | 2.2.1, Nov 2024                         | Quiet            | Browser, Node                  | None                                            | `draw(x, y, ch, fg, bg)` per cell                                              | Whatever you pass                                  | Canvas; terminal                               | Foreground + background, any colour            | 2.6 MB unpacked                     | Different                                          |
| [blessed-contrib](https://github.com/yaronn/blessed-contrib)                                              | MIT                                 | 4.11.1, Nov 2026                        | Yes              | Node terminal                  | 14 deps, incl. a drawille canvas                | Chart widgets on a drawille canvas                                             | Braille                                            | Terminal                                       | One per widget                                 | Not measured                        | Different                                          |

How the five closest score against §1 (yes / partly / no):

| Need                                   | Melker                  | ratatui + ratzilla         | asciify-engine `/headless` | `@techandsoftware/teletext` | textmode.js                        |
| -------------------------------------- | ----------------------- | -------------------------- | -------------------------- | --------------------------- | ---------------------------------- |
| 1. p5-style shapes and loop            | Partly (paint callback) | Partly (shape structs)     | No                         | No (`plot` only)            | Yes                                |
| 2. 2×3 blocks to contiguous mosaics    | Yes                     | Yes                        | Yes                        | Yes                         | No (whole cells)                   |
| 3. Separated mosaics (U+1CE51)         | No                      | No                         | No                         | No (private use, see note)  | No                                 |
| 4. Ink + background from eight colours | Partly (two, any RGB)   | No (one colour, last wins) | Partly (two, any RGB)      | Partly (byte model)         | Partly (two, any RGB, whole cells) |
| 5. Text string or DOM spans            | No (terminal)           | Partly (DOM spans)         | Yes (string)               | No (SVG)                    | No (WebGL2 canvas)                 |
| 6. Browser, JS/TS, no runtime deps     | No (terminal framework) | No (Rust, WASM)            | Partly (four deps)         | Yes                         | Partly (WebGL2, private source)    |
| 7. MIT-compatible licence              | Yes                     | Yes                        | Yes                        | No (AGPL)                   | Yes (build only)                   |

"See note": per [`mosaic-logic-options.md` §4](mosaic-logic-options.md#4-existing-libraries-re-checked-as-an-editor-core),
its Unicode output uses Unscii private-use code points for separated mosaics.

## 5. What to reuse or study

The colour choice is where the candidates differ most, so it comes first.

**Colour choice when shapes meet in a cell.** Three approaches turned up:

- **Last shape wins** (ratatui): a red circle then a blue line through the same cell gives a blue cell. Simple and
  predictable, and the drawing order decides. There's no background colour.
- **Split by brightness, then average** (Melker, asciify-engine, notcurses): good for photos, but averaging invents
  colours. Red and black blocks average to dark red, which isn't one of the eight.
- **Nearest palette colour for the ink, fixed background** (textmode-city): stays in the eight colours, but every
  background is black.

For ceefax-ui, a colour change doesn't take up a cell (ink and background are `data-variant` and `data-band` on a
span), so each cell can be decided on its own. My estimate, not something a candidate does: every block already holds
one of the eight colours, so a cell can keep its two most common colours and repaint any other block with whichever of
the two is closer. Even trying all 28 pairs against six blocks is about 170 comparisons a cell, or 170,000 for a full
40×25 screen, cheap enough for every frame. Whether the library does that, last-wins or something else is a spec
decision.

**Licence-checked list:**

| What                                                      | Where                                                                                                                             | Licence                              | Use                                                                                                      |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Blocks to characters, both modes                          | The planned `./mosaic` module ([`mosaic-logic-options.md` §5](mosaic-logic-options.md#5-options-and-recommendation))              | MIT (ours)                           | **Build on it.** It's the library's last step.                                                           |
| Shape drawing into a pixel buffer, with a colour per call | Melker `src/components/canvas.ts` and `canvas-draw.ts`                                                                            | MIT                                  | Study; closest to port, since it's TypeScript. Keep the copyright notice if code is copied.              |
| Two-colour split for a cell                               | Melker `canvas-render-sextant.ts` (`quantizeBlockColorsInline`); asciify-engine `src/headless/blocks.ts` (`toBlockGrid`)          | MIT                                  | Study. Swap the averaging for a pick from the eight colours.                                             |
| Shapes on a sub-cell grid, colour per cell                | ratatui `ratatui-widgets/src/canvas.rs` (`PatternGrid`) and `canvas/circle.rs`, `line.rs`, `rectangle.rs`                         | MIT                                  | Study for the simplest clash rule and shape code.                                                        |
| HTML string with colour runs merged into spans            | asciify-engine `src/headless/format.ts` (`gridToHtml`)                                                                            | MIT                                  | Study. Emit `data-variant`/`data-band` instead of inline `style`.                                        |
| Live DOM grid of spans in a `<pre>`                       | ratzilla `src/backend/dom.rs`; three.js `AsciiEffect.js`                                                                          | Apache-2.0; MIT                      | Study for the live mode: ratzilla keeps a span per cell, `AsciiEffect` rewrites `innerHTML` every frame. |
| API names and draw loop                                   | textmode.js type definitions (`dist/types/textmode/extensions/*.d.ts`); TIC-80 and PICO-8 manuals                                 | MIT (build); MIT; proprietary (docs) | Read for naming only. textmode.js source isn't public.                                                   |
| Not reusable                                              | drawille (Python), `@techandsoftware/teletext`, chafa and chafa-wasm, PICO-8, plus the GPL/AGPL/CC BY editors in the earlier note | AGPL, AGPL, LGPL, proprietary        | Don't copy code. drawille-canvas has no LICENSE file in its repo, so treat it as read-only too.          |

Line, circle and rectangle filling on a pixel grid are textbook algorithms of a few dozen lines each, so porting buys
little. The real work is the parts no candidate has: the eight-colour ink and background choice, separated mosaics,
and output as `cf-mosaic` markup.

## 6. Not verified

- Whether asciify-engine's `/headless` entry pulls in any of the package's four dependencies (not checked).
- Whether node-drawille runs in a browser unchanged (it reads `process.stdout` for default sizes).
- How chafa picks the two colours of a cell in `--colors 8` mode (the option was confirmed, the algorithm wasn't read).
- That ratatui's `Canvas` with `Marker::Sextant` renders through ratzilla's `DomBackend` as expected. Both halves are
  confirmed from source, but the pair wasn't run.
- Whether notcurses has any pixel-level shape call: only cell-level ones turned up in `notcurses.h`.
- Whether Melker has any browser target: its README lists terminal requirements only.
- Whether textmode.js or its `textmode.export.js` add-on can export text; its description mentions only image and video.
- Sizes marked "not measured", and whether TIC-80 also runs in a browser.

## Sources

Checked on 2026-11-19 with `npm view` (licence, version, `time.modified`, dependencies, unpacked size), `gh api
repos/…` (licence, last push, archived, stars), `npm search` ("sextant", "block sextant", "teletext", "teletext
mosaic", "half block canvas", "braille canvas", "quadrant block", "halfblock", "textmode", "ascii canvas", "legacy
computing", "ceefax", "mosaic characters"), GitHub repository search ("sextant", "teletext", "mode 7 teletext",
"teletext art") and GitHub code search (`0x1FB00`, `0x1fb00`, `1FB00 sextant`, `0x1CE51` in JS and TS).

- drawille: README and [PyPI JSON](https://pypi.org/pypi/drawille/json); node-drawille and drawille-canvas READMEs.
- notcurses: README, `COPYRIGHT`, `include/notcurses/notcurses.h`, `src/lib/blit.c` (`hires_blit`, `sextant_blit`).
- chafa: `tools/chafa/chicle-options.c` (`--colors`, symbol classes); chafa-wasm README.
- p5.asciify README; textmode.js README, `examples/Textmode/create/sketch.js` and the published type definitions at
  `https://cdn.jsdelivr.net/npm/textmode.js@0.18.2/dist/types/`.
- PICO-8 product page and manual (specifications, `CIRCFILL`, `RECT`, `_DRAW`, HTML export); TIC-80 README and wiki
  pages `cls`, `rect`, `circ`, `line`, `TIC`.
- Melker README, `src/components/canvas.ts`, `canvas-render.ts`, `canvas-render-sextant.ts`.
- ratatui `ratatui-widgets/src/canvas.rs` and `canvas/`; ratzilla README and `src/backend/dom.rs`.
- asciify-engine README, `src/headless/blocks.ts`, `src/headless/format.ts`.
- `@techandsoftware/teletext` README and [Screen API](https://teletext-for-javascript-docs.robdev.org.uk/teletext-screen-api.html)
  ("Plot pixel graphics").
- three.js `examples/jsm/effects/AsciiEffect.js`; rot.js README; blessed-contrib README and `lib/widget/canvas.js`.
- textmode-city README and `index.html` (`dots()`); stoatworks-labs/teletext README; dapple README.
- In this repo: [`mosaic-logic-options.md`](mosaic-logic-options.md), [`CONTEXT.md`](../../CONTEXT.md) (Mosaic, Cell,
  Authentic colour).
