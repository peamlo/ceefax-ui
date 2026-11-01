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
import "@peamlo/ceefax-ui/elements";  // optional — registers <cf-loader> + <cf-canvas>
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
- **`data-variant`** is only for a presentational colour — any of the six named authentic colours (`red`/`green`/`yellow`/`blue`/`cyan`/`magenta`), plus the look-only `ghost` on a button, `nav` on a link and `character` on a checkbox or radio. Each component decides how it paints that colour: the button fills, the card borders, the fastext key colours its label. An unrecognised name renders the component's default, unstyled look. A **fastext bar** has one to four keys, shown as red / green / yellow / cyan on screen. Any seam colour works, but blue text on the black page fails contrast.
- **`data-band`** sets a coloured **band** behind a text part, one of the same six colours. On a banded part `data-variant` names the ink; without it the band gets the readable default ink (black, white on blue). Only parts whose `data-variant` is a text colour take a band (the header row's parts, the table's and fastext keys); blocks such as buttons never do. An unknown name renders no band. See [Bands](#bands).
- No utility classes, no compound-class soup.

### States

- **Focus** (`:focus-visible`) → instant colour **inversion**. Transient; "the keyboard is here."
- **Selected** (`[aria-current="page"]`) → persistent **▸ caret**. "You are on this page."
- **Hover** → same inversion as focus (intentional).
- **Active** → instant `scale(.96)`, no colour ramp.

## Components

| Class                                                                                     | Element                                                                    | Variants (`data-*`)                                                                                                                                                                                        | State                                                                                                            |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `cf-btn`                                                                                  | `<button>` / `<a>`                                                         | `variant` red/green/yellow/blue/ghost · `size` sm/md/lg                                                                                                                                                    | `:disabled`, `:focus-visible`, `:active`                                                                         |
| `cf-link`                                                                                 | `<a>`                                                                      | `variant="nav"`                                                                                                                                                                                            | `[aria-current="page"]`                                                                                          |
| `cf-card`                                                                                 | any block                                                                  | `variant` red/green/yellow/blue/cyan/magenta                                                                                                                                                               | —                                                                                                                |
| `cf-fastext` / `cf-fastext__key`                                                          | `<ul>` / `<a>`                                                             | `variant` (text colour) · `band` (filled key, ADR-0017); 1–4 keys in equal columns                                                                                                                         | `:focus-visible`                                                                                                 |
| `cf-notice` / `cf-notice__flag`                                                           | block + `role="note"` / `<strong>`                                         | `variant` red (default, danger)/yellow (warning)/green (success)/blue/cyan/magenta · `blink="off"`                                                                                                         | flash (reduced-motion aware)                                                                                     |
| `cf-header-row` / `cf-header-row__page` / `__service` / `__rolling` / `__time` / `__date` | `<header>` / `<span>` ×3 / `<time datetime>` / `<span>` in the `<time>`    | `variant` on any part (text colour) · `band` on any part (background; `variant` is then the ink)                                                                                                           | —                                                                                                                |
| `cf-table` / `cf-table__scroll`                                                           | `<table>` / `<div role="region">`                                          | `stripe-rows` / `stripe-cols` text/band · `variant` / `band` on any part · `align="end"` / `leader` on a cell · `side="bottom"` on the caption                                                             | `[aria-current="true"]` on a row                                                                                 |
| `cf-field` / `cf-field__hint` / `cf-field__error`                                         | block with `<label>` + control / `<p>` / `<p>`                             | —                                                                                                                                                                                                          | —                                                                                                                |
| `cf-input` / `cf-textarea` / `cf-select`                                                  | text-like `<input>` / `<textarea>` / single `<select>`                     | — (`size`, `cols`, `rows` set the size)                                                                                                                                                                    | `:focus-visible`, `:user-invalid`, `[aria-invalid="true"]`, `:disabled`                                          |
| `cf-checkbox` / `cf-radio`                                                                | `<input type="checkbox">` / `<input type="radio">` in a wrapping `<label>` | `variant="character"`                                                                                                                                                                                      | `:checked`, `:indeterminate` (checkbox), `:focus-visible`, `:user-invalid`, `[aria-invalid="true"]`, `:disabled` |
| `<cf-loader>`                                                                             | Web Component                                                              | —                                                                                                                                                                                                          | blink (reduced-motion aware)                                                                                     |
| `<cf-canvas>`                                                                             | Web Component                                                              | `size` sm/md/lg/full                                                                                                                                                                                       | `alt` → `role="img"`                                                                                             |
| `cf-page` + `data-frame`                                                                  | `<section>` with `header`/`main`/`footer`                                  | `frame` (4:3 screen; `--cf-frame-ratio` to change) · `cells` 40/60/80 (`--cf-frame-cells` for any count) · `crt` adds scanlines + glow (opt-in, below AA on red/magenta) · `scrollbar` fastext/mosaic/thin | —                                                                                                                |

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

### Forms (`cf-field`, `cf-input`, `cf-textarea`, `cf-select`, `cf-checkbox`, `cf-radio`)

The real native controls, one class each, restyled: square boxes on the page background. A **field** (`cf-field`) holds a control with its `<label>` above it and, when present, a **hint** (`cf-field__hint`) and an **error message** (`cf-field__error`) below. Link the label with `for`/`id`, and the hint and error with `aria-describedby` (both ids when both exist).

```html
<div class="cf-field">
  <label for="email">Email</label>
  <input
    class="cf-input"
    id="email"
    name="email"
    type="email"
    autocomplete="email"
    required
    aria-describedby="email-hint"
  />
  <p class="cf-field__hint" id="email-hint">We only use it to reply.</p>
</div>

<div class="cf-field">
  <label for="postcode">Postcode</label>
  <input
    class="cf-input"
    id="postcode"
    name="postcode"
    autocomplete="postal-code"
    aria-invalid="true"
    aria-describedby="postcode-err"
  />
  <p class="cf-field__error" id="postcode-err">Enter a postcode like W12 7RJ.</p>
</div>

<fieldset class="cf-field">
  <legend>Channel</legend>
  <div class="cf-field">
    <label><input class="cf-radio" type="radio" name="ch" value="1" checked /> BBC1</label>
  </div>
  <div class="cf-field">
    <label><input class="cf-radio" type="radio" name="ch" value="2" /> BBC2</label>
  </div>
</fieldset>

<div class="cf-field">
  <label><input class="cf-checkbox" type="checkbox" name="publish" value="yes" /> Publish my letter</label>
</div>

<div class="cf-field">
  <label><input class="cf-checkbox" data-variant="character" type="checkbox" name="print" /> Print it</label>
</div>
```

- **`cf-input`** styles every text-like `<input>`: `text`, `email`, `password`, `search`, `url`, `tel` and `number`. **`cf-textarea`** styles a `<textarea>` (`textarea.cf-input` looks the same). **`cf-select`** styles a single `<select>` with a drawn ▼ in the field's colour; its open list stays the browser's own.
- **`cf-checkbox`** and **`cf-radio`** draw a square and a circle outlined in the foreground colour. Put each in a wrapping `<label>`: it sits beside its text. Checked, the outline and an inner fill take the accent colour with a gap between them, so "on" changes the shape, not only the colour, and stays visible under forced colours. An indeterminate checkbox (`indeterminate`, set by your script) shows a bar.
- **`data-variant="character"`** on a `cf-checkbox` or `cf-radio` draws it as text characters instead: `[ ]`, `[X]` and `[-]`, or `( )` and `(*)`, the on glyph in the accent colour. Set it on each control: on a container it does nothing. The glyph is generated content on the input itself, which every current browser draws but no spec requires ([ADR-0020](docs/adr/0020-native-form-controls-appearance-none.md)).
- **A group** of radios or checkboxes is a `<fieldset class="cf-field">` named by its `<legend>`, with no fieldset border or padding. For a group error, link the error message from the fieldset with `aria-describedby` and set `aria-invalid="true"` on its controls.
- **Submit and reset** are a `cf-btn` on `<button type="submit">` / `<button type="reset">`. A text control is as tall as a default `cf-btn`, so a search box and its button line up.
- **Size in characters** with the native `size`, `cols` and `rows`: no fixed widths, no `data-size`. Inside the Screen frame a `size` or `cols` width lands on whole cells.
- **Focus** shows an accent ring; the text keeps its colours while you type. **`disabled`** dims a control like a disabled `cf-btn`. Placeholders use the dim foreground colour; autofilled text turns the info colour.
- **Validation is the browser's own** (`required`, `type`, `minlength`…): after the user has interacted, an invalid control (`:user-invalid`) gets a thicker border in the danger colour (a checkbox or radio turns the danger colour). Empty required fields aren't red on load. For an error from your server, set `aria-invalid="true"`: it looks the same.
- **The error message is yours to show:** put `cf-field__error` in the page (and set `aria-invalid`) only while the field is invalid. The library never shows or hides it, because a hidden description is still read out. It is in the danger colour with a leading `!`, so it isn't told by colour alone.
- **No hidden labels:** a control with no visible label (a search box) is named with `aria-label`.
- **Override with your own CSS:** every form rule is `:where()`, so it wins without `!important` ([ADR-0018](docs/adr/0018-foundations-are-tokens-and-semantic-html.md)).

### Pixel canvas (`<cf-canvas>`)

A render-only [custom element](./CONTEXT.md) that draws teletext-style **pixel art** on a `<canvas>` — headers, logos, scenes. Import it from the opt-in `./elements` export. The artwork is the element's **text content**: newline-separated rows of single-char palette codes.

```html
<script type="module">
  import '@peamlo/ceefax-ui/elements/cf-canvas';
</script>

<cf-canvas alt="CEEFAX holidays — palm tree" data-size="md">
  bbbbggbbbbggbbbbbbbb bbggggggggggggbbbbbb bbbgggggrgggggbbbbbb bbbbbbbrbbbbbbbbbbbb yyyyyyyyyyyyyyyyyyyy
</cf-canvas>
```

- **Palette codes:** `k` black · `r` red · `g` green · `y` yellow · `b` blue · `m` magenta · `c` cyan · `w` white · `.` (or space) transparent. Colours are the authentic values by default and follow the [accessible theme](#accessible-theme) like `data-variant` blocks (black and white never change); unknown codes render transparent (with a dev-console warning). Free per-pixel colour — no one-colour-per-cell limit.
- **Grid** dimensions are inferred from the text (ragged rows pad with transparent; common leading indentation is stripped — use `.` for intentional left-edge transparent pixels).
- **Sizing** is fluid and crisp (`image-rendering: pixelated`), capped at one teletext page (`40ch`), not the wider `--cf-content-max` prose measure. Pick a tier with `data-size` (`sm`/`md`/`lg`/`full`) or set an exact scale with the `--cf-pixels-scale` escape hatch (`style="--cf-pixels-scale: 8"` = 8 CSS px per pixel).
- **Accessibility:** provide `alt` for a meaningful image (→ `role="img"` + `aria-label`); omit it to mark the canvas decorative (`aria-hidden`).
- **Live edits** re-render automatically (the future paint-it-yourself editor builds on this).

![A CEEFAX·UI header drawn with cf-canvas](docs/images/cf-canvas.png)

See [ADR-0004](./docs/adr/0004-cf-canvas-pixel-art.md) for the reasoning.

## Tokens

Colour tokens come in two tiers, both under the `cf` namespace:

- **`--cf-base-*`** — the authentic 8 broadcast colours (`--cf-base-red`, …). Fixed and **never** remapped, so a theme cannot change them.
- **Semantic aliases** — every other `--cf-*` colour (`--cf-bg`, `--cf-fg`, `--cf-link`, `--cf-danger`, …). They say what a colour is _for_, and they are what themes remap.

Use the semantic aliases in your own CSS so it follows the active theme; reach for `--cf-base-*` only when you deliberately want the authentic colour whatever the theme (e.g. pixel art). The library's own component and layout stylesheets, and the variant seam, use semantic aliases only — CI enforces it.

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

Under the [accessible theme](#accessible-theme) every band's ink is black, whatever ink the markup names, so every band clears AAA. Storybook's `Foundations/Colors` → Bands shows the live grid of pairs and ratios. Bands are presentational only: the text and its semantics are unchanged. Parts that take a band today: every `cf-header-row` part, a `cf-table`'s caption, row groups, rows and cells, and a `cf-fastext__key` (the filled fastext look).

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

Every block colour is light, so the ink on a variant block is black — blue included. The theme only remaps semantic aliases (including the `--cf-variant-*` tier the variant colours resolve through); `--cf-base-*` keeps the authentic colours. Pixel art (`<cf-canvas>`) follows the theme too, repainting when the attribute changes; art that pairs two colours (yellow on blue) loses some contrast between them, so give meaningful art an `alt`. Colour is still never the only cue: fastext keys keep their labels and the current page its caret. Try it in Storybook (toolbar → Theme) or on the demo page's switch.

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
