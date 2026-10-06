# ADR-0008: Authentic colours are `--cf-base-*`, and CI enforces the token layering

## Context

Colour tokens had two prefixes: `--ceefax-*` for the eight authentic broadcast colours and
`--cf-*` for semantic aliases. The split is deliberate — authentic colours are never
remapped, aliases are what themes remap — but the names didn't say so: on a single read
they looked like two unrelated naming styles. And the rule that gives the split its value
("components reference only aliases") was prose only; it had already drifted (component
stylesheets named authentic colours directly), which would have stopped the accessible
theme (#12) from re-colouring them. Issue #24.

## Decision

**Rename the authentic tier to `--cf-base-*` and enforce the layering with a guard story.**
Every colour token now lives in the one `cf` namespace, with the tier spelled out:
`--cf-base-*` is the fixed palette, every other `--cf-*` colour is a semantic alias. No
`--ceefax-*` aliases were kept: the package was `0.1.0` and unpublished, so there was no
consumer to protect.

The `Foundations/Token layering` story reads every component and layout stylesheet's
source and fails if any names `--cf-base-*` (or if it finds no files). It runs in the
storybook-tests CI job beside the palette-drift guard (ADR-0006). The only places allowed
to name the base tier are the token layer, the pixel canvas renderer (ADR-0004), and —
until #12 points it at a remappable `--cf-variant-*` tier — the variant seam's `--_variant`
(ADR-0007). The ink on a variant block is already an alias: `--cf-variant-ink` (on light
blocks) and `--cf-variant-ink-on-dark` (on authentic blue), so a theme sets it
declaratively.

## Considered options

- **`--cf-authentic-*`** — matches the glossary term exactly, but longer; the maintainer
  preferred the shorter `base`.
- **`--cf-raw-*`** — clear, but a new term the glossary didn't have.
- **Keep `--ceefax-*`, document harder** — leaves the "why two prefixes?" question to be
  asked again.
- **A standalone lint script** — simpler, but a second test surface beside the stories.

## Consequences

- "Base" also names the base stylesheet (`src/base.css`). Accepted: the token is always
  `--cf-base-<colour>`, and the glossary calls out the difference.
- **An explicit exception to ADR-0006**, which aims assertions at rendered DOM and
  computed styles, never internals. The guard reads stylesheet *source*, because the rule
  is about what the source names — rendered output can't show which tier a colour came
  through. Rendered colours stay pinned by `Foundations/Variant colours`.
- The fastext key's ink fallbacks now read `--cf-variant-ink` instead of naming black.
- Accepted ADRs 0004 and 0007 still say `--ceefax-*`; read it as `--cf-base-*`.
