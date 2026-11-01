# ceefax-ui

A Ceefax / teletext-inspired, **framework-agnostic, CSS-first** design system. Ships design tokens + semantic CSS classes + self-hosted fonts. **No JS component runtime** — consume it as plain `class="…"` in Astro, Svelte, or plain HTML. The one interactive widget (`<cf-loader>`) is a standard Web Component.

## Install

Published on npm as [`@peamlo/ceefax-ui`](https://www.npmjs.com/package/@peamlo/ceefax-ui).

```sh
npm install @peamlo/ceefax-ui
```

## Use

Import the stylesheet once (in your Astro layout, Svelte root, or `<head>`), then write semantic classes:

```astro
---
import "@peamlo/ceefax-ui";           // all styles
import "@peamlo/ceefax-ui/elements";  // optional — registers <cf-loader>
---
<a class="cf-link" href="/about" aria-current={pathname === "/about" ? "page" : undefined}>ABOUT</a>
```

Svelte and plain HTML are identical — there is no framework binding.

## Demo

A one-page showcase of what the library delivers — the layout primitives and
components in a teletext blog, with the markup you write beside the live result.
**Live:** [demo](https://peamlo.github.io/ceefax-ui/demo/) · [Storybook](https://peamlo.github.io/ceefax-ui/). Or run it locally:

```sh
npm run demo   # serves the repo, then open http://localhost:3000/demo/
```

It's a plain static page ([`demo/index.html`](demo/index.html)) that consumes the
real `src/index.css` and the self-hosted fonts — the result panels are the library,
not a mockup.

![The ceefax-ui demo page: markup on the left, live result on the right](docs/images/demo.png)

## The contract (do not drift from this)

**One semantic class on the correct native element. State from native/ARIA attributes. `data-*` only for presentational variants.**

```html
<!-- identity = class · look-only variant = data-* · state = native/ARIA attrs -->
<button class="cf-btn">Read more</button>
<button class="cf-btn" data-variant="red">▸ RED · INDEX</button>
<button class="cf-btn" data-size="lg" disabled>Off air</button>

<a class="cf-link" href="/posts">POSTS</a>
<a class="cf-link" href="/about" aria-current="page">ABOUT</a>
<!-- persistent ▸ caret -->
```

- **Never** write state-modifier classes (`cf-btn--disabled`, `cf-btn--active`). Use the real `disabled` attribute, `:focus-visible`, `[aria-current]`, `[aria-pressed]`.
- **`data-variant`** is only for a presentational colour — any of the six named authentic colours (`red`/`green`/`yellow`/`blue`/`cyan`/`magenta`), plus the look-only `ghost` on a button and `nav` on a link. Each component decides how it paints that colour: the button fills, the card borders, the fastext key colours its label. An unrecognised name renders the component's default, unstyled look. A **fastext bar** has one to four keys, shown as red / green / yellow / cyan on screen. Any seam colour works, but blue text on the black page fails contrast.
- **`data-band`** sets a coloured **band** behind a text part, one of the same six colours. On a banded part `data-variant` names the ink; without it the band gets the readable default ink (black, white on blue). Only parts whose `data-variant` is a text colour take a band (the header row's parts, the table's, fastext keys and mosaics); blocks such as buttons never do. An unknown name renders no band. See [Bands](#bands).
- No utility classes, no compound-class soup.

### States

- **Focus** (`:focus-visible`) → instant colour **inversion**. Transient; "the keyboard is here."
- **Selected** (`[aria-current="page"]`) → persistent **▸ caret**. "You are on this page."
- **Hover** → same inversion as focus (intentional).
- **Active** → instant `scale(.96)`, no colour ramp.

## Components

| Class                                                                                     | Element                                                                 | Variants (`data-*`)                                                                                                                                                                                        | State                                                     |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `cf-btn`                                                                                  | `<button>` / `<a>`                                                      | `variant` red/green/yellow/blue/ghost · `size` sm/md/lg                                                                                                                                                    | `:disabled`, `:focus-visible`, `:active`                  |
| `cf-link`                                                                                 | `<a>`                                                                   | `variant="nav"`                                                                                                                                                                                            | `[aria-current="page"]`                                   |
| `cf-card`                                                                                 | any block                                                               | `variant` red/green/yellow/blue/cyan/magenta                                                                                                                                                               | —                                                         |
| `cf-fastext` / `cf-fastext__key`                                                          | `<ul>` / `<a>`                                                          | `variant` (text colour) · `band` (filled key, ADR-0017); 1–4 keys in equal columns                                                                                                                         | `:focus-visible`                                          |
| `cf-notice` / `cf-notice__flag`                                                           | block + `role="note"` / `<strong>`                                      | `variant` red (default, danger)/yellow (warning)/green (success)/blue/cyan/magenta · `blink="off"`                                                                                                         | flash (reduced-motion aware)                              |
| `cf-header-row` / `cf-header-row__page` / `__service` / `__rolling` / `__time` / `__date` | `<header>` / `<span>` ×3 / `<time datetime>` / `<span>` in the `<time>` | `variant` on any part (text colour) · `band` on any part (background; `variant` is then the ink)                                                                                                           | —                                                         |
| `cf-table` / `cf-table__scroll`                                                           | `<table>` / `<div role="region">`                                       | `stripe-rows` / `stripe-cols` text/band · `variant` / `band` on any part · `align="end"` / `leader` on a cell · `side="bottom"` on the caption                                                             | `[aria-current="true"]` on a row                          |
| `<cf-loader>`                                                                             | Web Component                                                           | —                                                                                                                                                                                                          | blink (reduced-motion aware)                              |
| `cf-mosaic`                                                                               | `<span>`                                                                | `variant` (ink) · `band` (background) on the mosaic or a span inside it · `mosaic="separated"`                                                                                                             | `aria-hidden` (decorative) or `role="img"` + `aria-label` |
| `cf-page` + `data-frame`                                                                  | `<section>` with `header`/`main`/`footer`                               | `frame` (4:3 screen; `--cf-frame-ratio` to change) · `cells` 40/60/80 (`--cf-frame-cells` for any count) · `crt` adds scanlines + glow (opt-in, below AA on red/magenta) · `scrollbar` fastext/mosaic/thin | —                                                         |

### Notice (`cf-notice`)

For something the reader mustn't miss: a thick border and a short capitalised flag that flashes like teletext flash text, once a second for about 5 seconds, then holds solid. Danger (red) is the default; `data-variant="yellow"` is a warning and `data-variant="green"` a success (usually with `data-blink="off"`: good news rarely needs a flash). The other variant colours work too. The body is free content.

```html
<div class="cf-notice" role="note">
  <strong class="cf-notice__flag">Mismatch</strong>
  <p>Mismatch: the plan says €75,000 but the contract says €70,000.</p>
</div>
```

- **`role="note"`, not `role="alert"`:** a static notice shouldn't interrupt a screen reader on page load.
- **Repeat the flag in the body.** The flag is one terse word; the body must carry its meaning too, so neither the colour nor the flash is the only cue.
- **One flashing notice per screen.** Put `data-blink="off"` on the others. The flash is always off under `prefers-reduced-motion: reduce`.

### Header row (`cf-header-row`)

The single top line of a teletext page, in broadcast colours: the page you asked for, the service name, the page on air, then the date and time. It is the **only** place the page number appears; screen titles stay ordinary headings. In the page shell, put both classes on the same `<header>`, no wrapper.

```html
<header class="cf-page__header cf-header-row">
  <span class="cf-header-row__page">P455</span>
  <span class="cf-header-row__service">CEEFAX</span>
  <span class="cf-header-row__rolling">454</span>
  <time class="cf-header-row__time" datetime="2026-10-28T15:23:19"
    ><span class="cf-header-row__date">Oct28</span> 15:23:19</time
  >
</header>
```

- **The page number is real text,** never `aria-hidden` or colour alone, so a screen reader announces "P455".
- **`__rolling` is the rolling page number,** the page on air. On a real set it rolls while the set searches for the page you asked for; here it's static, so it usually matches `__page` without the `P`.
- **Colour any part** with `data-variant`, as on every component: it sets that part's text colour (`<span class="cf-header-row__date" data-variant="magenta">Oct28</span>`). Authentic blue text is hard to read on black (about 2.4:1); the Accessible theme lifts it.
- **Band any part** with `data-band` (see [Bands](#bands)): `<span class="cf-header-row__service" data-band="blue" data-variant="yellow">Teletext</span>` is a broadcast-style yellow-on-blue service name. Without `data-variant` the band takes its readable default ink.
- **The time is static.** Write the `<time datetime>` yourself (when the page was published, not "now"): `datetime` is the machine-readable ISO value, the text is what readers see, as `Oct28 15:23:19`. There is no JavaScript and no ticking clock.
- **Narrow viewports** wrap the time onto a second line; the page number stays first.

### Scrollbars

Every scroll container inside the page shell (`.cf-page` and everything in it) gets a teletext scrollbar, with no CSS of your own. Nothing outside `.cf-page` is touched; for the whole document, put `cf-page` on `<body>`. Pick a look with `data-scrollbar`:

| `data-scrollbar`      | Look                                                                        |
| --------------------- | --------------------------------------------------------------------------- |
| _(none)_, the default | **block**: a square foreground thumb on the background, with a border rule  |
| `fastext`             | a yellow thumb on a deep-blue track, with cyan ▲▼ step buttons              |
| `mosaic`              | a checkered cyan thumb on a black track striped with the dim foreground     |
| `thin`                | a narrow bar (two thirds of block), foreground on background, for dense UIs |

```html
<section class="cf-page" data-scrollbar="fastext">
  …
  <pre data-scrollbar="thin">…</pre>
</section>
```

- **It inherits,** so the nearest `data-scrollbar` wins: set it once on `.cf-page`, override it on one scroller. An unknown value keeps the inherited look.
- **Hover or drag inverts the thumb** (and fastext's buttons), like every other Inversion.
- **Colours are the semantic aliases,** so the Accessible theme, or an alias you override, recolours the bar. Put the theme or the override on `.cf-page` or on the element that carries `data-scrollbar` (`<pre data-scrollbar="thin" style="--cf-accent: …">`): that is where the bar's colours are resolved. Sizes are in `em`, so the bar scales with the Screen frame.
- **Firefox only takes two colours and a width:** it shows the variant's thumb and track colours, with no square shape, pattern, buttons or hover. Chrome and Safari show the full look; fastext's step buttons are on vertical bars only.

### Table (`cf-table`)

A native table set like a broadcast league table: one line per row, figures to the end, and no rule under every row. Group rows with native `<tbody>` elements; the only rule is the **group rule** between groups (and before `<tfoot>`). Wrap the table in its own scroll region, named from the caption, so a wide table scrolls by itself and never the page.

```html
<div class="cf-table__scroll" role="region" tabindex="0" aria-labelledby="t1">
  <table class="cf-table">
    <caption id="t1">
      Premier League · final table
    </caption>
    <thead>
      <tr>
        <th scope="col">Pos</th>
        <th scope="col">Team</th>
        <th scope="col" data-align="end">Pts</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <th scope="row">Man City</th>
        <td data-align="end">91</td>
      </tr>
    </tbody>
    <tbody>
      <tr>
        <td>2</td>
        <th scope="row">Arsenal</th>
        <td data-align="end">89</td>
      </tr>
    </tbody>
  </table>
</div>
```

- **The caption comes first** in markup, as HTML requires. It's drawn in the display face and accent colour, at the top; `data-side="bottom"` on the caption moves it under the table.
- **`data-align="end"`** on a `th` or `td` end-aligns a figure, keeps it on one line and uses tabular digits. Pad compound figures (`22: 5`, `45-17`) yourself.
- **`data-leader`** on a name cell runs dot leaders from the name to its figures, as on WDR's league tables. That column takes the table's spare width, so the figures sit at its end, and it never wraps. The dot leader is decoration: screen readers hear only the name. One leader column per table.
- **The header** is bold foreground text with no rule; **`<tfoot>`** is bold, set apart by the group rule.
- **Row stripes:** `data-stripe-rows="text"` on the table alternates body rows in the info colour and the foreground (Ceefax cyan/white); `data-stripe-rows="band"` puts odd rows on a blue band with its readable ink, the pair `data-band="blue"` gives. The count restarts in every `<tbody>`; the header and footer are never striped. The stripe colour is fixed: band single rows for other colours.
- **Column stripes:** `data-stripe-cols="text"` or `"band"` gives columns the same two looks, cell by cell, header and footer included (the native `<col>` can't set the ink, so it isn't used). Every row setting wins where it crosses a column stripe. `colspan` shifts the count and isn't supported in a column-striped table.
- **Zones and bands:** `data-variant` on a `<caption>`, `<thead>`, `<tbody>`, `<tr>`, `<th>` or `<td>` sets its text colour; `data-band` bands it, with `data-variant` as the ink (see [Bands](#bands)). A `<tbody data-band="cyan">` is a WDR-style zone. A part's own setting replaces what it inherits, background included, and both override the row stripe.
- **The current row** is state, so ARIA: `aria-current="true"` on a `<tr>` (your team, the chosen option) paints an accent band and is announced as current. `data-band` on the row changes the band's colour; there's no text-only current row, so colour is never the only cue, and a cell that names its own colour still takes the row's band. Precedence, most specific first: `aria-current` > a row's band/variant > its `<tbody>`'s > the row stripe > the column stripe.
- **`--cf-table-rule`** changes the group rule's colour (`--cf-accent-2` by default); `transparent` hides it.
- **Wrapping follows the Screen frame** ([ADR-0014](docs/adr/0014-screen-frame-is-the-authentic-mode.md)): outside `.cf-page[data-frame]` text cells and the caption wrap like any web table; inside it every cell and the caption stay on one line. Figure cells never wrap.
- **Typography is yours, through the tokens** ([ADR-0018](docs/adr/0018-foundations-are-tokens-and-semantic-html.md)): there are no typography attributes. The table's defaults are `:where()`, so your own CSS wins without `!important` (`.my-page caption { font-size: var(--cf-text-subheading) }`). `<strong>` and `<small>` in cells and the caption follow `--cf-weight-bold` and `--cf-text-small`; `<em>` keeps its italic (teletext had none, and colour alone can't carry emphasis).

### Mosaic (`cf-mosaic`)

Teletext mosaics, graphics written as text: banners, rules, logo blocks, small charts and pictures that sit on the same row as the words around them, as on a real set. Each character is a 2×3 block pattern filling one cell, drawn by Bedstead. A mosaic is CSS on characters you write: the line wraps around it like a word, it copies like text, and it needs no JavaScript.

<!-- prettier-ignore -->
```html
<p>
  <span class="cf-mosaic" role="img" aria-label="A red heart" data-variant="red">🬻🬺█🬓
🬁🬬🬆 </span> Valentine’s Day: page 520
</p>

<div><span class="cf-mosaic" aria-hidden="true" data-variant="yellow">🬋🬋🬋🬋🬋🬋🬋🬋🬋🬋</span></div>
```

The heart is 8 × 6 blocks, so 4 cells across and 2 rows down: the newline inside the mosaic starts its second row. Its first cell, `🬻`, has every block lit except the top-left one: 2 + 4 + 8 + 16 + 32 = 62, and U+1FB00 + 62 − 1 − 2 = U+1FB3B. The rule repeats `🬋`, a cell with only its middle row lit (4 + 8 = 12).

- **Cells are code points.** Number a cell's blocks 1, 2, 4, 8, 16, 32 from the top-left, row by row, and add the lit ones (`bits`, 1–63; a space is an empty cell). Contiguous: `0x1FB00 + bits − 1`, skipping the three that Unicode encodes as block elements (`▌` U+258C for 21, `▐` U+2590 for 42, `█` U+2588 for 63), so subtract one more above 21 and another above 42. Separated, with `data-mosaic="separated"`: `0x1CE51 + bits − 1` (Unicode 16, no exceptions). It is one inline box, so a picture keeps its shape beside text.
- **Draw art in the [zxnet teletext editor](https://zxnet.co.uk/teletext/editor/)** ([reference](./docs/reference/zxnet-teletext.md)), not by hand. It paints with teletext's own rules (two colours per cell, contiguous and separated) and keeps the whole page in its URL. The library ships no editor of its own ([ADR-0020](./docs/adr/0020-text-mosaics-replace-pixel-canvas.md)).
- **Two colours per cell:** `data-variant` is the ink and `data-band` the background, on the mosaic or on a `<span>` inside it for each colour run. A banded run names its ink beside its band, which follows the band rules (see [Bands](#bands)). Letters inside a mosaic fall back to Bedstead, so text can share a mosaic's band.
- **Accessibility:** most mosaics decorate, so put `aria-hidden="true"` on them, or a screen reader announces every glyph by its Unicode name. A mosaic that carries meaning gets `role="img"` and an `aria-label`. In a chart keep the figures as text and hide only the bars. A rule on a line of its own goes in a `<div>`, not a `<p>`, so no empty paragraph is left behind.
- **Forced colours:** a mosaic is a picture, so it keeps its colours, on its own `--cf-bg` background.
- **Font loading:** mosaics use a `font-display: block` face (the same Bedstead file, no second download), so cells stay blank rather than showing tofu while it loads. Text keeps `swap`. On pages with mosaics, preload the font (from wherever you serve the package's `fonts/`) so the cells appear with the text:

  ```html
  <link rel="preload" href="/fonts/bedstead-3.261-regular.woff2" as="font" type="font/woff2" crossorigin />
  ```

- **Inside the Screen frame** mosaics sit on the cell grid and tile edge to edge.
- **Your CSS wins** (every rule is `:where()`), font included: a rule that sets a font on every `span` turns mosaics into empty boxes. Set it back with `.cf-mosaic { font-family: 'Bedstead Mosaic', 'Bedstead Cell', monospace }`.

## Tokens

Colour tokens come in two tiers, both under the `cf` namespace:

- **`--cf-base-*`** — the authentic 8 broadcast colours (`--cf-base-red`, …). Fixed and **never** remapped, so a theme cannot change them.
- **Semantic aliases** — every other `--cf-*` colour (`--cf-bg`, `--cf-fg`, `--cf-link`, `--cf-danger`, …). They say what a colour is _for_, and they are what themes remap.

Use the semantic aliases in your own CSS so it follows the active theme; reach for `--cf-base-*` only when you deliberately want the authentic colour whatever the theme. The library's own component and layout stylesheets, and the variant seam, use semantic aliases only — CI enforces it.

Type follows web conventions on an 8px grid: `--cf-text-small` 12 · `body` 16 · `subheading` 24 · `heading` 32 · `display-lg` 48 · `display-xl` 72 (px). `--cf-content-max` is a prose reading measure (~65ch); only the Screen frame is one teletext page (40 cells) wide.

Inside the Screen frame (`.cf-page[data-frame]`, from 40em up) the page follows teletext's rules: the type is sized so 40 Bedstead cells fill a row inside a one-cell margin on each side (in the body, inside its scrollbar, to the whole pixel), so header, body and footer start on the same column, every line is one cell high, all text is Bedstead, and the scale keeps its ratios in cells (body 1 · heading 2 · display-lg 3). Only the eight authentic colours appear: `--cf-bg-2` snaps to blue and `--cf-fg-dim` to green, unless the [accessible theme](#accessible-theme) applies, which wins. The frame sets each slot's inline padding to that margin. For a denser, terminal-like grid add `data-cells="60"` or `"80"`; `--cf-frame-cells` takes any count (40 is the default and the teletext one).

Spacing is `ch`-based; radius is always `0`.

## Bands

```html
<span class="cf-header-row__service" data-band="blue">TELETEXT</span>
<!-- white on blue -->
<span class="cf-header-row__service" data-band="blue" data-variant="yellow">TELETEXT</span>
<!-- yellow on blue -->
```

In the default theme the ink is used as written, so contrast is yours to choose. The default ink always passes; a coloured ink passes WCAG AA only with blue on one side:

| Band                        | Inks that pass AA (authentic)                             |
| --------------------------- | --------------------------------------------------------- |
| `blue`                      | default (white) · `yellow` 8.0 · `cyan` 6.9 · `green` 6.3 |
| `yellow` · `cyan` · `green` | default (black) · `blue` 8.0 / 6.9 / 6.3                  |
| `red` · `magenta`           | default (black) only                                      |

Under the [accessible theme](#accessible-theme) every band's ink is black, whatever ink the markup names, so every band clears AAA. Storybook's `Foundations/Colors` → Bands shows the live grid of pairs and ratios. Bands are presentational only: the text and its semantics are unchanged. Parts that take a band today: every `cf-header-row` part, a `cf-table`'s caption, row groups, rows and cells, a `cf-fastext__key` (the filled fastext look), and a `cf-mosaic` or a span inside it.

## Accessible theme

The authentic palette is the point of the library, but it is not accessible: authentic blue is 2.44:1 on black, and `danger = red` / `success = green` is the classic red–green confusion. Opt into the **accessible theme** with one attribute — no JavaScript, no build step, no markup changes:

```html
<html data-theme="accessible"></html>
```

It also works on any subtree (`<section data-theme="accessible">`) to scope it to one region. Without the attribute nothing changes.

The theme is colour-vision-deficiency optimised (Okabe–Ito-inspired): every colour clears **WCAG AAA (≥ 7:1)** on black, and `danger`/`success` sit on the blue–yellow axis (amber vs teal) so they stay apart under red–green colour-blindness. Your existing `data-variant` markup is re-coloured through the same names:

| `data-variant` / alias                                      | Accessible colour | On black |
| ----------------------------------------------------------- | ----------------- | -------- |
| `red` · `--cf-danger`                                       | amber `#FF9E4D`   | 10.3:1   |
| `green` · `--cf-success`, `--cf-accent-2`                   | teal `#33E0C0`    | 12.6:1   |
| `yellow` · `--cf-accent`, `--cf-warning`, `--cf-link-hover` | yellow `#FFFF00`  | 19.6:1   |
| `blue`                                                      | sky `#66B3FF`     | 9.5:1    |
| `magenta` · `--cf-link-visited`                             | orchid `#E0A0D0`  | 10.1:1   |
| `cyan` · `--cf-link`, `--cf-info`                           | ice `#99E6FF`     | 15.1:1   |
| `--cf-fg-dim`                                               | grey `#B3B3B3`    | 10.0:1   |

Every block colour is light, so the ink on a variant block is black — blue included. The theme only remaps semantic aliases (including the `--cf-variant-*` tier the variant colours resolve through); `--cf-base-*` keeps the authentic colours. Mosaics follow the theme too, through the same `data-variant` and `data-band` colours, so a banded run's ink turns black like any band's. Colour is still never the only cue: fastext keys keep their labels and the current page its caret. Try it in Storybook (toolbar → Theme) or on the demo page's switch.

## Develop

```sh
npm install
npm run storybook      # framework-agnostic Storybook (HTML mode) — play with every variant
npm run build          # PostCSS + esbuild minify → dist/index.css + dist/tokens.css
```

Storybook uses `@storybook/html-vite` + the a11y addon, with interactions built in, so stories show the exact HTML contract, run live WCAG checks, and can script keyboard/focus behaviour.

## Fonts

Both self-hosted. [Bedstead](https://bjh21.me.uk/bedstead/), a recreation of the SAA5050 teletext character set (public domain), is the display face: headings, card titles and fastext keys. Space Mono (SIL OFL 1.1) is the body face. Sources, versions and licences: [`fonts/README.md`](./fonts/README.md).

## License

MIT (code) · Bedstead public domain, Space Mono SIL OFL 1.1 (bundled fonts).
