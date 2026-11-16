# Spike: `@techandsoftware/teletext-service`

Research note, 2026-11-13. Can [`@techandsoftware/teletext-service`](https://www.npmjs.com/package/@techandsoftware/teletext-service)
([docs](https://teletext-for-javascript-docs.robdev.org.uk/modules/teletext-service),
[demo](https://teletext-for-javascript-docs.robdev.org.uk/modules/teletext-service-demo)) do anything for
ceefax-ui: as a dependency, as a test oracle, or as a reference for a page-navigation component?

## Summary

- **Not a dependency.** It is AGPL-3.0-only (ceefax-ui is MIT), and it draws a page as an SVG of
  1,000 `<text>` cells, not semantic HTML with classes. Same verdict as its renderer,
  `@techandsoftware/teletext`, in [mosaic-logic-options.md §4](mosaic-logic-options.md#4-existing-libraries-re-checked-as-an-editor-core).
- **Not bundled into Storybook either.** A public Storybook that ships it is distributing AGPL code. If we
  want a side-by-side "real decoder" view, link or iframe the hosted [Geefax](https://geefax.robdev.org.uk/)
  instead.
- **Worth keeping as a reference** for a future page-navigation component (three-digit entry, subpages,
  Fastext, reveal, mix). Its JSON page format is a clean model of a teletext service.

## What it is

A web app around the `@techandsoftware/teletext` SVG renderer. It adds page numbers, subpage navigation
and Fastext links. It renders pages; it does not decode broadcast VBI data.

| Fact                     | Value                                                                                                                                                                                          |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Version, licence         | 0.3.1 (March 2026), **AGPL-3.0-only**. Fonts (`@techandsoftware/teletext-fonts`: Bedstead, Unscii) public domain.                                                                              |
| Runtime dependencies     | `@techandsoftware/teletext-fonts` only; the renderer is bundled.                                                                                                                               |
| Size                     | `dist/teletext-service.js` 71.6 kB, **18.7 kB brotli** (renderer included). Fonts 652 kB on disk.                                                                                              |
| Classes                  | `TeletextService({ DOMSelector })` + `showPage('100')`: fetch and display, you build page entry. `TeletextServiceViewer`: the full app, tied to its own HTML, "a starting point you can fork". |
| Page source              | Default fetcher loads `1.json`…`8.json` (one per magazine) next to the page. Pluggable fetcher.                                                                                                |
| External code at runtime | Optional smooth-mosaic plugin from `cdn.jsdelivr.net/…@latest` (LGPL-2.1, hqx scaling, "not authentic").                                                                                       |

### Page format

```text
{ pages: { "100": { webUrl?, subpages: [ { encoding?, fastext?: { red, green, yellow, blue, index },
                                           outputLines | packed } ] } } }
```

- `outputLines`: MRG `.tti` output lines (`OL,row,text`), control codes raw, +0x80 or ESC-escaped.
- `packed`: the edit.tf URL hash (base64url, 25 × 40 7-bit cells).
- `scripts/tti2json.js` (in the repo, not the npm tarball) turns a folder of `.tti` files into these JSON
  files, so the TTI archives on [zxnet](zxnet-teletext.md) load directly.

## What the spike checked

Installed 0.3.1 in a scratch folder and inspected `dist/`. Then loaded the hosted demo,
[Geefax](https://geefax.robdev.org.uk/) (the "full service" demo: Guardian headlines as Ceefax pages), and
inspected its DOM:

- The page is one `<svg viewBox="0 0 400 250">` with **1,000 `<text>` elements** (one per cell, spaces
  included), 124 `<rect>` backgrounds and `<use>` elements for mosaics. No `role`, no accessible name.
- A screen reader gets the page cell by cell. That is the gap ceefax-ui exists to close: the same look
  from real elements (`<nav>`, `<a>`, headings), with state in ARIA.
- The viewer's behaviours map onto things ceefax-ui has or may want: reveal → `cf-reveal`, Fastext row,
  page-number entry with a "searching" header, subpage `1 of 2` cycling.

## Options

| Option                                                | Verdict                                                                                                    |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Runtime or peer dependency                            | **No.** AGPL, and SVG cells instead of the contract's semantic HTML.                                       |
| Dev dependency for a Storybook fidelity comparison    | **No.** Shipping it in the published Storybook pulls in AGPL obligations. Link or iframe Geefax instead.   |
| Copy its page JSON shape for a future navigation demo | **Maybe**, when a navigation component is specced. A data shape is not copyrightable code; write our own.  |
| Reference for authentic behaviour                     | **Yes.** Listed here; the [zxnet](zxnet-teletext.md) viewer and [NMS Ceefax](nmsceefax.md) cover the rest. |

## Sources

- npm metadata and tarball: `@techandsoftware/teletext-service@0.3.1` (`dist/teletext-service.js`,
  `dist/1.json`, `dist/teletextservice_example_minimum_code.html`).
- Docs: [overview](https://teletext-for-javascript-docs.robdev.org.uk/modules/teletext-service)
  ([snapshot](http://web.archive.org/web/20260719032142/https://teletext-for-javascript-docs.robdev.org.uk/modules/teletext-service)),
  [page fetcher](https://teletext-for-javascript-docs.robdev.org.uk/modules/teletext-service-page-fetcher)
  ([snapshot](http://web.archive.org/web/20260719032924/https://teletext-for-javascript-docs.robdev.org.uk/modules/teletext-service-page-fetcher)),
  [minimal demo](https://teletext-for-javascript-docs.robdev.org.uk/modules/teletext-service-demo)
  ([snapshot](http://web.archive.org/web/20260719024944/https://teletext-for-javascript-docs.robdev.org.uk/modules/teletext-service-demo)),
  [features](https://teletext-for-javascript-docs.robdev.org.uk/teletext-features).
- Hosted demo DOM: <https://geefax.robdev.org.uk/>
  ([snapshot](http://web.archive.org/web/20251006142201/https://geefax.robdev.org.uk/)), inspected 2026-11-13.
