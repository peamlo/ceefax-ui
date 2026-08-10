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

**State**:
A run-time condition of an element (disabled, focused, current). Always expressed with native or ARIA attributes (`disabled`, `:focus-visible`, `[aria-current]`, `[aria-pressed]`) — never with a class.
_Avoid_: state class, `cf-btn--active`, `is-active`

**Fastext**:
The four coloured navigation keys (red / green / yellow / blue) from teletext, and their component (`cf-fastext`). A domain term, not a generic nav bar.
_Avoid_: colour buttons, quick links

**Authentic colour**:
One of the eight original broadcast teletext colours, exposed as a `--ceefax-*` token. Fixed values that are **never** remapped.
_Avoid_: brand colour, palette colour

**Semantic alias**:
A `--cf-*` token that maps meaning (e.g. surface, accent) onto an authentic colour. The **only** token layer components reference. Themes remap these; they never touch `--ceefax-*`.
_Avoid_: theme variable, colour variable

**Accessible theme**:
The planned opt-in `[data-theme="accessible"]` that remaps only the `--cf-*` semantic aliases to WCAG-passing pairs, leaving the authentic colours and default theme untouched.
_Avoid_: high-contrast mode, a11y mode

**Inversion**:
The instant colour swap applied on `:focus-visible` and hover — "the keyboard is here." Transient, unlike the persistent selected caret.
_Avoid_: highlight, active style

**Selected caret**:
The persistent `▸` marker shown on `[aria-current="page"]` — "you are on this page." Distinct from inversion.
_Avoid_: active indicator, highlight

**Custom element**:
A logic-bearing standard Web Component (e.g. `<cf-loader>`), shipped under the opt-in `./elements` export — separate from the runtime-free CSS core.
_Avoid_: widget, framework component

**Pixel canvas**:
The render-only custom element (`<cf-canvas>`) that draws a Pixel grid as teletext-style pixel art on a `<canvas>`. A logic-bearing custom element, like `<cf-loader>`.
_Avoid_: image, sprite, bitmap component

**Pixel grid**:
The normalised in-memory model the Pixel canvas renderer draws: a width, a height, and one authentic-colour (or transparent) value per pixel. The only shape the renderer understands.
_Avoid_: bitmap, buffer, matrix

**Source adapter**:
Something that converts a raw input into a Pixel grid. The char-grid text adapter is the first; a future PNG or JSON source is another. All produce the same Pixel grid.
_Avoid_: loader, importer

**Palette code**:
A single character naming one authentic colour — or transparent — in the char-grid text of a Pixel canvas (`k r g y b m c w`, `.` = transparent).
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
