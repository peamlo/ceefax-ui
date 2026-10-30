# ADR-0017: A band is a background attribute plus an ink alias tier the theme can collapse

## Context

On text parts (the header-row parts, table zones) `data-variant` names the text colour. A
band needs a background and an ink on the same element, which one attribute can't carry. A
row-level variable per part was rejected (PR #93). Under the Accessible theme every colour
is light, so a consumer-chosen coloured ink on a band fails contrast.

## Decision

`data-band="<colour>"` names the background. On a banded element `data-variant` is the ink
override. The variant seam ([ADR-0007](0007-variant-colour-seam.md)) gains six band rows
(`--_band`, `--_band-ink`), and each existing variant row gains `--_ink-pick`, read from a new
`--cf-ink-*` alias tier that defaults to `--cf-variant-*`. The Accessible theme remaps
`--cf-ink-*` to `--cf-on-variant`, so every band's ink is black there
([ADR-0010](0010-accessible-theme-variant-alias-tier.md)'s aliases-only rule holds).

The pick is folded into `--_band-ink` in the seam (`var(--_ink-pick, <default ink>)`), and
a banded element first clears the band properties it inherited. So a component opts in with
**one** rule on parts whose `data-variant` is a text colour —
`[data-band] { background: var(--_band, …); color: var(--_band-ink, var(--_variant, …)) }` —
and blocks never take `data-band`. The fastext key is a text part (its `data-variant` is the
label colour), so it takes bands; a banded key is the filled fastext look (#120). The issue's draft had a second
`[data-band][data-variant]` rule reading `--_ink-pick` directly; it painted the themed ink
even when the band was a typo, which under the Accessible theme is black on the black page.

## Considered options

- **A compound variant value** (`yellow-on-blue`) — 6 × 6 names.
- **A row-level ink variable** — rejected in PR #93; colour config belongs on each part.
- **A theme rule that ignores the ink on bands** — breaks ADR-0010's aliases-only rule.
- **A pair allow-list in the seam** — 6 × 6 rows, and silently overrides the consumer.
- **A PostCSS loop to generate rows** — hides what ships.

## Consequences

- Band × ink is additive: a new colour costs one line per tier.
- Under the Accessible theme the ink override is ignored on screen, by design, like
  `--cf-on-variant-dark` collapsing to black.
- In the default theme a consumer can write a failing pair. The README and the
  `Foundations/Colors` Bands story document the passing ones.
- More inherited seam properties; the self-attribute guard and the `var()` fallback rules of
  ADR-0007 apply unchanged, and the band reset keeps a nested typo band unbanded.
- Pinned by `Foundations/Variant colours`, `Foundations/Accessible theme`, the Bands story,
  `Components/Header row` and `Components/Fastext bar`.
