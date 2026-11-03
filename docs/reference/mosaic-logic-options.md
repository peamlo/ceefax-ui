# Mosaic logic: where it lives, and whether a library already does it

Research note, 2026-11-03. It asks where the conversion pixel art → 2×3 block sums → Unicode sextants
should live, and whether `stories/_mosaic.js` reinvents an existing library. It changes no code.

## Summary

- **Recommendation: option (a).** Keep the cell formula out of the package. It stays in
  `stories/_mosaic.js`, the README keeps documenting it, and the lessons' `kit.js` keeps its own copy.
  That copy has to stay anyway: the lessons are a classic script so they open from disk, and a classic
  script can't import an ES module.
- **There's no library worth adopting.** The one JS package that maps pixels to sextants,
  [`@techandsoftware/image-to-sextants`](https://www.npmjs.com/package/@techandsoftware/image-to-sextants),
  is GPL-2.0, contiguous-only, and has had one release (2022). The rest are terminal renderers in C or Rust,
  Python tools that output teletext bytes, or braille libraries. The formula is 8 lines and about 330 B
  brotli, so a dependency would cost more than the code it replaces.
- **The bigger finding is a broken step in the documented workflow.** The README, the Mosaic docs page and
  ADR-0021 all say to draw in the zxnet editor and paste the characters. But the zxnet editor has no Unicode
  output. Its export formats are TTI, EP1, TTX, BIN, BBC, T42, PNG, GIF, edit.tf and viewdata, and its
  clipboard copy holds raw 7-bit teletext codes. Pasting that into `cf-mosaic` shows ASCII punctuation, not
  mosaics (see [§2](#2-the-intended-consumer-workflow-and-its-gaps)). Fixing that gap matters more than
  where `cell()` lives.

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
lessons (`String.fromCodePoint(0x1fb39)` as an example). No library code (`src/`), demo page (`demo/`) or
script (`scripts/`) converts mosaics. So there are exactly **two implementations of the formula**: the
stories and the lessons' kit. `kit.js` says so itself ("Mirrors cell() in stories/_mosaic.js").

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

## 2. The intended consumer workflow, and its gaps

**What the docs say.**

- [ADR-0021](../adr/0021-text-mosaics-replace-pixel-canvas.md): "Art is authored in the zxnet teletext
  editor, not in a format of the library's own", and "Authoring and PNG export come from the zxnet editor;
  the library ships neither."
- [README → Mosaic](../../README.md#mosaic-cf-mosaic) documents the formula, then says to draw art in the
  zxnet editor, "not by hand".
- The Storybook docs page (`DOCS`) says: "Don't type them by hand: draw in the zxnet teletext editor and
  paste the characters." It says the stories build their art in code only "so the controls can change it".
- `_mosaic.js` says the Saturn art was "computed once and pasted, as you'd paste from the zxnet editor".
- [CONTEXT.md](../../CONTEXT.md) defines **Mosaic** and **Cell** but says nothing about authoring.

So the documented answer is: **consumers paste characters and never reimplement the conversion.** The
formula is in the README as an explanation, not as something consumers must code.

**Gap 1: the zxnet editor can't produce characters to paste.** In the editor's source
([`editor.js`](https://zxnet.co.uk/teletext/editor/editor.js), fetched 2026-11-03):

- The export menu offers `tti7`, `ep1`, `ttx`, `bin`, `bbc`, `t42`, `png`, `pngHiRes`, `gif`, `gifHiRes`,
  `edit.tf` and `viewdata`. None of them is Unicode text.
- `copyArea()` writes a `#ZX#rows#cols#` header, then each cell's raw 7-bit code from `level1PageArray`.
  Control codes are written as ESC + code | 0x40.

A mosaic cell is stored as its G1 code. A cell of sum 62 is 0x7E, `~`. The cell's look depends on control
codes earlier in the row: graphics colour 0x11–0x17, contiguous 0x19 or separated 0x1A, hold graphics 0x1E
or release 0x1F, and new background 0x1D. Pasting the clipboard into a `cf-mosaic` gives punctuation and
letters. To get from zxnet to `cf-mosaic` you have to:

1. decode the page, from the URL hash or from the copied bytes;
2. walk each row's attribute state;
3. map each G1 code to a sum, `(c & 0x1F) | ((c & 0x40) >> 1)`;
4. run `cell()`;
5. turn colour changes into `data-variant` and `data-band` spans.

edit.tf documents the hash format: 7 bits per cell, base64url
([edit.tf README](https://github.com/rawles/edit.tf/blob/master/README.md)). Nothing in this repo does those
steps, and the docs don't say they're needed. The Saturn art got around it by being drawn as pixel rows in
code. This is the gap that will actually hit a consumer.

**Gap 2: mosaics generated at runtime.** Charts, live bars, a rule as wide as its data: these are made in
code, not pasted. Today a consumer reads the README's formula and writes `cell()` themselves (8 lines). In
practice the common cases need almost none of it:

- A bar is `'█'.repeat(n)`, plus `▌` for a half. That's what the **Bar chart** story does.
- A rule is one character repeated (`🬋`, sum 12).
- A separated version is one more code point.

The roadmap's chart-like components ([#16](https://github.com/peamlo/ceefax-ui/issues/16) `cf-alloc`,
[#17](https://github.com/peamlo/ceefax-ui/issues/17) `cf-scale`,
[#18](https://github.com/peamlo/ceefax-ui/issues/18) `cf-horizon`) are specced as CSS proportions
(`--w`), not mosaics. Only free-form pictures drawn from data (sparklines, maps) need the full
pixels → cells conversion, and no consumer or issue asks for that yet.

**Gap 3, minor: nothing links the two copies.** `kit.js` points at `_mosaic.js`, but nothing points the
other way. If someone changes the stories' formula, the lessons can drift without anyone noticing.

## 3. Existing libraries

Checked with npm (`npm view`, `npm search` for "sextant", "block sextant", "legacy computing", "teletext"),
GitHub code search (`0x1CE51`, `0x1fb00 sextant`) and the repos and package pages below, on 2026-11-03.

| Project                                                                                                                                                              | What it does                                                                                                                                                                         | Licence                           | Maintenance                           | Size                                       | Separated (U+1CE51)                                    | ▌ ▐ █ for 21/42/63                 | Fits ceefax-ui?                                                                                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------- | ------------------------------------- | ------------------------------------------ | ------------------------------------------------------ | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`@techandsoftware/image-to-sextants`](https://www.npmjs.com/package/@techandsoftware/image-to-sextants) ([source](https://bitbucket.org/rahardy/image-to-sextants)) | Grayscale buffer → G1 bytes or Unicode sextants: thresholds at 127, then a 64-entry lookup table (`SextantsToUnicode.js`). Same bit order as ours.                                   | **GPL-2.0-or-later**              | 1.0.0 is the only release (June 2022) | 5.6 kB source, 1.75 kB brotli, no deps     | **No**                                                 | Yes                                | No. GPL in a MIT package's dependency tree imposes GPL on bundling consumers. Contiguous only. Takes an image buffer, not our pixel rows.                                        |
| [`@techandsoftware/teletext`](https://www.npmjs.com/package/@techandsoftware/teletext) ([repo](https://github.com/techandsoftware/teletext))                         | A full teletext page renderer (SVG in the DOM). `loadPageFromEncodedString()` reads edit.tf and zxnet hashes, and `getText(true)` outputs a page as Unicode text.                    | **AGPL-3.0-only**                 | Active (1.3.1, Aug 2026)              | 42 kB minified, 13.5 kB brotli             | **No**: separated maps to Unscii private use (U+E0C1…) | Yes (its `legacy_computing` table) | No as a dependency (AGPL, size, a JS renderer is what ADR-0021 removed). Its `getText(true)` is the closest existing **zxnet → Unicode** tool, if run offline on contiguous art. |
| [`img2teletext`](https://www.npmjs.com/package/img2teletext) ([repo](https://github.com/andorthehood/img2teletext))                                                  | Node CLI: image → Level 1 teletext data in 2×3 blocks.                                                                                                                               | MIT                               | 5.0.0 (Aug 2025)                      | 44 kB, 5 deps (pngjs, jpeg-js, commander…) | No (teletext bytes)                                    | n/a                                | No: it outputs teletext bytes, not Unicode, and it's a CLI with dependencies.                                                                                                    |
| [`sextants`](https://pypi.org/project/sextants/) ([repo](https://github.com/rob-smallshire/sextants))                                                                | Python: raster image → teletext/viewdata mosaics with a per-row dynamic-programming solver (from Kieran Connell's image2teletext).                                                   | MIT                               | 0.5.0, all releases on 2026-08-22     | Python package                             | No: its default output is a raw 1000-byte page         | n/a                                | No: Python, outputs teletext bytes. Interesting for photo → mosaic quality (two colours a row), which is authoring.                                                              |
| [img2blocks](https://scruss.com/blog/2025/07/31/img2blocks/) ([gist](https://gist.github.com/scruss/b064a667cebecf31e4896f92659505e1))                               | Python + PIL: bitmap → sextant text through a 64-entry table. The post notes the block "isn't contiguous" and borrows the empty, full and half blocks.                               | Not stated                        | Blog post, 2025                       | A script                                   | No                                                     | Yes                                | No: a script with no licence.                                                                                                                                                    |
| [chafa](https://hpjansson.org/chafa/) ([repo](https://github.com/hpjansson/chafa))                                                                                   | Terminal image renderer. Its `sextant` symbol class generates U+1FB00–1FB3B (`chafa-symbols.c`, "Teletext sextant/2x3 mosaic range").                                                | LGPL-3.0                          | Very active                           | C library                                  | No                                                     | (uses its own block class)         | No: C, terminal output, image-quality matching.                                                                                                                                  |
| [notcurses](https://github.com/dankamongmen/notcurses)                                                                                                               | Terminal UI library. `NCBLIT_3x2` is a sextant blitter.                                                                                                                              | Apache-2.0 (GitHub shows "Other") | Active                                | C library                                  | No                                                     | Yes (blitter)                      | No: C, terminals.                                                                                                                                                                |
| [ratatui](https://github.com/ratatui/ratatui)                                                                                                                        | Rust TUI. `symbols::Marker::Sextant` draws charts on a 2×3 grid.                                                                                                                     | MIT                               | Very active                           | Rust crate                                 | No                                                     | Yes                                | No: Rust, terminals.                                                                                                                                                             |
| [drawille](https://www.npmjs.com/package/drawille) ([repo](https://github.com/madbence/node-drawille))                                                               | Pixel canvas → **braille** (2×4).                                                                                                                                                    | MIT                               | 2.0.2 (Oct 2022)                      | 6.6 kB                                     | No                                                     | No                                 | No: braille, not sextants. Width must be a multiple of 2 and height of 4.                                                                                                        |
| [ZVBI](https://github.com/zapping-vbi/zvbi) (`src/lang.c`)                                                                                                           | The teletext decoding library. Its comment says G1 mosaics are "not representable in Unicode, translated to private code U+EE00 ... U+EE7F" (`0xEE00u + c`, bit 5 set = contiguous). | GPL-2.0 / LGPL                    | Active                                | C library                                  | PUA only                                               | PUA only                           | No. It's the origin of Bedstead's U+EE00 copy, which the docs already tell people not to write.                                                                                  |
| [edit.tf](https://github.com/rawles/edit.tf)                                                                                                                         | The editor the zxnet editor descends from. It exports raw frames (two variants) and 8-bit TTI as data URIs, and documents its URL hash format.                                       | GPL-3.0                           | Last push Sept 2025                   | Web app                                    | n/a                                                    | n/a                                | Authoring tool; no Unicode export.                                                                                                                                               |
| [zxnet editor](https://zxnet.co.uk/teletext/editor/)                                                                                                                 | The editor ADR-0021 chose. Its exports are listed in §2: no Unicode text. Copy gives raw 7-bit codes.                                                                                | Not stated on the page            | Live                                  | Web app                                    | n/a                                                    | n/a                                | It's the authoring tool, but the last step (to characters) is missing.                                                                                                           |

GitHub code search for `0x1CE51` finds terminal emulators drawing the glyphs themselves (kitty, VTE, mintty,
SyncTERM): renderers, not converters. Nothing outside ceefax-ui converts pixels or bits to **separated**
sextants at U+1CE51. That's not surprising: those code points arrived in Unicode 16.0 (September 2024), and
the older tools predate them (ttxcat's README still says there are no Unicode separated mosaics).

**Did we reinvent a wheel?** Only the cell lookup, and nobody publishes a version of it that fits: no
licence-compatible, maintained JS package covers both contiguous and separated. The arithmetic form
(`0x1FB00 + bits − 1 − (bits > 21) − (bits > 42)`) is smaller than everyone else's 64-entry table. The wheel
that _is_ missing everywhere is **zxnet/edit.tf page → Unicode text with U+1CE51 separated**.
`@techandsoftware/teletext`'s `getText(true)` gets nearest, but it is AGPL and writes separated as Unscii
private use.

## 4. Options and recommendation

|                          | (a) Stories only, formula documented | (b) Ship a small ESM helper                                                                                                                                                                                         | (c) Depend on a library                                  |
| ------------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Package bytes            | 0                                    | `cell` + `toMosaic` ≈ 770 B raw, **331 B brotli**. That's a new entry point with its own budget (ADR-0015 requires one for every file export).                                                                      | 1.75 kB (image-to-sextants) to 13.5 kB (teletext) brotli |
| ADR-0001                 | Fine                                 | A pure-function module isn't a Web Component. ADR-0001 deferred "logic-bearing" JS to a future ADR, so this needs that ADR. It can't go in the `./elements` barrel: that barrel registers elements (`sideEffects`). | A JS runtime dependency for something CSS-first          |
| ADR-0021                 | Fine: no authoring in the library    | `toMosaic(pixelRows)` is authoring in code, which ADR-0021 keeps out of the library. `cell()` alone is not.                                                                                                         | Same, plus licence                                       |
| Removes duplication?     | No (2 copies)                        | **No.** `kit.js` must stay a classic script to open from `file://`, so it can't `import` the helper. Only the stories would switch.                                                                                 | No                                                       |
| Serves runtime consumers | They copy 8 lines from the README    | Yes                                                                                                                                                                                                                 | Contiguous only, GPL/AGPL                                |
| Public API cost          | None                                 | A semver surface (name, arguments, separated flag) to keep forever                                                                                                                                                  | Someone else's                                           |
| Licence                  | MIT                                  | MIT                                                                                                                                                                                                                 | GPL-2.0 / AGPL-3.0: rules it out                         |

**Recommendation: (a).** Keep `cell()` and `toMosaic()` in `stories/_mosaic.js`, keep the formula in the
README as the reference, and don't add a package export.

- The documented workflow is to paste characters, not to compute them.
- The runtime cases the roadmap has in view are CSS, or need only `█`, `▌` and one repeated character.
- A helper wouldn't remove the second copy, because `kit.js` can't import it.
- It would open a new kind of JS export, which ADR-0001 says needs its own decision, for a need no consumer
  or issue has raised yet.
- (c) is ruled out by the licences and by having no separated support.

Revisit (b) when either happens:

- A real consumer, or a planned component, generates arbitrary mosaics at runtime.
- The zxnet importer below gets built and needs `cell()` too, making three copies. Then extract one module
  that the stories and the importer share. Publish it only if consumers need it at runtime.

**What an ADR for this would say** (draft, for the issue that adopts it, not for `docs/adr/` yet):

> **Mosaic conversion stays out of the package.** The cell formula (sum → U+1FB00/U+1CE51) and the
> pixel-art helpers live in `stories/_mosaic.js` and are documented in the README. They are not published.
> A consumer pastes characters; one who generates mosaics at runtime copies the 8-line formula. We
> considered a `./mosaic` ESM export (≈330 B brotli). We rejected it for now: it would be the first
> non-element JS export (ADR-0001 left that open), `toMosaic()` is authoring (ADR-0021), it adds a public
> API with no consumer, and it wouldn't remove the teaching kit's copy (a classic script). We rejected
> existing libraries: none is MIT-compatible and supports separated sextants. We'll revisit when a
> consumer or component needs runtime mosaics, or a second in-repo tool needs `cell()`.

## Follow-ups (not done here)

1. **Fix the zxnet step in the docs (and ADR-0021).** The README, the `DOCS` text and the `_mosaic.js`
   comment say "paste the characters" from the zxnet editor, which its exports can't do. Before rewording,
   decide how zxnet art reaches `cf-mosaic`. The cheapest place for a converter is a **Storybook tool page**
   (paste a zxnet or edit.tf URL, get `cf-mosaic` markup with `data-variant`/`data-band` spans). It ships
   0 package bytes, follows ADR-0021's "the library ships no authoring", and its `play()` can pin the
   formula. A `scripts/` CLI is the alternative, but consumers don't get `scripts/` in the tarball. Interim
   wording: the [Unicode chart](https://www.unicode.org/charts/PDF/U1FB00.pdf) plus the formula, and
   `@techandsoftware/teletext`'s `getText(true)` as an offline route for contiguous art.
2. **Link the two copies.** Add one line in `_mosaic.js` naming `docs/learn-mosaics/assets/kit.js` (once
   that's committed) as a mirror, so a formula change updates both.

## Sources

- Unicode: [UnicodeData.txt 16.0](https://www.unicode.org/Public/16.0.0/ucd/UnicodeData.txt),
  [DerivedAge.txt 16.0](https://www.unicode.org/Public/16.0.0/ucd/DerivedAge.txt),
  [U+1FB00 chart](https://www.unicode.org/charts/PDF/U1FB00.pdf), [U+1CC00 chart](https://www.unicode.org/charts/PDF/U1CC00.pdf).
- zxnet editor source: <https://zxnet.co.uk/teletext/editor/editor.js> (export menu and `copyArea()`).
- edit.tf README (hash and export formats): <https://github.com/rawles/edit.tf/blob/master/README.md>.
- ZVBI `src/lang.c`: <https://github.com/zapping-vbi/zvbi/blob/master/src/lang.c>.
- npm tarballs inspected: `@techandsoftware/image-to-sextants@1.0.0` (`src/data/SextantsToUnicode.js`,
  `src/ImageToSextants.js`), `@techandsoftware/teletext@1.3.1` (`dist/teletext.js`: `loadPageFromEncodedString`,
  `getText_`, `g1_block_mosaic_to_unicode__*`).
- chafa `chafa/internal/chafa-symbols.c` (`generate_sextant_syms`): <https://github.com/hpjansson/chafa>.
- ratatui `ratatui-core/src/symbols/marker.rs`: <https://github.com/ratatui/ratatui>.
- notcurses README (`NCBLIT_3x2`): <https://github.com/dankamongmen/notcurses>.
- drawille: <https://github.com/madbence/node-drawille>; img2teletext: <https://github.com/andorthehood/img2teletext>;
  sextants: <https://github.com/rob-smallshire/sextants>; img2blocks: <https://scruss.com/blog/2025/07/31/img2blocks/>;
  ttxcat: <https://codeberg.org/vilcans/ttxcat>.
- In this repo: [ADR-0001](../adr/0001-css-first-no-js-runtime.md), [ADR-0015](../adr/0015-minified-dist-and-brotli-size-budgets.md),
  [ADR-0021](../adr/0021-text-mosaics-replace-pixel-canvas.md), [`scripts/size.mjs`](../../scripts/size.mjs) (current
  `./elements` is 769 B of a 1500 B budget).
