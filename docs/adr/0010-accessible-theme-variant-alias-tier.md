# ADR-0010: The accessible theme remaps a `--cf-variant-*` alias tier, never the base colours

## Context

The authentic palette fails WCAG (authentic blue is 2.44:1 on black) and pairs `danger = red`
with `success = green`, the textbook red–green confusion. Issue #12 adds an opt-in
accessible theme. The variant seam ([ADR-0007](0007-variant-colour-seam.md)) pointed straight
at `--cf-base-*`, so a theme could only re-colour `data-variant` blocks by remapping the base
tier — making `--cf-base-red` mean "amber" inside the theme and breaking the invariant
[ADR-0008](0008-cf-base-token-tier.md) exists to protect.

## Decision

**A `--cf-variant-{red,green,yellow,blue,magenta,cyan}` alias tier sits between the seam and
the base colours**, each defaulting to its `--cf-base-*` colour so the default theme renders
exactly as before. The seam reads `--cf-variant-*`; the theme is one
`[data-theme="accessible"]` block in `src/tokens/colors.css` that remaps aliases only — the
variant tier, the semantic aliases, and the blue block's ink (`--cf-on-variant-dark` → black,
since every accessible block is light). Pure cascade ([ADR-0001](0001-css-first-no-js-runtime.md)),
so the attribute works on `<html>` or any subtree.

The palette is CVD-optimised (Okabe–Ito-inspired): every colour ≥ 7:1 on black, `danger`/
`success` split on the blue–yellow axis (amber vs teal).

This tier is the smallest handle that lets the theme re-colour variants without remapping
the base tier — not future-proofing. That further themes become one more block over the same
aliases is a side effect.

## Considered options

- **Remap `--cf-base-*` inside the theme** — no new tokens, but an "authentic" colour would
  stop being authentic, and pixel art (ADR-0004) would silently change colour.
- **Per-component overrides in the theme block** — duplicates the mapping ADR-0007 removed.

## Consequences

- The seam names no base token any more, so ADR-0008's seam exception is closed: the
  `Foundations/Token layering` guard now scans `src/base.css` too. Where accepted ADRs 0007
  and 0008 say the seam names the base tier, read it as "names `--cf-variant-*`".
- Guarded by `Foundations/Accessible theme` (every themed colour ≥ 7:1 on the background,
  resolved in a themed subtree, and the ink on every rendered variant button ≥ 7:1), the accessible half of `Foundations/Variant colours` (applied on a
  subtree), and a second axe pass with AAA contrast on every `Components/*` story under the
  theme.
- Storybook gains a Theme toolbar and the demo page a switch; both set the same attribute.
