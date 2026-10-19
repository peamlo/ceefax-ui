# ADR-0009: The 4:3 screen frame is a `data-frame` variant of the page shell

## Context

A teletext page should sit in a 4:3 screen whose type scales with it (issue #27). The issue sketched a new `cf-screen` element. No HTML element means "framed screen", and the frame is purely presentational — which [the contract](../../README.md#the-contract-do-not-drift-from-this) assigns to `data-*` — so a new class would also cut against the classless direction (#26).

## Decision

**`data-frame` on the page shell** (`.cf-page[data-frame]`), not a new primitive. Pure CSS ([ADR-0001](0001-css-first-no-js-runtime.md)); the escape hatch is `--cf-frame-ratio` (default `1.3333`), per [ADR-0003](0003-layout-primitives-data-attr-config.md).

- **Type scales with a width property, not `cqw`.** `cqw` resolves against the *ancestor* container, never the element that is itself the container, so scaling the frame's own type would need a wrapper. A private `--_w` (`min(100vw, 100dvh × ratio)`) drives the type tokens (body, small, caption, heading) on the one element, with no `container-type` plumbing.
- **One breakpoint** (`min-width:40em`, a literal because `@media` cannot read custom properties). Below it the frame rules are not applied at all: the page is full-bleed at the fixed token sizes.
- **Scroll region:** the body scrolls, header/footer stay pinned; consumers give the body `tabindex="0"`.

## Consequences

- `Layout/Screen` is the first `Layout/*` story in the CI gate (it runs axe too). [ADR-0006](0006-stories-are-the-test-surface.md) kept the Layout *documentation* stories out because they hang the runner; this one asserts a contract (aspect ratio, pinned slots, full-bleed fallback), so it is gated, by path.
- Other ratios need only `--cf-frame-ratio`; a `data-ratio` enumeration can be added later without breaking this API.
