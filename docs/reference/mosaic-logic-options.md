# Mosaic logic: where it lives, and whether a library already does it

Research note, 2026-11-03, revised the same day after the maintainer corrected the workflow. It asks where
the conversion between pixel art, 2×3 block sums and Unicode sextants should live, what a consumer such as
an Astro blog pays for mosaics, and whether `stories/_mosaic.js` reinvents an existing library.

## Summary

- **How mosaics are made.** Every mosaic in the project so far was generated, either by
  `stories/_mosaic.js` or by an agent asked for the characters. A **live mosaic editor** is planned as a
  future project, with the [zxnet teletext editor](https://zxnet.co.uk/teletext/editor/) as its reference.
  The docs no longer tell anyone to draw in zxnet and paste (§3).
- **For an Astro blog** a mosaic is static text: no JavaScript in the browser, one shared font file and a
  few bytes of HTML a cell. Pasting or hand-writing characters needs no code. Generating them from pixel
  rows today means copying about 25 lines out of the stories, which is the duplication to remove (§3).
- **Recommendation: option (b), one shared module.** Put the conversion in one pure ES module in `src/`
  (for example `src/mosaic/cells.js`) with four functions:
  - `cell(bits, separated)` and its inverse `bitsOf(char)`;
  - `toMosaic(pixels, separated)` and its inverse `fromMosaic(text)`.

  The editor and the stories import it. Runtime consumers get it as an opt-in `./mosaic` export with its own
  size budget. A sketch of all four functions is about 460 B brotli minified and 560 B as unminified source.
  The editor itself starts as a published tool page, not part of the npm package. Image import belongs in the
  editor.

- **No library is worth adopting as the editor's core.** Every candidate is GPL, AGPL, CC BY or has no
  licence. All of them model teletext bytes, where colour changes are control codes that take up a cell,
  instead of ceefax-ui's Unicode characters plus `data-variant`/`data-band`. None writes separated sextants
  at U+1CE51.
  - Worth studying for the editor's UX and image import: [TheMarco/teletext](https://github.com/TheMarco/teletext)
    (CC BY 4.0) and the zxnet editor.
  - Worth porting for image import quality: [`sextants`](https://github.com/rob-smallshire/sextants) (MIT,
    Python).

## 1. Today: where the logic is

`grep -rn -i "0x1fb00\|0x1ce51\|fromCodePoint"` across this checkout (excluding `node_modules`), and the
same grep across every worktree under `.claude/worktrees/`, finds:

| Where                                                                           | What                                                                                                                                                                                                                                | Used by                                                             |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| [`stories/_mosaic.js`](../../stories/_mosaic.js)                                | `cell(bits, separated)`, `toMosaic(pixels, separated)`, `rule()`, `lettering()`, `logo()`, plus the `ART` and `FONT` data                                                                                                           | [`stories/Mosaic.stories.js`](../../stories/Mosaic.stories.js) only |
| `docs/learn-mosaics/assets/kit.js`                                              | `char(sum, separated)`, the same formula as `cell()`, plus its inverse `sum(ch)`, and DOM widgets. A classic script, not a module, "so lessons work opened straight from disk". It is uncommitted, in the `issue-52` worktree only. | the teaching lessons                                                |
| `stories/Mosaic.stories.js`                                                     | `assertSeparated()` checks the U+1CE51–1CE8F range. It's a test, not a conversion.                                                                                                                                                  | the story's `play()`                                                |
| `README.md`, the `DOCS` constant in the stories, `mosaic.css`, `typography.css` | The formula in prose, and the code-point ranges (`unicode-range`).                                                                                                                                                                  | humans and the font face                                            |

The other matches are the same files on other branches' worktrees, or code points written as prose in the
lessons. No library code (`src/`), demo page (`demo/`) or script (`scripts/`) converts mosaics. So there
are **two implementations of the formula**: the stories (one direction) and the lessons' kit (both
directions).

The formula checks out against the Unicode Character Database
([UnicodeData.txt 16.0](https://www.unicode.org/Public/16.0.0/ucd/UnicodeData.txt)):

- U+1FB00 is `BLOCK SEXTANT-1` (sum 1).
- U+1FB13 is `BLOCK SEXTANT-35` (4 + 16 = 20).
- U+1FB14 is `BLOCK SEXTANT-235` (22). Sum 21, blocks 1+3+5, is skipped because it's `LEFT HALF BLOCK`
  U+258C.
- U+1FB3B is `BLOCK SEXTANT-23456` (62).
- U+1CE51 to U+1CE8F are `SEPARATED BLOCK SEXTANT-1` to `-123456`, all 63 with no gaps.
- [DerivedAge.txt](https://www.unicode.org/Public/16.0.0/ucd/DerivedAge.txt) dates U+1FB00.. to Unicode 13.0
  and U+1CD00..1CEB3 to Unicode 16.0.

## 2. Who needs the conversion

| Consumer                  | Direction                                                                                    | Contiguous / separated | Notes                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------- | -------------------------------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The planned mosaic editor | pixels → characters (export); characters → pixels (reopen existing markup, toggle separated) | both                   | Also image → pixels (import, later) and colour runs → `data-variant`/`data-band` spans. Both of those are editor-only.                                                                                                                                                                                                                                               |
| Stories                   | pixels → characters                                                                          | both                   | `rule()`, `lettering()` and `logo()` are story content built on top, not conversion.                                                                                                                                                                                                                                                                                 |
| Lessons (`kit.js`)        | both                                                                                         | both                   | A classic script so it opens from `file://`, so it can't `import` a module. If the lessons are served (GitHub Pages, a dev server), it can switch to `<script type="module">` and import the shared module.                                                                                                                                                          |
| Runtime consumers         | pixels → characters                                                                          | both                   | Charts, sparklines, rules sized to data. The simple cases need only `█`, `▌` or one repeated character (the **Bar chart** story). The roadmap's chart components ([#16](https://github.com/peamlo/ceefax-ui/issues/16), [#17](https://github.com/peamlo/ceefax-ui/issues/17), [#18](https://github.com/peamlo/ceefax-ui/issues/18)) are specced in CSS, not mosaics. |

With an editor planned, the conversion has **at least three in-repo users in both directions**. That's what
changes the earlier answer: one shared module beats three hand-kept copies.

## 3. Using mosaics in an Astro blog

An Astro page renders on the server or at build time, so a mosaic reaches the browser as finished HTML:

```astro
<span class="cf-mosaic" role="img" aria-label="A red heart" data-variant="red">🬻🬺█🬓
🬁🬬🬆 </span>
```

**Performance.**

- **JavaScript:** none. `cf-mosaic` is CSS on characters (ADR-0001, ADR-0021).
- **CSS:** `cf-mosaic` is part of `./css`, 5.1 kB brotli for the whole library today (`node scripts/size.mjs .`).
- **Font:** mosaics use Bedstead, `bedstead-3.261-regular.woff2`, 52 kB. It's the same file the display face
  (`--cf-font-display`) uses, so a page with headings in Bedstead downloads it once. The mosaic face blocks
  while it loads (the browser gives up after about 3 s), so cells stay blank rather than showing tofu, and
  text keeps `swap`. Preload it on pages with mosaics (README → Mosaic).
- **Rendering:** a mosaic is one inline text box. ADR-0021's prototype measured 21 ms of style recalculation
  for 1000 mosaics, against 493 ms for 1000 of the canvases it replaced.
- **Bytes:** each cell is one 4-byte UTF-8 character (`▌ ▐ █` are 3), so a full 40 × 25 screen is about
  4 kB of HTML before compression.

**Duplicated code.**

- **Characters written in the page** (pasted, or generated once by an agent or a script): no code at all.
- **Characters generated from pixel rows** (data at build time, a rule sized to its content): the
  conversion isn't exported, so today you'd copy `cell()` and `toMosaic()` (about 25 lines) out of
  `stories/_mosaic.js`. That's the duplication to fix. With the `./mosaic` export recommended in §5,
  the Astro frontmatter imports it, runs at build time, and the browser gets 0 bytes of JS:

  ```astro
  ---
  import { toMosaic } from '@peamlo/ceefax-ui/mosaic';
  const heart = toMosaic(['.##.##..', '#######.', '#######.', '.#####..', '..###...', '...#....']);
  ---
  <span class="cf-mosaic" aria-hidden="true" data-variant="red">{heart}</span>
  ```

- **Mosaics that change in the browser** (live data): the same import inside a `<script>`, about 0.5 kB
  brotli.
- **Bars and rules** need no conversion at all: `'█'.repeat(n)`, `▌` for a half, or one repeated character
  (the **Bar chart** story).

**Docs.** The zxnet "draw and paste" wording is gone from the README, the Mosaic docs page,
`stories/_mosaic.js`, `typography.css`, ADR-0021 (its title, decision and consequences), its index entry
and ADR-0004's banner. zxnet appears only as the reference for the future editor (ADR-0021 and
[`zxnet-teletext.md`](zxnet-teletext.md)). Its editor couldn't have been the workflow anyway: its exports
(TTI, EP1, TTX, BIN, BBC, T42, PNG, GIF, edit.tf, viewdata) and clipboard copy are teletext bytes, not
Unicode ([`editor.js`](https://zxnet.co.uk/teletext/editor/editor.js), fetched 2026-11-03).

## 4. Existing libraries, re-checked as an editor core

Checked on 2026-11-03 with npm (`npm view`, `npm search` for "sextant", "block sextant", "legacy computing",
"teletext"), GitHub code search (`0x1CE51`, `0x1fb00 sextant`), the repos and package pages below, and the
tarballs and source where noted. An editor core would need four things:

- pixels ↔ characters, contiguous **and separated** (U+1CE51);
- a per-cell ink and band model that maps to `data-variant`/`data-band`;
- a licence that can sit in an MIT repo;
- no runtime cost to the CSS package.

| Project                                                                                                                                                              | What it is                                                                                                                                                                                                                                                                                                               | Licence                                                                                                          | Maintenance                       | Size                           | Separated at U+1CE51                               | ▌ ▐ █ for 21/42/63 | As an editor core                                                                                                                                                                                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------ | -------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [TheMarco/teletext](https://github.com/TheMarco/teletext)                                                                                                            | TypeScript teletext suite: a browser WYSIWYG editor (paints individual 2×3 sub-blocks), a renderer, T42/TTI import and export, bitmap import (monochrome, two-colour, full colour), and a "smart row compiler" that turns per-cell colours into control codes. Its ANSI renderer uses the same `0x1FB00` offset formula. | **CC BY 4.0** (not a software licence)                                                                           | Last push March 2026, 23 stars    | ≈9,400 lines of TS             | **No**: "approximate separated mosaics by dimming" | Yes                | **No.** The model is teletext bytes (control codes take up cells), there's no U+1CE51 support, and the licence is unusual for code. **Best UX reference:** its sub-block painting, bitmap import pipeline (resize → 8-colour quantise → 2×3 cells → colour runs) and row compiler are the closest thing to the planned editor. |
| [zxnet editor](https://zxnet.co.uk/teletext/editor/)                                                                                                                 | The reference editor: Level 1/2.5 pages, state in the URL hash, the exports listed in §2.                                                                                                                                                                                                                                | No licence published (the [wiki page](https://teletext.wiki.zxnet.co.uk/wiki/Zxnet_teletext_editor) states none) | Live                              | 249 kB `editor.js`             | n/a (bytes)                                        | n/a                | **No**: no licence, byte model. **UX reference** for tools, keyboard control and URL state.                                                                                                                                                                                                                                    |
| [edit.tf](https://github.com/rawles/edit.tf)                                                                                                                         | The editor zxnet's descends from. Raw and TTI export, and a documented URL hash format.                                                                                                                                                                                                                                  | GPL-3.0                                                                                                          | Last push Sept 2025               | Web app                        | n/a                                                | n/a                | **No** (GPL). Its documented hash is the format to read if the editor ever imports zxnet or edit.tf pages.                                                                                                                                                                                                                     |
| [`@techandsoftware/teletext`](https://www.npmjs.com/package/@techandsoftware/teletext) ([repo](https://github.com/techandsoftware/teletext))                         | Teletext page renderer (SVG). `loadPageFromEncodedString()` reads edit.tf and zxnet hashes. `getText(true)` outputs Unicode text.                                                                                                                                                                                        | **AGPL-3.0-only**                                                                                                | Active (1.3.1, Aug 2026)          | 42 kB minified, 13.5 kB brotli | **No**: Unscii private use (U+E0C1…)               | Yes                | **No**: AGPL, a renderer and not an editor, and no U+1CE51.                                                                                                                                                                                                                                                                    |
| [`@techandsoftware/image-to-sextants`](https://www.npmjs.com/package/@techandsoftware/image-to-sextants) ([source](https://bitbucket.org/rahardy/image-to-sextants)) | Grayscale buffer → G1 bytes or Unicode sextants: threshold at 127, then a 64-entry table. Same bit order as ours.                                                                                                                                                                                                        | **GPL-2.0-or-later**                                                                                             | 1.0.0 only (June 2022)            | 5.6 kB source, 1.75 kB brotli  | **No**                                             | Yes                | **No**: GPL, contiguous only, and a plain threshold, which is no better than the canvas `getImageData` + `toMosaic` the editor would do anyway.                                                                                                                                                                                |
| [`sextants`](https://pypi.org/project/sextants/) ([repo](https://github.com/rob-smallshire/sextants))                                                                | Python: image → teletext/viewdata mosaics with an optimal per-row dynamic-programming solver (two colours a cell), from Kieran Connell's image2teletext.                                                                                                                                                                 | MIT                                                                                                              | 0.5.0, all releases on 2026-08-22 | Python package                 | No (raw page bytes)                                | n/a                | **Not a core**, but its MIT algorithm is the one to **port** if image import needs quality beyond a threshold.                                                                                                                                                                                                                 |
| [`img2teletext`](https://www.npmjs.com/package/img2teletext) ([repo](https://github.com/andorthehood/img2teletext))                                                  | Node CLI: image → Level 1 teletext data in 2×3 blocks.                                                                                                                                                                                                                                                                   | MIT                                                                                                              | 5.0.0 (Aug 2025)                  | 44 kB, 5 deps                  | No (bytes)                                         | n/a                | **No**: a Node CLI with image-decoder dependencies, and its output is bytes.                                                                                                                                                                                                                                                   |
| [img2blocks](https://scruss.com/blog/2025/07/31/img2blocks/) ([gist](https://gist.github.com/scruss/b064a667cebecf31e4896f92659505e1))                               | Python + PIL: bitmap → sextant text through a 64-entry table.                                                                                                                                                                                                                                                            | Not stated                                                                                                       | Blog post, 2025                   | A script                       | No                                                 | Yes                | No.                                                                                                                                                                                                                                                                                                                            |
| [chafa](https://hpjansson.org/chafa/) ([repo](https://github.com/hpjansson/chafa))                                                                                   | Terminal image renderer. Its `sextant` symbol class generates U+1FB00–1FB3B (`chafa-symbols.c`).                                                                                                                                                                                                                         | LGPL-3.0                                                                                                         | Very active                       | C library                      | No                                                 | own block class    | No: C, terminals.                                                                                                                                                                                                                                                                                                              |
| [notcurses](https://github.com/dankamongmen/notcurses)                                                                                                               | Terminal UI library. `NCBLIT_3x2` is a sextant blitter.                                                                                                                                                                                                                                                                  | Apache-2.0 (per `COPYRIGHT`)                                                                                     | Active                            | C library                      | No                                                 | Yes                | No: C, terminals.                                                                                                                                                                                                                                                                                                              |
| [ratatui](https://github.com/ratatui/ratatui)                                                                                                                        | Rust TUI. `symbols::Marker::Sextant` draws charts on a 2×3 grid.                                                                                                                                                                                                                                                         | MIT                                                                                                              | Very active                       | Rust crate                     | No                                                 | Yes                | No: Rust, terminals.                                                                                                                                                                                                                                                                                                           |
| [drawille](https://www.npmjs.com/package/drawille) ([repo](https://github.com/madbence/node-drawille))                                                               | Pixel canvas → **braille** (2×4).                                                                                                                                                                                                                                                                                        | MIT                                                                                                              | 2.0.2 (Oct 2022)                  | 6.6 kB                         | No                                                 | No                 | No: braille.                                                                                                                                                                                                                                                                                                                   |
| [ZVBI](https://github.com/zapping-vbi/zvbi) (`src/lang.c`)                                                                                                           | Teletext decoder. G1 mosaics are "not representable in Unicode, translated to private code U+EE00 ... U+EE7F".                                                                                                                                                                                                           | GPL-2.0 / LGPL                                                                                                   | Active                            | C library                      | Private use only                                   | Private use only   | No. It's the origin of Bedstead's U+EE00 copy.                                                                                                                                                                                                                                                                                 |

GitHub code search for `0x1CE51` finds only terminal emulators drawing the glyphs (kitty, VTE, mintty,
SyncTERM). **Nothing outside ceefax-ui converts to separated sextants at U+1CE51.** Those code points
arrived in Unicode 16.0 (2024), and older tools predate them: ttxcat's
[README](https://codeberg.org/vilcans/ttxcat) still says "there are no Unicode characters for them". Every
existing editor also stores teletext bytes, where a colour change costs a cell. ceefax-ui's model is
characters plus `data-variant`/`data-band` spans, so even a permissively licensed teletext editor would
need its model rewritten. Building the editor on our own module and borrowing UX ideas is less work than
adapting one.

**Did we reinvent a wheel?** Only the cell lookup, and no version of it fits: no licence-compatible,
maintained JS package covers both contiguous and separated. Our arithmetic form is also smaller than
everyone else's 64-entry table.

## 5. Options and recommendation

The question now: where does the conversion live so that the editor, the stories and runtime consumers
share one implementation?

|               | (a) Stories only, formula documented                    | (b) One shared module in `src/`, opt-in `./mosaic` export                                                                                                                                                                           | (c) Depend on a library       |
| ------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Copies        | Stories + kit + editor = 3, two of them both directions | 1, plus kit's until the lessons are served                                                                                                                                                                                          | 1 + glue, still no U+1CE51    |
| Package bytes | 0                                                       | ≈ 460 B brotli minified, ≈ 560 B as shipped source (sketch with `cell`, `bitsOf`, `toMosaic`, `fromMosaic`). `./css` stays 0 bytes of JS.                                                                                           | 1.75–13.5 kB brotli           |
| ADR-0001      | Fine                                                    | A pure, side-effect-free function module is a new kind of opt-in JS export. ADR-0001 left "logic-bearing" JS to a future ADR, and this is that ADR. Not in the `./elements` barrel: that barrel registers elements (`sideEffects`). | A JS runtime dependency       |
| ADR-0015      | n/a                                                     | New entry point, new budget line in `scripts/size.mjs` (1000 B leaves room)                                                                                                                                                         | Budget for a dependency       |
| ADR-0021      | Fine                                                    | Fine: the conversion module is a primitive, not an authoring tool, and the editor stays outside the package.                                                                                                                        | Same, plus licence            |
| Licence       | MIT                                                     | MIT                                                                                                                                                                                                                                 | GPL / AGPL / CC BY: ruled out |

**Recommendation: (b).** One module, used by everything:

- **Where:** `src/mosaic/cells.js` (or similar). It's pure ESM with no DOM and no side effects, and holds
  `cell`, `bitsOf`, `toMosaic` and `fromMosaic`, both modes. It's published as `"./mosaic"` in `exports`,
  with a budget in `scripts/size.mjs`. It's not listed in `sideEffects`, so bundlers tree-shake it. `files`
  already ships `src`, so the editor and stories can import it by relative path before the export exists.
- **Stories:** `_mosaic.js` keeps only story content (`ART`, `FONT`, `rule`, `lettering`, `logo`) and
  imports `cell`/`toMosaic`. A small `play()` round-trip (all 63 sums, both modes, `bitsOf(cell(b, s))`)
  pins the formula, following ADR-0006, with one targeted test, not a sweep.
- **Editor:** a tool page published with the demo or Storybook on GitHub Pages, built from the library's own
  CSS. It's **not** in the npm package and not a Web Component yet. It imports the module. Code that only the
  editor needs stays in the editor:
  - image import: canvas `getImageData` → threshold, or a port of `sextants`'s MIT solver;
  - colour runs → `data-variant`/`data-band` spans, and reading them back;
  - zxnet or edit.tf hash import, if it's ever wanted.

  It saves `cf-mosaic` markup itself, so there's still no format of the library's own, and `fromMosaic` can
  reopen any existing mosaic. If consumers later want to embed editing in their own apps, promote it to an
  opt-in element under `./elements` then, with its own budget.

- **Lessons:** `kit.js` keeps its copy while the lessons must open from `file://`. If they're published
  with the demo, switch to `<script type="module">` and import the module.
- **Why not (a):** the editor makes three copies in both directions. **Why not (c):** licences, a byte model
  that doesn't fit, and no separated sextants.

**What the ADR would say** (a draft for the issue that builds it, not for `docs/adr/` yet):

> **Mosaic conversion is one shared module; authoring is the project's own editor.** All 2×3 cell
> conversion (sum ↔ U+1FB00/U+1CE51 character, pixel rows ↔ mosaic text, contiguous and separated) lives
> in one pure ES module, published as the opt-in `./mosaic` export with a brotli budget (ADR-0015). It's the
> first JS export that isn't a Web Component, which settles the question ADR-0001 left open for
> side-effect-free helpers. The CSS entry points stay JS-free. Art will be authored in a live mosaic editor, a
> future project, modelled on the zxnet teletext editor, not in the npm package. It imports the module and
> saves `cf-mosaic` markup. ADR-0021's "the library ships no authoring tool" stays true of the package.
> ADR-0004's planned editor returns, drawing text mosaics, not canvas pixels.
> Considered: keeping the formula in the stories (three copies once the editor exists); building on an
> existing teletext editor or library (GPL, AGPL, CC BY or no licence, a byte model where colour changes
> take up cells, and no separated sextants at U+1CE51); shipping the editor as an element from the start
> (no consumer needs to embed it yet).

## Follow-ups (not done here)

1. **Extract the module and the `./mosaic` export.** That means moving `cell`/`toMosaic` out of the stories,
   adding `bitsOf`/`fromMosaic`, adding the budget line, and adding the round-trip check. This is the first
   slice of the editor work and can ship before the editor does.
2. **Spec the editor.** It needs answers on:
   - what it enforces: two colours per cell, contiguous/separated per cell or per run;
   - where it's published;
   - whether it imports zxnet or edit.tf pages;
   - which image import comes first: a threshold, or the ported solver.

## Sources

- Unicode: [UnicodeData.txt 16.0](https://www.unicode.org/Public/16.0.0/ucd/UnicodeData.txt),
  [DerivedAge.txt 16.0](https://www.unicode.org/Public/16.0.0/ucd/DerivedAge.txt),
  [U+1FB00 chart](https://www.unicode.org/charts/PDF/U1FB00.pdf), [U+1CC00 chart](https://www.unicode.org/charts/PDF/U1CC00.pdf).
- zxnet editor source: <https://zxnet.co.uk/teletext/editor/editor.js> (export menu and `copyArea()`).
- edit.tf README (hash and export formats): <https://github.com/rawles/edit.tf/blob/master/README.md>.
- TheMarco/teletext: README, `LICENSE` (CC BY 4.0) and `src/render-ansi/render-ansi.ts` (sextant table,
  `separatedDim`), at <https://github.com/TheMarco/teletext>.
- ZVBI `src/lang.c`: <https://github.com/zapping-vbi/zvbi/blob/master/src/lang.c>.
- npm tarballs inspected: `@techandsoftware/image-to-sextants@1.0.0` (`src/data/SextantsToUnicode.js`,
  `src/ImageToSextants.js`), `@techandsoftware/teletext@1.3.1` (`dist/teletext.js`: `loadPageFromEncodedString`,
  `getText_`, `g1_block_mosaic_to_unicode__*`).
- chafa `chafa/internal/chafa-symbols.c` (`generate_sextant_syms`): <https://github.com/hpjansson/chafa>.
- ratatui `ratatui-core/src/symbols/marker.rs`: <https://github.com/ratatui/ratatui>.
- notcurses README (`NCBLIT_3x2`) and `COPYRIGHT`: <https://github.com/dankamongmen/notcurses>.
- drawille: <https://github.com/madbence/node-drawille>; img2teletext: <https://github.com/andorthehood/img2teletext>;
  sextants: <https://github.com/rob-smallshire/sextants>; img2blocks: <https://scruss.com/blog/2025/07/31/img2blocks/>;
  ttxcat: <https://codeberg.org/vilcans/ttxcat>.
- In this repo: [ADR-0001](../adr/0001-css-first-no-js-runtime.md), [ADR-0004](../adr/0004-cf-canvas-pixel-art.md),
  [ADR-0006](../adr/0006-stories-are-the-test-surface.md), [ADR-0015](../adr/0015-minified-dist-and-brotli-size-budgets.md),
  [ADR-0021](../adr/0021-text-mosaics-replace-pixel-canvas.md), [`scripts/size.mjs`](../../scripts/size.mjs)
  (`./elements` today: 769 B of a 1500 B budget).
