# ceefax-ui

A framework-agnostic, CSS-first design system whose look and language come from Ceefax / teletext. This is the glossary — the shared vocabulary for the project. It defines terms; it is not a spec and holds no implementation detail.

## Language

**The contract**:
The single rule the whole library is built around: one semantic class on the correct native element, state expressed through native/ARIA attributes, and `data-*` used only for presentational variants. Everything else follows from it.
_Avoid_: API, convention, guidelines

**Semantic class**:
A `cf-*` class that names what an element _is_ (`cf-btn`, `cf-link`, `cf-card`). Exactly one per element. The only class a consumer writes.
_Avoid_: utility class, component class, BEM block

**Presentational variant**:
A look-only difference selected with a `data-*` attribute (`data-variant="red"`, `data-size="lg"`). Never encodes state.
_Avoid_: modifier, `--modifier` class

**Variant seam**:
The single place a presentational variant name resolves to a colour — `--_variant` (the variant colour, read from the `--cf-variant-*` aliases) and `--_variant-ink` (the readable foreground on it, from the `--cf-on-variant*` aliases), declared once in the base layer. Components read them to paint; they never re-declare the mapping. It names no `--cf-base-*` token itself: the `--cf-variant-*` aliases default to the authentic colours and a theme remaps them.
_Avoid_: variant mixin, colour map, theme lookup

**Variant block**:
A surface filled with a presentational variant's colour — a fastext key, a coloured button. The readable foreground painted on it is its **ink** (black on light blocks, white on authentic blue; black on every block under the Accessible theme).
_Avoid_: swatch, colour chip

**State**:
A run-time condition of an element (disabled, focused, current). Always expressed with native or ARIA attributes (`disabled`, `:focus-visible`, `[aria-current]`, `[aria-pressed]`) — never with a class.
_Avoid_: state class, `cf-btn--active`, `is-active`

**Fastext**:
The four coloured navigation keys (red / green / yellow / blue) from teletext, and their component (`cf-fastext`). A domain term, not a generic nav bar.
_Avoid_: colour buttons, quick links

**Authentic colour**:
One of the eight original broadcast teletext colours, exposed as a `--cf-base-*` token (e.g. `--cf-base-red`). Fixed values that are **never** remapped. Together they form the **base tier** — the bottom token tier, beneath the semantic aliases. "Base" here means that tier — unrelated to the base stylesheet (`src/base.css`). Only the token layer and the Pixel canvas renderer (as a fallback behind `--cf-variant-*`) name these; CI fails if a component or layout stylesheet, or the Variant seam, does (ADR-0008, ADR-0010).
_Avoid_: brand colour, palette colour, `--ceefax-*` (the retired spelling)

**Semantic alias**:
Any other `--cf-*` colour token (e.g. `--cf-bg`, `--cf-danger`) — it maps meaning onto a colour (an authentic one by default; a theme may remap it). The only colour tier component, layout and Variant seam stylesheets reference. Includes the `--cf-variant-*` tier (the colour each `data-variant` name resolves to) and the `--cf-on-variant*` ink. Themes remap these; they never touch `--cf-base-*`.
_Avoid_: theme variable, colour variable

**Accessible theme**:
The opt-in `[data-theme="accessible"]` that remaps only the `--cf-*` semantic aliases to a colour-vision-deficiency-optimised, WCAG-AAA palette, leaving the `--cf-base-*` authentic colours and the default theme untouched (ADR-0010).
_Avoid_: high-contrast mode, a11y mode

**Inversion**:
The instant colour swap applied on `:focus-visible` and hover — "the keyboard is here." Transient, unlike the persistent selected caret.
_Avoid_: highlight, active style

**Selected caret**:
The persistent `▸` marker shown on `[aria-current="page"]` — "you are on this page." Distinct from inversion.
_Avoid_: active indicator, highlight

**Notice**:
The component for something the reader mustn't miss (`cf-notice`): a thick-bordered block with a short capitalised **flag** (`cf-notice__flag`) that flashes for a few seconds like teletext flash text, then holds solid. Danger by default, warning with `data-variant="yellow"`, success with `data-variant="green"`. A note, not a live-region alert; the flag's word is always repeated in the body.
_Avoid_: toast, banner, callout, live region

**Custom element**:
A logic-bearing standard Web Component (e.g. `<cf-loader>`), shipped under the opt-in `./elements` export — separate from the runtime-free CSS core.
_Avoid_: widget, framework component

**Pixel canvas**:
The render-only custom element (`<cf-canvas>`) that draws a Pixel grid as teletext-style pixel art on a `<canvas>`. A logic-bearing custom element, like `<cf-loader>`.
_Avoid_: image, sprite, bitmap component

**Pixel grid**:
The normalised in-memory model the Pixel canvas renderer draws: a width, a height, and one palette colour (or transparent) value per pixel. The only shape the renderer understands.
_Avoid_: bitmap, buffer, matrix

**Source adapter**:
Something that converts a raw input into a Pixel grid. The char-grid text adapter is the first; a future PNG or JSON source is another. All produce the same Pixel grid.
_Avoid_: loader, importer

**Palette code**:
A single character naming one of the eight teletext colours — or transparent — in the char-grid text of a Pixel canvas (`k r g y b m c w`, `.` = transparent).
_Avoid_: colour key, symbol, glyph

**Layout primitive**:
A single-purpose layout class that arranges its children (`cf-stack`, `cf-grid`, `cf-cluster`, `cf-center`, `cf-sidebar`). Generic and composable; unlike a component it carries no teletext identity of its own. Configured with presentational `data-*` and a CSS-variable escape hatch.
_Avoid_: layout component, wrapper, utility

**Stack**:
The layout primitive for vertical rhythm — children in a column separated by one consistent gap.
_Avoid_: flow, v-stack, column

**Cluster**:
The layout primitive for an inline group that wraps — tags, key rows, the fastext keys.
_Avoid_: inline, row, chips

**Grid**:
The layout primitive for responsive columns. Collapses on its **own** available width (never the viewport). `data-cols` caps the count; `--cf-grid-min` makes it intrinsic.
_Avoid_: row/col system, flexgrid

**Center**:
The layout primitive for a horizontally centred, width-constrained reading column (defaults to one teletext page wide).
_Avoid_: container, wrapper, measure

**Sidebar**:
The layout primitive for a fixed-width rail (`cf-sidebar__side`) beside a fluid main column (`cf-sidebar__main`) that wraps to a stack when space runs out.
_Avoid_: two-column, aside layout

**Page shell**:
The optional structural template (`cf-page` with `cf-page__header` / `__body` / `__footer` slots) that stacks a teletext page into header, body, and footer bands. Structure only — the look comes from tokens, not baked markup.
_Avoid_: layout, page component, template component

**Screen frame**:
The opt-in `data-frame` variant of the page shell: a 4:3 teletext set, as wide as fits the viewport and centred, with the type tokens scaled to the frame, header and footer pinned and only the body scrolling. Full-bleed below one narrow-viewport breakpoint. Presentational only; the ratio is tunable with `--cf-frame-ratio`.
_Avoid_: viewport, TV wrapper, `cf-screen`

## Project tooling

**Storybook preview**:
A throwaway published copy of the Storybook built from exactly one pull-request commit, made only when someone asks for it and deleted when the pull request closes or merges. It never follows later pushes: once the pull request has newer commits, the preview is **stale**, and asking again makes a new one.
_Avoid_: preview environment, deploy preview, review app, staging

**Release PR**:
The one pull request kept open, and kept up to date, while `main` has changes consumers would get. It holds the next version and its changelog, and merging it is the only manual step of a release.
_Avoid_: version-bump PR, release branch
