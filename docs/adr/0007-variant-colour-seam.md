# ADR-0007: One seam resolves a variant name to its colour

## Context

`data-variant="red"` means "the authentic red" on a button, a card border, and a
fastext key. That fact was written out three times — once per component — so adding an
authentic colour was an N-file edit and the copies could drift until a card border and
a fastext key disagreed about red. The per-component blocks were also nearly all
mapping and almost no component: each mostly restated the name→colour fact rather than
hiding it (issue #7).

## Decision

**The name→colour mapping lives once, in `src/base.css`.** A `[data-variant]` value
resolves to two inherited custom properties — `--_variant` (the authentic colour) and
`--_variant-ink` (the readable foreground on it) — and each component reads them to
express only _how_ it paints: the button fills background + ink + border, the card
paints the border, the fastext key paints its background. Adding an authentic colour is
now one line; a new component opts into variants by reading `--_variant`, with no
mapping to copy.

The seam is pure cascade — no export, no runtime. It maps onto `--ceefax-*` authentic
colours and leaves the `--cf-*` semantic aliases untouched, so the accessible theme
(#12) still remaps only `--cf-*`.

## Consequences

- **This is a third, cross-module property tier, and that is the trade.** `--_bg` /
  `--_fg` / `--_bd` were declared and consumed inside one file; `--_variant` is declared
  in `base.css` and read by three components. CONTEXT.md's "`--cf-*` is the only layer
  components reference" now carries one sanctioned exception, recorded there: it is the
  seam, not the component, that names `--ceefax-*`. We took that over three copies of
  the mapping.
- **Components must match `[data-variant]` on themselves.** `--_variant` inherits, so a
  component that read it unguarded would colour itself from an ancestor — a plain button
  inside a red card would turn red. The guard is the component's own attribute selector.
- **Every read needs a `var()` fallback.** A name the seam has no row for — a consumer
  typo, or a look-only variant — sets neither property. An unresolved `var()` inside the
  `border` _shorthand_ is invalid at computed-value time and resets every border
  longhand, which turned a typo into an invisible, border-less button. Each component
  therefore reads `var(--_variant, <its own default>)`. This also fixed a latent bug in
  the card, which previously fell back to `currentColor` and would have diverged from
  `--cf-border` as soon as the accessible theme remapped it.
- **Non-colour variants stay local and stay last.** `ghost` (button), `nav` (link) and
  `character` (checkbox and radio, [ADR-0020](0020-native-form-controls-appearance-none.md))
  get no `--_variant`; a component rule matching one must sit _after_ the component's
  generic `[data-variant]` rule, since both have the same specificity and order decides.
- **The accepted variant surface widened.** Because a component matches `[data-variant]`
  rather than enumerating names, every component with variants now accepts all six
  authentic colours — the button and the fastext key previously ignored `cyan` and
  `magenta`. This is the seam working as intended ("a new colour costs nothing"), but it
  is a real change to the documented contract, recorded in `README.md` and `AGENTS.md`.
  Markup using the previously documented values renders exactly as before.
- Pinned by the `Foundations/Variant colours` stories, which assert the computed colour
  of every (component × variant) pair, the unmapped-name fallback, and the nesting case
  (ADR-0006).
