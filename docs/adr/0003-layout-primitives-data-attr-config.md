# ADR-0003: Layout primitives — data-attribute config + intrinsic responsive grid

## Context

`ceefax-ui` needs a layout system for its consumers (Astro blogs, docs sites, a
portfolio). The library already ships layout _tokens_ but no layout _components_,
so every consumer hand-rolls flex/grid. A layout system is where design systems
usually break their own rules — reaching for a utility-class soup (`.gap-3`,
`.cols-2`, `.flex-wrap`) that [the contract](../../README.md#the-contract-do-not-drift-from-this)
and [ADR-0001](0001-css-first-no-js-runtime.md) explicitly reject.

Two questions had genuine alternatives:

1. **How is a layout configured** without utility classes? Options were CSS
   custom properties only (the "Every Layout" style — flexible but verbose and
   undiscoverable), enumerated `data-*` only (clean but a hard wall when you need
   an in-between value), or both.
2. **How does `cf-grid` stay responsive** with no JS and no consumer-authored
   media queries? Options were viewport media queries (simple, but a grid nested
   in a narrow column stays multi-column and overflows), literal container
   queries (correct but needs `container-type` plumbing), or an intrinsic
   percentage-based track formula.

## Decision

**Config = enumerated `data-*` for the common case + a CSS-variable escape hatch.**
`data-gap`, `data-cols`, `data-align`, `data-side`, `data-max` cover the 90% path
with readable, discoverable, contract-blessed presentational attributes; a matching
`--cf-*` custom property (`--cf-gap`, `--cf-grid-min`, `--cf-sidebar-side`, …) takes
over whenever a continuous or off-scale value is needed. No utility classes, no
state in classes — the contract holds.

**`cf-grid` collapses on its own available width, query-free.** The column track is
`minmax(min(var(--cf-grid-min,100%),100%),1fr)`; `data-cols="N"` sets `--cf-grid-min`
to `max(--cf-grid-floor, (100% - (N-1)·gap)/N)`. The proportional share caps the count
at N when the grid is wide; the absolute floor (default `20ch`) makes `auto-fill` drop
columns once each would get too narrow — a purely proportional min would keep N columns
at every width and merely cram them. Because the percentage resolves against the grid's
own inline size, the grid reflows on the space _it_ has — correct even nested inside a
`cf-sidebar` column — with **no `@container`, no `container-type`, and no media query**,
and therefore no browser-support caveats.

## Consequences

- One `data-*` → token resolver (`src/layout/_shared.css`) serves every primitive,
  so the config vocabulary is uniform and DRY.
- The chosen grid formula realises the "collapse on the grid's own width" behaviour
  without container queries. If a future need genuinely requires `@container`
  (e.g. changing more than track count at a breakpoint), it is a localised swap and
  should get its own note — the consumer-facing `data-cols` API would not change.
- This sets the pattern for **all** future layout additions: reach for an enumerated
  `data-*` first, add a `--cf-*` escape hatch second, and never a utility class.
