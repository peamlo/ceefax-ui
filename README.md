# ceefax-ui

A Ceefax / teletext-inspired, **framework-agnostic, CSS-first** design system. Ships design tokens + semantic CSS classes + self-hosted fonts. **No JS component runtime** — consume it as plain `class="…"` in Astro, Svelte, or plain HTML. The one interactive widget (`<cf-loader>`) is a standard Web Component.

## Install

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
components in a teletext blog, with the markup you write beside the live result:

```sh
npm run demo   # serves the repo, then open http://localhost:3000/demo/
```

It's a plain static page ([`demo/index.html`](demo/index.html)) that consumes the
real `src/index.css` and the self-hosted fonts — the result panels are the library,
not a mockup.

## The contract (do not drift from this)

**One semantic class on the correct native element. State from native/ARIA attributes. `data-*` only for presentational variants.**

```html
<!-- identity = class · look-only variant = data-* · state = native/ARIA attrs -->
<button class="cf-btn">Read more</button>
<button class="cf-btn" data-variant="red">▸ RED · INDEX</button>
<button class="cf-btn" data-size="lg" disabled>Off air</button>

<a class="cf-link" href="/posts">POSTS</a>
<a class="cf-link" href="/about" aria-current="page">ABOUT</a>   <!-- persistent ▸ caret -->
```

- **Never** write state-modifier classes (`cf-btn--disabled`, `cf-btn--active`). Use the real `disabled` attribute, `:focus-visible`, `[aria-current]`, `[aria-pressed]`.
- **`data-variant`** is only for a presentational colour — any of the six named authentic colours (`red`/`green`/`yellow`/`blue`/`cyan`/`magenta`), plus the look-only `ghost` on a button and `nav` on a link. Each component decides how it paints that colour: the button fills, the card borders, the fastext key backgrounds. An unrecognised name renders the component's default, unstyled look. A **fastext bar** is still the four teletext keys (`red`/`green`/`yellow`/`blue`) — that is the domain, not a styling limit.
- No utility classes, no compound-class soup.

### States
- **Focus** (`:focus-visible`) → instant colour **inversion**. Transient; "the keyboard is here."
- **Selected** (`[aria-current="page"]`) → persistent **▸ caret**. "You are on this page."
- **Hover** → same inversion as focus (intentional).
- **Active** → instant `scale(.96)`, no colour ramp.

## Components

| Class | Element | Variants (`data-*`) | State |
|---|---|---|---|
| `cf-btn` | `<button>` / `<a>` | `variant` red/green/yellow/blue/ghost · `size` sm/md/lg | `:disabled`, `:focus-visible`, `:active` |
| `cf-link` | `<a>` | `variant="nav"` | `[aria-current="page"]` |
| `cf-card` | any block | `variant` red/green/yellow/blue/cyan/magenta | — |
| `cf-fastext` / `cf-fastext__key` | `<ul>` / `<a>` | `variant` red/green/yellow/blue | `:focus-visible` |
| `<cf-loader>` | Web Component | — | blink (reduced-motion aware) |
| `<cf-canvas>` | Web Component | `size` sm/md/lg/full | `alt` → `role="img"` |

### Pixel canvas (`<cf-canvas>`)

A render-only [custom element](./CONTEXT.md) that draws teletext-style **pixel art** on a `<canvas>` — headers, logos, scenes. Import it from the opt-in `./elements` export. The artwork is the element's **text content**: newline-separated rows of single-char palette codes.

```html
<script type="module">import "@peamlo/ceefax-ui/elements/cf-canvas";</script>

<cf-canvas alt="CEEFAX holidays — palm tree" data-size="md">
bbbbggbbbbggbbbbbbbb
bbggggggggggggbbbbbb
bbbgggggrgggggbbbbbb
bbbbbbbrbbbbbbbbbbbb
yyyyyyyyyyyyyyyyyyyy
</cf-canvas>
```

- **Palette codes:** `k` black · `r` red · `g` green · `y` yellow · `b` blue · `m` magenta · `c` cyan · `w` white · `.` (or space) transparent. Colours are the authentic `--cf-base-*` values; unknown codes render transparent (with a dev-console warning). Free per-pixel colour — no one-colour-per-cell limit.
- **Grid** dimensions are inferred from the text (ragged rows pad with transparent; common leading indentation is stripped — use `.` for intentional left-edge transparent pixels).
- **Sizing** is fluid and crisp (`image-rendering: pixelated`), capped at `--cf-content-max`. Pick a tier with `data-size` (`sm`/`md`/`lg`/`full`) or set an exact scale with the `--cf-pixels-scale` escape hatch (`style="--cf-pixels-scale: 8"` = 8 CSS px per pixel).
- **Accessibility:** provide `alt` for a meaningful image (→ `role="img"` + `aria-label`); omit it to mark the canvas decorative (`aria-hidden`).
- **Live edits** re-render automatically (the future paint-it-yourself editor builds on this).

See [ADR-0004](./docs/adr/0004-cf-canvas-pixel-art.md) for the reasoning.

## Tokens

Colour tokens come in two tiers, both under the `cf` namespace:

- **`--cf-base-*`** — the authentic 8 broadcast colours (`--cf-base-red`, …). Fixed and **never** remapped, so a theme cannot change them.
- **Semantic aliases** — every other `--cf-*` colour (`--cf-bg`, `--cf-fg`, `--cf-link`, `--cf-danger`, …). They say what a colour is *for*, and they are what themes remap.

Use the semantic aliases in your own CSS so it follows the active theme; reach for `--cf-base-*` only when you deliberately want the authentic colour whatever the theme (e.g. pixel art). The library's own component and layout stylesheets use semantic aliases only — CI enforces it.

Spacing is `ch`-based; radius is always `0`.

**Accessible theme (planned):** an opt-in `[data-theme="accessible"]` will remap only the `--cf-*` semantic aliases to WCAG-passing pairs, leaving `--cf-base-*` and the default authentic theme untouched.

## Develop

```sh
npm install
npm run storybook      # framework-agnostic Storybook (HTML mode) — play with every variant
npm run build          # PostCSS → dist/index.css + dist/tokens.css
```

Storybook uses `@storybook/html-vite` + the a11y and interactions addons, so stories show the exact HTML contract, run live WCAG checks, and can script keyboard/focus behaviour.

## Fonts

VT323 + Space Mono, self-hosted under SIL OFL 1.1. See [`fonts/README.md`](./fonts/README.md) to drop in the `.woff2` files.

## License

MIT (code) · SIL OFL 1.1 (bundled fonts).
