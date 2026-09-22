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
express only *how* it paints: the button fills background + ink + border, the card
paints the border, the fastext key paints its background. Adding an authentic colour is
now one line; a new component opts into variants by reading `--_variant`, with no
mapping to copy.

The seam is pure cascade — no new token tier, no export, no runtime. It maps onto
`--ceefax-*` authentic colours and does not touch the `--cf-*` semantic aliases, so the
accessible theme (#12) still remaps only `--cf-*`.

## Consequences

- **Components must match `[data-variant]` on themselves.** `--_variant` inherits, so a
  component that reads it unguarded would colour itself from an ancestor — a plain
  button inside a red card would turn red. The guard is the component's own attribute
  selector, not a reset.
- **Non-colour variants stay local and stay last.** `ghost` (button) and `nav` (link)
  get no `--_variant` from the seam; a component rule matching one must sit *after* the
  component's generic `[data-variant]` rule, since both have the same specificity and
  order decides.
- The seam matches any element carrying `data-variant`, not only `cf-*` ones. It only
  sets two private custom properties that nothing outside the library reads, and the
  alternative — repeating the `cf-*` namespace match on every colour — costs more than
  it protects. Same reasoning as the box-sizing reset (ADR/issue #10).
- The consumer contract is unchanged: `data-variant="red"` renders exactly what it did
  before. Pinned by the `Foundations/Variant colours` story, which asserts the computed
  colour of every (component × variant) pair (ADR-0006).
